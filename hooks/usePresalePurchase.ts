"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useChainId,
  useConfig,
  useReadContract,
  useSendCalls,
  useWriteContract,
} from "wagmi";
import { sendTransaction, waitForTransactionReceipt } from "@wagmi/core";
import { base } from "wagmi/chains";
import { parseUnits, UserRejectedRequestError } from "viem";
import { BUY_FLOW_COPY, USDC_BASE } from "@/lib/onramp/constants";
import { useAtomicBatchSupport } from "@/hooks/useAtomicBatchSupport";
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
import {
  getPaymentToken,
  type PaymentToken,
  type PaymentTokenId,
} from "@/lib/onramp/payment-tokens";
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

function isUserRejection(error: unknown): boolean {
  if (error instanceof UserRejectedRequestError) return true;
  if (error instanceof Error) {
    const t = error.message.toLowerCase();
    return t.includes("user rejected") || t.includes("user denied") || t.includes("rejected");
  }
  return false;
}

function mapContractError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === "PRESALE_CONTRACT_MISSING") return BUY_FLOW_COPY.compraContractMissing;
    if (error.message === "QUOTE_EXPIRED") return BUY_FLOW_COPY.compraQuoteExpired;
    if (error.message === "CAP_EXCEEDED") return BUY_FLOW_COPY.compraCapExceeded;
    if (error.message === "QUOTE_FAILED") return BUY_FLOW_COPY.compraQuoteFallback;
    if (isUserRejection(error)) return BUY_FLOW_COPY.compraUserRejected;
    return error.message;
  }
  return "Error desconocido";
}

