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
import { waitForTransactionReceipt } from "@wagmi/core";
import { base } from "wagmi/chains";
import { parseUnits, UserRejectedRequestError } from "viem";
import { BUY_FLOW_COPY, USDC_BASE } from "@/lib/onramp/constants";
import { useAtomicBatchSupport } from "@/hooks/useAtomicBatchSupport";
import { isWalletConnectConnector } from "@/lib/wagmi/connectors";
import {
  buildSwapPurchaseCalls,
  buildUsdcPurchaseCalls,
  ERC20_ABI,
  getAllowanceSpender,
  getPresaleContract,
  getStepLabels,
  getSwapRouterContract,
  PRESALE_ABI,
  SWAP_ROUTER_ABI,
  WETH_BASE,
  type PurchaseCall,
  type PurchaseRoute,
} from "@/lib/onramp/presale-contract";

export type PurchasePhase = "idle" | "awaiting_wallet" | "confirming" | "done" | "error";

export type PurchaseExecutionState = {
  phase: PurchasePhase;
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
    if (error.message === "SWAP_ROUTER_MISSING") {
      return "Router de swap no configurado (NEXT_PUBLIC_SWAP_ROUTER_CONTRACT).";
    }
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

  const [route, setRoute] = useState<PurchaseRoute>("usdc");
  const [amountInput, setAmountInput] = useState("10");
  const [state, setState] = useState<PurchaseExecutionState>({
    phase: "idle",
    stepIndex: 0,
    stepLabels: [],
    currentLabel: "",
    awaitingWalletApp: false,
  });

  const completedLabelsRef = useRef<Set<string>>(new Set());
  const isWalletConnect = isWalletConnectConnector(connector?.id);

  const amount = useMemo(() => {
    const normalized = amountInput.trim().replace(",", ".");
    const n = Number(normalized);
    if (!normalized || Number.isNaN(n) || n <= 0) return undefined;
    return parseUnits(normalized, USDC_BASE.decimals);
  }, [amountInput]);

  const spender = getAllowanceSpender(route);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_BASE.address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && spender ? [address, spender] : undefined,
    chainId: base.id,
    query: { enabled: Boolean(address && spender) },
  });

  const needsApprove = useMemo(() => {
    if (!amount || allowance === undefined) return true;
    return allowance < amount;
  }, [allowance, amount]);

  const stepLabels = useMemo(
    () => getStepLabels(route, supportsBatch, needsApprove),
    [route, supportsBatch, needsApprove]
  );

  const buildCalls = useCallback((): PurchaseCall[] => {
    if (!address || !amount) throw new Error("WALLET_OR_AMOUNT_MISSING");
    if (route === "usdc") return buildUsdcPurchaseCalls({ amount, needsApprove });
    return buildSwapPurchaseCalls({ owner: address, amount, needsApprove });
  }, [address, amount, route, needsApprove]);

  const executeCall = useCallback(
    async (call: PurchaseCall) => {
      if (!address || !amount) throw new Error("WALLET_OR_AMOUNT_MISSING");

      if (call.label === "approve_usdc") {
        const presale = getPresaleContract();
        if (!presale) throw new Error("PRESALE_CONTRACT_MISSING");
        return writeContractAsync({
          address: USDC_BASE.address,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [presale, amount],
          chainId: base.id,
        });
      }

      if (call.label === "approve_swap") {
        const router = getSwapRouterContract();
        if (!router) throw new Error("SWAP_ROUTER_MISSING");
        return writeContractAsync({
          address: USDC_BASE.address,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [router, amount],
          chainId: base.id,
        });
      }

      if (call.label === "convert") {
        const router = getSwapRouterContract();
        if (!router) throw new Error("SWAP_ROUTER_MISSING");
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
        return writeContractAsync({
          address: router,
          abi: SWAP_ROUTER_ABI,
          functionName: "swapExactTokensForETH",
          args: [amount, 0n, [USDC_BASE.address, WETH_BASE], address, deadline],
          chainId: base.id,
        });
      }

      if (call.label === "buy") {
        const presale = getPresaleContract();
        if (!presale) throw new Error("PRESALE_CONTRACT_MISSING");
        return writeContractAsync({
          address: presale,
          abi: PRESALE_ABI,
          functionName: "buyWithUsdc",
          args: [amount],
          chainId: base.id,
        });
      }

      throw new Error(`Paso desconocido: ${call.label}`);
    },
    [address, amount, writeContractAsync]
  );

  const runSequentialStep = useCallback(
    async (call: PurchaseCall) => {
      const hash = await executeCall(call);

      setState((s) => ({
        ...s,
        phase: "confirming",
        txHash: hash,
        awaitingWalletApp: false,
      }));

      await waitForTransactionReceipt(config, { hash, chainId: base.id });
      completedLabelsRef.current.add(call.label);
    },
    [config, executeCall]
  );

  const executeSequential = useCallback(
    async (calls: PurchaseCall[]) => {
      const pending = calls.filter((c) => !completedLabelsRef.current.has(c.label));
      const labels = getStepLabels(route, false, needsApprove);

      for (const call of pending) {
        const absoluteIndex = calls.findIndex((c) => c.label === call.label);
        const skippedApproves = needsApprove ? 0 : calls.filter((c) => c.label.startsWith("approve")).length;
        const uiIndex = Math.max(0, absoluteIndex - skippedApproves);

        setState({
          phase: "awaiting_wallet",
          stepIndex: uiIndex,
          stepLabels: labels,
          currentLabel: labels[uiIndex] ?? call.label,
          awaitingWalletApp: isWalletConnect,
        });

        await runSequentialStep(call);
      }
    },
    [isWalletConnect, needsApprove, route, runSequentialStep]
  );

  const executeBatch = useCallback(
    async (calls: PurchaseCall[]) => {
      setState({
        phase: "awaiting_wallet",
        stepIndex: 0,
        stepLabels: [BUY_FLOW_COPY.compraStepBatch],
        currentLabel: BUY_FLOW_COPY.compraStepBatch,
        awaitingWalletApp: isWalletConnect,
      });

      const result = await sendCallsAsync({
        calls: calls.map((c) => ({ to: c.to, data: c.data })),
        chainId: base.id,
      });

      setState((s) => ({
        ...s,
        phase: "confirming",
        batchId: result.id,
        awaitingWalletApp: false,
      }));

      return result.id;
    },
    [isWalletConnect, sendCallsAsync]
  );

  const startPurchase = useCallback(async () => {
    if (!address || !amount) return;
    if (chainId !== base.id) return;
    if (route === "swap" && !getSwapRouterContract()) {
      setState((s) => ({ ...s, phase: "error", error: "Router de swap no configurado." }));
      return;
    }
    if (!getPresaleContract()) {
      setState((s) => ({ ...s, phase: "error", error: BUY_FLOW_COPY.compraContractMissing }));
      return;
    }

    const { data: freshAllowance } = await refetchAllowance();
    const currentAllowance = freshAllowance ?? allowance;
    const freshNeedsApprove = amount && currentAllowance !== undefined ? currentAllowance < amount : needsApprove;

    completedLabelsRef.current = new Set(
      [...completedLabelsRef.current].filter((label) => !label.startsWith("approve") || freshNeedsApprove)
    );

    try {
      const calls =
        route === "usdc"
          ? buildUsdcPurchaseCalls({ amount, needsApprove: freshNeedsApprove })
          : buildSwapPurchaseCalls({ owner: address, amount, needsApprove: freshNeedsApprove });

      const useBatch = supportsBatch && calls.length > 1;

      if (useBatch) {
        const batchId = await executeBatch(calls);
        const { waitForCallsStatus } = await import("@wagmi/core");
        await waitForCallsStatus(config, { id: batchId });
        calls.forEach((c) => completedLabelsRef.current.add(c.label));
      } else {
        await executeSequential(calls);
      }

      const finalLabels = getStepLabels(route, useBatch, freshNeedsApprove);
      setState({
        phase: "done",
        stepIndex: finalLabels.length - 1,
        stepLabels: finalLabels,
        currentLabel: BUY_FLOW_COPY.compraDoneTitle,
        awaitingWalletApp: false,
      });
    } catch (error) {
      setState((s) => ({
        ...s,
        phase: "error",
        error: mapContractError(error),
        awaitingWalletApp: false,
      }));
    }
  }, [
    address,
    allowance,
    amount,
    chainId,
    config,
    executeBatch,
    executeSequential,
    needsApprove,
    refetchAllowance,
    route,
    supportsBatch,
  ]);

  const retry = useCallback(async () => {
    await refetchAllowance();
    setState((s) => ({ ...s, phase: "idle", error: undefined }));
    await startPurchase();
  }, [refetchAllowance, startPurchase]);

  return {
    route,
    setRoute,
    amountInput,
    setAmountInput,
    amount,
    state,
    stepLabels,
    needsApprove,
    supportsBatch,
    capsLoading,
    isWalletConnect,
    startPurchase,
    retry,
    canPurchase: Boolean(address && amount && chainId === base.id && !capsLoading),
  };
}
