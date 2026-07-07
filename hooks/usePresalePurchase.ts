"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useBalance,
  useConfig,
  useReadContract,
  useSendCalls,
  useWriteContract,
} from "wagmi";
import { sendTransaction, waitForCallsStatus, waitForTransactionReceipt } from "@wagmi/core";
import { base } from "wagmi/chains";
import { parseUnits, UserRejectedRequestError, type Address } from "viem";
import { BUY_FLOW_COPY, USDC_BASE } from "@/lib/onramp/constants";
import { useAtomicBatchSupport } from "@/hooks/useAtomicBatchSupport";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSwapQuote } from "@/hooks/useSwapQuote";
import { usePresaleRemainingCap } from "@/hooks/usePresaleReads";
import { isWalletConnectConnector } from "@/lib/wagmi/connectors";
import {
  build0xConvertCalls,
  build0xFullBatchCalls,
  buildUsdcPurchaseCalls,
  ERC20_ABI,
  getPresaleContract,
  getStepLabels,
  PRESALE_ABI,
  type PurchaseCall,
  type PurchasePhase,
} from "@/lib/onramp/presale-contract";
import { getPaymentToken, type PaymentTokenId } from "@/lib/onramp/payment-tokens";
import type { SwapQuoteResponse } from "@/lib/onramp/swap-quote-types";

export type PurchaseExecutionPhase = "idle" | "awaiting_wallet" | "confirming" | "done" | "error";

export type PurchaseExecutionState = {
  phase: PurchaseExecutionPhase;
  stepIndex: number;
  stepLabels: string[];
  currentLabel: string;
  txHash?: `0x${string}`;
  batchId?: string;
  error?: string;
  awaitingWalletApp: boolean;
};

/** Contexto de ejecución congelado al iniciar — evita usar estado React caducado. */
type ExecContext = {
  minBuy: bigint;
  sellAmt?: bigint;
  allowanceTarget?: Address;
};

function isUserRejection(error: unknown): boolean {
  if (error instanceof UserRejectedRequestError) return true;
  if (error instanceof Error) {
    const t = error.message.toLowerCase();
    return t.includes("user rejected") || t.includes("user denied") || t.includes("rejected");
  }
  return false;
}

function mapContractError(error: unknown): string {
  if (!(error instanceof Error)) return BUY_FLOW_COPY.compraGenericError;

  const msg = error.message;
  if (msg === "PRESALE_CONTRACT_MISSING") return BUY_FLOW_COPY.compraContractMissing;
  if (msg === "QUOTE_EXPIRED") return BUY_FLOW_COPY.compraQuoteExpired;
  if (msg === "CAP_EXCEEDED") return BUY_FLOW_COPY.compraCapExceeded;
  if (msg === "QUOTE_FAILED") return BUY_FLOW_COPY.compraQuoteFallback;
  if (msg === "WRONG_NETWORK") return BUY_FLOW_COPY.compraWrongNetwork;
  if (msg === "INSUFFICIENT_USDC") return BUY_FLOW_COPY.compraInsufficientUsdc;
  if (msg === "BATCH_FAILED") return BUY_FLOW_COPY.compraBatchFailed;
  if (msg.startsWith("INSUFFICIENT_SELL:")) {
    return BUY_FLOW_COPY.compraInsufficientSell(msg.split(":")[1] ?? "el token");
  }
  if (isUserRejection(error)) return BUY_FLOW_COPY.compraUserRejected;

  const t = msg.toLowerCase();
  if (t.includes("insufficient funds")) return BUY_FLOW_COPY.compraGasInsufficient;
  if (t.includes("exceeds balance") || t.includes("insufficient balance") || t.includes("transfer amount exceeds")) {
    return BUY_FLOW_COPY.compraInsufficientUsdc;
  }

  if (process.env.NODE_ENV === "development") {
    console.error("[compra] error sin mapear:", error);
  }
  return BUY_FLOW_COPY.compraGenericError;
}