export function usePresalePurchase() {
  const config = useConfig();
  const { address, connector } = useAccount();
  const chainId = useChainId();
  const { supportsBatch, isLoading: capsLoading } = useAtomicBatchSupport();
  const { sendCallsAsync } = useSendCalls();
  const { writeContractAsync } = useWriteContract();

  const [paymentTokenId, setPaymentTokenId] = useState<PaymentTokenId>("USDC");
  const [amountInput, setAmountInput] = useState("10");
  const [flowPhase, setFlowPhase] = useState<PurchasePhase>("purchase");
  const [quoteFallback, setQuoteFallback] = useState(false);
  const [state, setState] = useState<PurchaseExecutionState>({
    phase: "idle",
    stepIndex: 0,
    stepLabels: [],
    currentLabel: "",
    awaitingWalletApp: false,
  });

  const paymentToken = getPaymentToken(paymentTokenId);
  const completedLabelsRef = useRef<Set<string>>(new Set());
  const storedMinBuyRef = useRef<bigint | undefined>(undefined);
  const storedQuoteRef = useRef<SwapQuoteResponse | undefined>(undefined);
  const isWalletConnect = isWalletConnectConnector(connector?.id);

  const sellAmount = useMemo(() => {
    const normalized = amountInput.trim().replace(",", ".");
    const n = Number(normalized);
    if (!normalized || Number.isNaN(n) || n <= 0) return undefined;
    return parseUnits(normalized, paymentToken.decimals);
  }, [amountInput, paymentToken.decimals]);

  const { quote, isLoading: quoteLoading, isExpired, quoteFailed, refetch: refetchQuote } = useSwapQuote({
    paymentToken,
    sellAmount,
    enabled: paymentTokenId !== "USDC" && !quoteFallback,
  });

  const { data: remainingCap } = usePresaleRemainingCap();

  const minBuyAmount = useMemo(() => {
    if (paymentTokenId === "USDC") return sellAmount;
    if (flowPhase === "purchase_after_convert" && storedMinBuyRef.current) {
      return storedMinBuyRef.current;
    }
    if (!quote?.minBuyAmount) return undefined;
    return BigInt(quote.minBuyAmount);
  }, [paymentTokenId, sellAmount, quote?.minBuyAmount, flowPhase]);

  const openQuoteAmount = minBuyAmount;

  const allowanceTarget = quote?.allowanceTarget;

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
      address && allowanceTarget && !paymentToken.isNative
        ? [address, allowanceTarget]
        : undefined,
    chainId: base.id,
    query: {
      enabled: Boolean(address && allowanceTarget && !paymentToken.isNative && paymentTokenId !== "USDC"),
    },
  });

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
    paymentTokenId === "USDC"
      ? "purchase"
      : supportsBatch
        ? "purchase"
        : flowPhase;

  const stepLabels = useMemo(
    () =>
      getStepLabels({
        paymentToken,
        supportsBatch: supportsBatch && paymentTokenId !== "USDC",
        phase: effectiveFlowPhase,
        needsUsdcApprove,
        needsSellApprove,
      }),
    [effectiveFlowPhase, needsSellApprove, needsUsdcApprove, paymentToken, paymentTokenId, supportsBatch]
  );

  const validateCap = useCallback(
    (amount: bigint) => {
      if (remainingCap === undefined) return;
      if (amount > remainingCap) {
        throw new Error("CAP_EXCEEDED");
      }
    },
    [remainingCap]
  );

  const validateQuoteFresh = useCallback(() => {
    const q = storedQuoteRef.current ?? quote;
    if (paymentTokenId !== "USDC" && supportsBatch) {
      if (!q) throw new Error("QUOTE_FAILED");
      if (Date.now() >= q.expiresAt) throw new Error("QUOTE_EXPIRED");
    }
  }, [paymentTokenId, quote, supportsBatch]);

  const buildCallsForCurrentPhase = useCallback(
    (freshUsdcApprove: boolean, freshSellApprove: boolean): PurchaseCall[] => {
      if (!address || !sellAmount || !minBuyAmount) throw new Error("WALLET_OR_AMOUNT_MISSING");

      if (paymentTokenId === "USDC") {
        return buildUsdcPurchaseCalls({ minBuyAmount, needsApprove: freshUsdcApprove });
      }

      const q = storedQuoteRef.current ?? quote;
      if (!q?.allowanceTarget) throw new Error("QUOTE_FAILED");

      if (supportsBatch) {
        return build0xFullBatchCalls({
          sellToken: paymentToken,
          sellAmount,
          needsSellApprove: freshSellApprove,
          allowanceTarget: q.allowanceTarget,
          quote: q,
          minBuyAmount,
          needsUsdcApprove: freshUsdcApprove,
        });
      }

      if (effectiveFlowPhase === "convert") {
        return build0xConvertCalls({
          sellToken: paymentToken,
          sellAmount,
          needsSellApprove: freshSellApprove,
          allowanceTarget: q.allowanceTarget,
          quote: q,
        });
      }

      return buildUsdcPurchaseCalls({ minBuyAmount, needsApprove: freshUsdcApprove });
    },
    [
      address,
      effectiveFlowPhase,
      minBuyAmount,
      paymentToken,
      paymentTokenId,
      quote,
      sellAmount,
      supportsBatch,
    ]
  );

  const executeCall = useCallback(
    async (call: PurchaseCall) => {
      if (!address || !minBuyAmount) throw new Error("WALLET_OR_AMOUNT_MISSING");
      const presale = getPresaleContract();
      if (!presale) throw new Error("PRESALE_CONTRACT_MISSING");

      if (call.label === "approve_usdc") {
        return writeContractAsync({
          address: USDC_BASE.address,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [presale, minBuyAmount],
          chainId: base.id,
        });
      }

      if (call.label === "approve_sell" && allowanceTarget && sellAmount) {
        return writeContractAsync({
          address: paymentToken.address,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [allowanceTarget, sellAmount],
          chainId: base.id,
        });
      }

      if (call.label === "swap_0x") {
        return sendTransaction(config, {
          account: address,
          to: call.to,
          data: call.data,
          value: call.value,
          chainId: base.id,
        });
      }

      if (call.label === "buy") {
        return writeContractAsync({
          address: presale,
          abi: PRESALE_ABI,
          functionName: "buy",
          args: [minBuyAmount],
          chainId: base.id,
        });
      }

      throw new Error(`Paso desconocido: ${call.label}`);
    },
    [address, allowanceTarget, config, minBuyAmount, paymentToken.address, sellAmount, writeContractAsync]
  );

  const runSequentialStep = useCallback(
    async (call: PurchaseCall) => {
      const hash = await executeCall(call);
      setState((s) => ({ ...s, phase: "confirming", txHash: hash, awaitingWalletApp: false }));
      await waitForTransactionReceipt(config, { hash, chainId: base.id });
      completedLabelsRef.current.add(call.label);
    },
    [config, executeCall]
  );

  const executeSequential = useCallback(
    async (calls: PurchaseCall[], labels: string[]) => {
      const pending = calls.filter((c) => !completedLabelsRef.current.has(c.label));

      for (let i = 0; i < pending.length; i++) {
        const call = pending[i]!;
        setState({
          phase: "awaiting_wallet",
          stepIndex: i,
          stepLabels: labels,
          currentLabel: labels[i] ?? call.label,
          awaitingWalletApp: isWalletConnect,
        });
        await runSequentialStep(call);
      }
    },
    [isWalletConnect, runSequentialStep]
  );

  const executeBatch = useCallback(
    async (calls: PurchaseCall[]) => {
      setState({
        phase: "awaiting_wallet",
        stepIndex: 0,
        stepLabels: [BUY_FLOW_COPY.compraStepBatch0x],
        currentLabel: BUY_FLOW_COPY.compraStepBatch0x,
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
      return result.id;
    },
    [isWalletConnect, sendCallsAsync]
  );

  const resetProgress = useCallback(() => {
    completedLabelsRef.current = new Set();
    storedMinBuyRef.current = undefined;
    storedQuoteRef.current = undefined;
    setFlowPhase("purchase");
  }, []);

  const startConvert = useCallback(async () => {
    if (!address || !sellAmount || paymentTokenId === "USDC") return;
    if (chainId !== base.id) return;
    if (!quote?.allowanceTarget) {
      setQuoteFallback(true);
      setState((s) => ({ ...s, phase: "error", error: BUY_FLOW_COPY.compraQuoteFallback }));
      return;
    }

    storedQuoteRef.current = quote;
    storedMinBuyRef.current = BigInt(quote.minBuyAmount);

    try {
      validateQuoteFresh();
      const { data: freshSell } = await refetchSellAllowance();
      const freshSellApprove =
        !paymentToken.isNative && sellAmount && freshSell !== undefined
          ? freshSell < sellAmount
          : needsSellApprove;

      const calls = build0xConvertCalls({
        sellToken: paymentToken,
        sellAmount,
        needsSellApprove: freshSellApprove,
        allowanceTarget: quote.allowanceTarget,
        quote,
      });

      const labels = getStepLabels({
        paymentToken,
        supportsBatch: false,
        phase: "convert",
        needsUsdcApprove: false,
        needsSellApprove: freshSellApprove,
      });

      await executeSequential(calls, labels);
      setFlowPhase("purchase_after_convert");
      completedLabelsRef.current = new Set();
      setState({
        phase: "idle",
        stepIndex: 0,
        stepLabels: getStepLabels({
          paymentToken,
          supportsBatch: false,
          phase: "purchase_after_convert",
          needsUsdcApprove,
          needsSellApprove: false,
        }),
        currentLabel: "",
        awaitingWalletApp: false,
      });
    } catch (error) {
      setState((s) => ({ ...s, phase: "error", error: mapContractError(error), awaitingWalletApp: false }));
    }
  }, [
    address,
    chainId,
    executeSequential,
    needsSellApprove,
    needsUsdcApprove,
    paymentToken,
    paymentTokenId,
    quote,
    refetchSellAllowance,
    sellAmount,
    validateQuoteFresh,
  ]);

  const startPurchase = useCallback(async () => {
    if (!address || !sellAmount || !minBuyAmount) return;
    if (chainId !== base.id) return;
    if (!getPresaleContract()) {
      setState((s) => ({ ...s, phase: "error", error: BUY_FLOW_COPY.compraContractMissing }));
      return;
    }

    if (paymentTokenId !== "USDC" && !supportsBatch && effectiveFlowPhase === "convert") {
      await startConvert();
      return;
    }

    try {
      if (paymentTokenId !== "USDC") {
        storedQuoteRef.current = quote;
        validateQuoteFresh();
      }
      validateCap(minBuyAmount);

      const { data: freshUsdc } = await refetchUsdcAllowance();
      const freshUsdcApprove =
        freshUsdc !== undefined && minBuyAmount ? freshUsdc < minBuyAmount : needsUsdcApprove;

      const { data: freshSell } = await refetchSellAllowance();
      const freshSellApprove =
        paymentTokenId !== "USDC" &&
        !paymentToken.isNative &&
        sellAmount &&
        freshSell !== undefined &&
        allowanceTarget
          ? freshSell < sellAmount
          : needsSellApprove;

      completedLabelsRef.current = new Set(
        [...completedLabelsRef.current].filter((label) => {
          if (label.startsWith("approve_usdc") && !freshUsdcApprove) return false;
          if (label.startsWith("approve_sell") && !freshSellApprove) return false;
          return true;
        })
      );

      const calls = buildCallsForCurrentPhase(freshUsdcApprove, freshSellApprove);
      const labels = getStepLabels({
        paymentToken,
        supportsBatch: supportsBatch && paymentTokenId !== "USDC",
        phase: effectiveFlowPhase,
        needsUsdcApprove: freshUsdcApprove,
        needsSellApprove: freshSellApprove,
      });

      const useBatch = supportsBatch && paymentTokenId !== "USDC" && calls.length > 1;

      if (useBatch) {
        const batchId = await executeBatch(calls);
        const { waitForCallsStatus } = await import("@wagmi/core");
        await waitForCallsStatus(config, { id: batchId });
        calls.forEach((c) => completedLabelsRef.current.add(c.label));
      } else {
        await executeSequential(calls, labels);
      }

      setState({
        phase: "done",
        stepIndex: labels.length - 1,
        stepLabels: labels,
        currentLabel: BUY_FLOW_COPY.compraDoneTitle,
        awaitingWalletApp: false,
      });
    } catch (error) {
      setState((s) => ({ ...s, phase: "error", error: mapContractError(error), awaitingWalletApp: false }));
    }
  }, [
    address,
    allowanceTarget,
    buildCallsForCurrentPhase,
    chainId,
    config,
    effectiveFlowPhase,
    executeBatch,
    executeSequential,
    minBuyAmount,
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
    validateQuoteFresh,
  ]);

  const retry = useCallback(async () => {
    await Promise.all([refetchUsdcAllowance(), refetchSellAllowance(), refetchQuote()]);
    setState((s) => ({ ...s, phase: "idle", error: undefined }));
    if (effectiveFlowPhase === "convert") {
      await startConvert();
    } else {
      await startPurchase();
    }
  }, [effectiveFlowPhase, refetchQuote, refetchSellAllowance, refetchUsdcAllowance, startConvert, startPurchase]);

  const setPaymentToken = useCallback((id: PaymentTokenId) => {
    setPaymentTokenId(id);
    setQuoteFallback(false);
    setFlowPhase(id === "USDC" ? "purchase" : "convert");
    resetProgress();
    setState({
      phase: "idle",
      stepIndex: 0,
      stepLabels: [],
      currentLabel: "",
      awaitingWalletApp: false,
    });
  }, [resetProgress]);

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
    quoteFailed,
    quoteFallback,
    state,
    stepLabels,
    flowPhase: effectiveFlowPhase,
    needsUsdcApprove,
    supportsBatch,
    capsLoading,
    isWalletConnect,
    startPurchase,
    retry,
    primaryCta,
    canPurchase: Boolean(
      address &&
        sellAmount &&
        minBuyAmount &&
        chainId === base.id &&
        !capsLoading &&
        !isRunning &&
        (paymentTokenId === "USDC" || (quote && !quoteFailed && !quoteFallback) || effectiveFlowPhase === "purchase_after_convert")
    ),
  };
}