const INITIAL_EXEC_STATE: PurchaseExecutionState = {
  phase: "idle",
  stepIndex: 0,
  stepLabels: [],
  currentLabel: "",
  awaitingWalletApp: false,
};

export function usePresalePurchase() {
  const config = useConfig();
  // chainId de useAccount() refleja la red REAL de la wallet (useChainId devuelve la de la config).
  const { address, connector, chainId: walletChainId } = useAccount();
  const onBase = walletChainId === base.id;
  const { supportsBatch, isLoading: capsLoading } = useAtomicBatchSupport();
  const { sendCallsAsync } = useSendCalls();
  const { writeContractAsync } = useWriteContract();

  const [paymentTokenId, setPaymentTokenId] = useState<PaymentTokenId>("USDC");
  const [amountInput, setAmountInput] = useState("10");
  const [flowPhase, setFlowPhase] = useState<PurchasePhase>("purchase");
  const [quoteFallback, setQuoteFallback] = useState(false);
  const [state, setState] = useState<PurchaseExecutionState>(INITIAL_EXEC_STATE);

  const paymentToken = getPaymentToken(paymentTokenId);
  const completedLabelsRef = useRef<Set<string>>(new Set());
  const storedMinBuyRef = useRef<bigint | undefined>(undefined);
  const storedQuoteRef = useRef<SwapQuoteResponse | undefined>(undefined);
  const isWalletConnect = isWalletConnectConnector(connector?.id);

  // Debounce: una cotización por importe estable, no por tecla.
  const debouncedInput = useDebouncedValue(amountInput, 500);

  const sellAmount = useMemo(() => {
    const normalized = debouncedInput.trim().replace(",", ".");
    const n = Number(normalized);
    if (!normalized || Number.isNaN(n) || n <= 0) return undefined;
    return parseUnits(normalized, paymentToken.decimals);
  }, [debouncedInput, paymentToken.decimals]);

  const { quote, isLoading: quoteLoading, isExpired, expiresInSec, quoteFailed, refetch: refetchQuote } = useSwapQuote({
    paymentToken,
    sellAmount,
    enabled: paymentTokenId !== "USDC" && !quoteFallback && flowPhase !== "purchase_after_convert",
  });

  const { data: remainingCap } = usePresaleRemainingCap();
  const allowanceTarget = quote?.allowanceTarget;

  // ── Balances ──
  const { data: nativeBalance } = useBalance({
    address,
    chainId: base.id,
    query: { enabled: Boolean(address && paymentToken.isNative) },
  });

  const { data: erc20SellBalance } = useReadContract({
    address: paymentToken.isNative ? undefined : paymentToken.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: { enabled: Boolean(address && !paymentToken.isNative) },
  });

  const sellBalance = paymentToken.isNative ? nativeBalance?.value : erc20SellBalance;

  const { data: usdcBalance } = useReadContract({
    address: USDC_BASE.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: { enabled: Boolean(address) },
  });

  // ── Allowances ──
  const { data: usdcAllowance, refetch: refetchUsdcAllowance } = useReadContract({
    address: USDC_BASE.address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && getPresaleContract() ? [address, getPresaleContract()!] : undefined,
    chainId: base.id,
    query: { enabled: Boolean(address && getPresaleContract()) },
  });

  const { data: sellAllowance, refetch: refetchSellAllowance } = useReadContract({
    address: paymentToken.isNative ? undefined : paymentToken.address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args:
      address && allowanceTarget && !paymentToken.isNative ? [address, allowanceTarget] : undefined,
    chainId: base.id,
    query: {
      enabled: Boolean(address && allowanceTarget && !paymentToken.isNative && paymentTokenId !== "USDC"),
    },
  });

  const minBuyAmount = useMemo(() => {
    if (paymentTokenId === "USDC") return sellAmount;
    if (flowPhase === "purchase_after_convert" && storedMinBuyRef.current) {
      return storedMinBuyRef.current;
    }
    if (!quote?.minBuyAmount) return undefined;
    return BigInt(quote.minBuyAmount);
  }, [paymentTokenId, sellAmount, quote?.minBuyAmount, flowPhase]);

  const openQuoteAmount = minBuyAmount;

  const needsUsdcApprove = useMemo(() => {
    if (!minBuyAmount || usdcAllowance === undefined) return true;
    return usdcAllowance < minBuyAmount;
  }, [minBuyAmount, usdcAllowance]);

  const needsSellApprove = useMemo(() => {
    if (paymentToken.isNative || paymentTokenId === "USDC") return false;
    if (!sellAmount || !allowanceTarget || sellAllowance === undefined) return true;
    return sellAllowance < sellAmount;
  }, [allowanceTarget, paymentToken.isNative, paymentTokenId, sellAllowance, sellAmount]);

  const effectiveFlowPhase: PurchasePhase =
    paymentTokenId === "USDC" ? "purchase" : supportsBatch ? "purchase" : flowPhase;

  const stepLabels = useMemo(
    () =>
      getStepLabels({
        paymentToken,
        supportsBatch,
        phase: effectiveFlowPhase,
        needsUsdcApprove,
        needsSellApprove,
      }),
    [effectiveFlowPhase, needsSellApprove, needsUsdcApprove, paymentToken, supportsBatch]
  );

  // ── Validaciones ──
  const validateNetwork = useCallback(() => {
    if (!onBase) throw new Error("WRONG_NETWORK");
  }, [onBase]);

  const validateCap = useCallback(
    (amount: bigint) => {
      if (remainingCap !== undefined && amount > remainingCap) throw new Error("CAP_EXCEEDED");
    },
    [remainingCap]
  );

  const validateQuoteFresh = useCallback((q: SwapQuoteResponse | undefined): SwapQuoteResponse => {
    if (!q) throw new Error("QUOTE_FAILED");
    if (Date.now() >= q.expiresAt) throw new Error("QUOTE_EXPIRED");
    return q;
  }, []);

  const validateSellBalance = useCallback(
    (amt: bigint) => {
      if (sellBalance !== undefined && amt > sellBalance) {
        throw new Error(`INSUFFICIENT_SELL:${paymentToken.symbol}`);
      }
    },
    [paymentToken.symbol, sellBalance]
  );

  const validateUsdcBalance = useCallback(
    (amt: bigint) => {
      if (usdcBalance !== undefined && amt > usdcBalance) throw new Error("INSUFFICIENT_USDC");
    },
    [usdcBalance]
  );

  // ── Ejecución ──
  const executeCall = useCallback(
    async (call: PurchaseCall, ctx: ExecContext) => {
      if (!address) throw new Error("WALLET_OR_AMOUNT_MISSING");
      const presale = getPresaleContract();
      if (!presale) throw new Error("PRESALE_CONTRACT_MISSING");

      switch (call.label) {
        case "approve_usdc":
          return writeContractAsync({
            address: USDC_BASE.address,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [presale, ctx.minBuy],
            chainId: base.id,
          });
        case "approve_sell":
          if (!ctx.allowanceTarget || !ctx.sellAmt) throw new Error("QUOTE_FAILED");
          return writeContractAsync({
            address: paymentToken.address,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [ctx.allowanceTarget, ctx.sellAmt],
            chainId: base.id,
          });
        case "swap_0x":
          return sendTransaction(config, {
            account: address,
            to: call.to,
            data: call.data,
            value: call.value,
            chainId: base.id,
          });
        case "buy":
          return writeContractAsync({
            address: presale,
            abi: PRESALE_ABI,
            functionName: "buy",
            args: [ctx.minBuy],
            chainId: base.id,
          });
        default:
          throw new Error(`Paso desconocido: ${call.label}`);
      }
    },
    [address, config, paymentToken.address, writeContractAsync]
  );

  const executeSequential = useCallback(
    async (calls: PurchaseCall[], labels: string[], ctx: ExecContext) => {
      let lastHash: `0x${string}` | undefined;

      // Iteramos sobre TODAS las calls para que stepIndex coincida con labels,
      // saltando las ya completadas (reintentos).
      for (let i = 0; i < calls.length; i++) {
        const call = calls[i]!;
        if (completedLabelsRef.current.has(call.label)) continue;

        setState({
          phase: "awaiting_wallet",
          stepIndex: i,
          stepLabels: labels,
          currentLabel: labels[i] ?? call.label,
          awaitingWalletApp: isWalletConnect,
        });

        const hash = await executeCall(call, ctx);
        lastHash = hash;
        setState((s) => ({ ...s, phase: "confirming", txHash: hash, awaitingWalletApp: false }));
        await waitForTransactionReceipt(config, { hash, chainId: base.id });
        completedLabelsRef.current.add(call.label);
      }

      return lastHash;
    },
    [config, executeCall, isWalletConnect]
  );

  const executeBatch = useCallback(
    async (calls: PurchaseCall[], batchLabel: string) => {
      setState({
        phase: "awaiting_wallet",
        stepIndex: 0,
        stepLabels: [batchLabel],
        currentLabel: batchLabel,
        awaitingWalletApp: isWalletConnect,
      });

      const result = await sendCallsAsync({
        calls: calls.map((c) => ({
          to: c.to,
          data: c.data,
          ...(c.value ? { value: c.value } : {}),
        })),
        chainId: base.id,
      });

      setState((s) => ({ ...s, phase: "confirming", batchId: result.id, awaitingWalletApp: false }));

      const status = await waitForCallsStatus(config, { id: result.id });
      if (status.status !== "success") throw new Error("BATCH_FAILED");

      const receiptHash = status.receipts?.at(-1)?.transactionHash;
      calls.forEach((c) => completedLabelsRef.current.add(c.label));
      return receiptHash;
    },
    [config, isWalletConnect, sendCallsAsync]
  );

  // ── Fase A (EOA): convertir a USDC ──
  const startConvert = useCallback(
    async (freshQuote?: SwapQuoteResponse) => {
      if (!address || !sellAmount || paymentTokenId === "USDC") return;

      try {
        validateNetwork();
        const q = validateQuoteFresh(freshQuote ?? quote);
        if (!q.allowanceTarget) throw new Error("QUOTE_FAILED");

        validateCap(BigInt(q.minBuyAmount));
        validateSellBalance(sellAmount);

        storedQuoteRef.current = q;
        storedMinBuyRef.current = BigInt(q.minBuyAmount);

        const { data: freshSell } = await refetchSellAllowance();
        const freshSellApprove = paymentToken.isNative
          ? false
          : freshSell !== undefined
            ? freshSell < sellAmount
            : needsSellApprove;

        const calls = build0xConvertCalls({
          sellToken: paymentToken,
          sellAmount,
          needsSellApprove: freshSellApprove,
          allowanceTarget: q.allowanceTarget,
          quote: q,
        });

        const labels = getStepLabels({
          paymentToken,
          supportsBatch: false,
          phase: "convert",
          needsUsdcApprove: false,
          needsSellApprove: freshSellApprove,
        });

        await executeSequential(calls, labels, {
          minBuy: BigInt(q.minBuyAmount),
          sellAmt: sellAmount,
          allowanceTarget: q.allowanceTarget,
        });

        setFlowPhase("purchase_after_convert");
        completedLabelsRef.current = new Set();
        setState(INITIAL_EXEC_STATE);
      } catch (error) {
        if (error instanceof Error && (error.message === "QUOTE_FAILED" || error.message.includes("liquidez"))) {
          setQuoteFallback(true);
        }
        setState((s) => ({ ...s, phase: "error", error: mapContractError(error), awaitingWalletApp: false }));
      }
    },
    [
      address,
      executeSequential,
      needsSellApprove,
      paymentToken,
      paymentTokenId,
      quote,
      refetchSellAllowance,
      sellAmount,
      validateCap,
      validateNetwork,
      validateQuoteFresh,
      validateSellBalance,
    ]
  );

  // ── Compra principal ──
  const startPurchase = useCallback(
    async (freshQuote?: SwapQuoteResponse) => {
      if (!address || !sellAmount) return;
      if (!getPresaleContract()) {
        setState((s) => ({ ...s, phase: "error", error: BUY_FLOW_COPY.compraContractMissing }));
        return;
      }

      // EOA con token distinto de USDC: primero la fase de conversión.
      if (paymentTokenId !== "USDC" && !supportsBatch && effectiveFlowPhase === "convert") {
        await startConvert(freshQuote);
        return;
      }

      try {
        validateNetwork();

        const usesQuote = paymentTokenId !== "USDC" && effectiveFlowPhase !== "purchase_after_convert";
        let q: SwapQuoteResponse | undefined;
        let localMinBuy: bigint;

        if (paymentTokenId === "USDC") {
          localMinBuy = sellAmount;
        } else if (effectiveFlowPhase === "purchase_after_convert") {
          if (!storedMinBuyRef.current) throw new Error("QUOTE_FAILED");
          localMinBuy = storedMinBuyRef.current;
        } else {
          q = validateQuoteFresh(freshQuote ?? quote);
          storedQuoteRef.current = q;
          localMinBuy = BigInt(q.minBuyAmount);
        }

        validateCap(localMinBuy);

        if (usesQuote) {
          validateSellBalance(sellAmount);
        } else {
          validateUsdcBalance(localMinBuy);
        }

        const { data: freshUsdc } = await refetchUsdcAllowance();
        const freshUsdcApprove = freshUsdc !== undefined ? freshUsdc < localMinBuy : needsUsdcApprove;

        let freshSellApprove = false;
        if (usesQuote && !paymentToken.isNative) {
          const { data: freshSell } = await refetchSellAllowance();
          freshSellApprove = freshSell !== undefined ? freshSell < sellAmount : needsSellApprove;
        }

        completedLabelsRef.current = new Set(
          [...completedLabelsRef.current].filter((label) => {
            if (label === "approve_usdc" && !freshUsdcApprove) return false;
            if (label === "approve_sell" && !freshSellApprove) return false;
            return true;
          })
        );

        let calls: PurchaseCall[];
        if (usesQuote && q) {
          if (!q.allowanceTarget) throw new Error("QUOTE_FAILED");
          calls = build0xFullBatchCalls({
            sellToken: paymentToken,
            sellAmount,
            needsSellApprove: freshSellApprove,
            allowanceTarget: q.allowanceTarget,
            quote: q,
            minBuyAmount: localMinBuy,
            needsUsdcApprove: freshUsdcApprove,
          });
        } else {
          calls = buildUsdcPurchaseCalls({ minBuyAmount: localMinBuy, needsApprove: freshUsdcApprove });
        }

        const ctx: ExecContext = {
          minBuy: localMinBuy,
          sellAmt: sellAmount,
          allowanceTarget: q?.allowanceTarget,
        };

        const useBatch = supportsBatch && calls.length > 1;
        const labels = useBatch
          ? [paymentTokenId === "USDC" ? BUY_FLOW_COPY.compraStepBatch : BUY_FLOW_COPY.compraStepBatch0x]
          : getStepLabels({
              paymentToken,
              supportsBatch: false,
              phase: effectiveFlowPhase,
              needsUsdcApprove: freshUsdcApprove,
              needsSellApprove: freshSellApprove,
            });

        let finalHash: `0x${string}` | undefined;
        if (useBatch) {
          finalHash = await executeBatch(calls, labels[0]!);
        } else {
          finalHash = await executeSequential(calls, labels, ctx);
        }

        setState({
          phase: "done",
          stepIndex: labels.length - 1,
          stepLabels: labels,
          currentLabel: BUY_FLOW_COPY.compraDoneTitle,
          txHash: finalHash,
          awaitingWalletApp: false,
        });
      } catch (error) {
        setState((s) => ({ ...s, phase: "error", error: mapContractError(error), awaitingWalletApp: false }));
      }
    },
    [
      address,
      effectiveFlowPhase,
      executeBatch,
      executeSequential,
      needsSellApprove,
      needsUsdcApprove,
      paymentToken,
      paymentTokenId,
      quote,
      refetchSellAllowance,
      refetchUsdcAllowance,
      sellAmount,
      startConvert,
      supportsBatch,
      validateCap,
      validateNetwork,
      validateQuoteFresh,
      validateSellBalance,
      validateUsdcBalance,
    ]
  );

  const retry = useCallback(async () => {
    setState((s) => ({ ...s, phase: "idle", error: undefined }));

    // Refetch de la quote y uso del resultado directamente — el estado React
    // del render actual quedaría caducado dentro de este mismo tick.
    let freshQuote: SwapQuoteResponse | undefined;
    if (paymentTokenId !== "USDC" && effectiveFlowPhase !== "purchase_after_convert" && !quoteFallback) {
      const r = await refetchQuote();
      freshQuote = r.data;
    }

    await startPurchase(freshQuote);
  }, [effectiveFlowPhase, paymentTokenId, quoteFallback, refetchQuote, startPurchase]);

  const setPaymentToken = useCallback((id: PaymentTokenId) => {
    setPaymentTokenId(id);
    setQuoteFallback(false);
    completedLabelsRef.current = new Set();
    storedMinBuyRef.current = undefined;
    storedQuoteRef.current = undefined;
    // Orden importante: la fase se fija DESPUÉS de limpiar (antes un reset la pisaba).
    setFlowPhase(id === "USDC" ? "purchase" : "convert");
    setState(INITIAL_EXEC_STATE);
  }, []);

  /** Vuelve al estado inicial tras una compra completada ("Comprar más"). */
  const reset = useCallback(() => {
    setQuoteFallback(false);
    completedLabelsRef.current = new Set();
    storedMinBuyRef.current = undefined;
    storedQuoteRef.current = undefined;
    setFlowPhase(paymentTokenId === "USDC" ? "purchase" : "convert");
    setState(INITIAL_EXEC_STATE);
  }, [paymentTokenId]);

  const isRunning = state.phase === "awaiting_wallet" || state.phase === "confirming";

  const primaryCta =
    paymentTokenId !== "USDC" && !supportsBatch && effectiveFlowPhase === "convert"
      ? BUY_FLOW_COPY.compraConvertCta
      : BUY_FLOW_COPY.compraStartCta;

  return {
    paymentToken,
    paymentTokenId,
    setPaymentToken,
    amountInput,
    setAmountInput,
    sellAmount,
    minBuyAmount,
    openQuoteAmount,
    quote,
    quoteLoading,
    isExpired,
    expiresInSec,
    refetchQuote,
    quoteFailed,
    quoteFallback,
    state,
    stepLabels,
    flowPhase: effectiveFlowPhase,
    needsUsdcApprove,
    supportsBatch,
    capsLoading,
    isWalletConnect,
    onBase,
    startPurchase,
    retry,
    reset,
    primaryCta,
    sellBalance,
    canPurchase: Boolean(
      address &&
        sellAmount &&
        onBase &&
        !capsLoading &&
        !isRunning &&
        (paymentTokenId === "USDC"
          ? minBuyAmount
          : effectiveFlowPhase === "purchase_after_convert"
            ? storedMinBuyRef.current
            : quote && !quoteFailed && !quoteFallback && !isExpired)
    ),
  };
}
