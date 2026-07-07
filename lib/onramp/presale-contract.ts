import { encodeFunctionData, parseAbi, type Address, type Hex } from "viem";
import { BUY_FLOW_COPY, USDC_BASE } from "./constants";
import type { PaymentToken } from "./payment-tokens";
import type { SwapQuoteResponse } from "./swap-quote-types";

export const ERC20_ABI = parseAbi([
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
]);

export const PRESALE_ABI = parseAbi([
  "function buy(uint256 usdcAmount) external",
  "function quote(uint256 usdcAmount) view returns (uint256 openAmount)",
  "function remainingCapUSDC() view returns (uint256)",
]);

export type PurchasePhase = "purchase" | "convert" | "purchase_after_convert";

export type PurchaseCall = {
  to: Address;
  data: Hex;
  value?: bigint;
  label: string;
};

export function getPresaleContract(): Address | undefined {
  const addr = process.env.NEXT_PUBLIC_PRESALE_CONTRACT?.trim();
  if (!addr || !addr.startsWith("0x")) return undefined;
  return addr as Address;
}

export function buildUsdcPurchaseCalls(params: {
  minBuyAmount: bigint;
  needsApprove: boolean;
}): PurchaseCall[] {
  const presale = getPresaleContract();
  if (!presale) throw new Error("PRESALE_CONTRACT_MISSING");

  const calls: PurchaseCall[] = [];

  if (params.needsApprove) {
    calls.push({
      to: USDC_BASE.address,
      data: encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "approve",
        args: [presale, params.minBuyAmount],
      }),
      label: "approve_usdc",
    });
  }

  calls.push({
    to: presale,
    data: encodeFunctionData({
      abi: PRESALE_ABI,
      functionName: "buy",
      args: [params.minBuyAmount],
    }),
    label: "buy",
  });

  return calls;
}

export function build0xConvertCalls(params: {
  sellToken: PaymentToken;
  sellAmount: bigint;
  needsSellApprove: boolean;
  allowanceTarget: Address;
  quote: SwapQuoteResponse;
}): PurchaseCall[] {
  const calls: PurchaseCall[] = [];

  if (params.needsSellApprove && !params.sellToken.isNative) {
    calls.push({
      to: params.sellToken.address,
      data: encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "approve",
        args: [params.allowanceTarget, params.sellAmount],
      }),
      label: "approve_sell",
    });
  }

  calls.push({
    to: params.quote.to,
    data: params.quote.data,
    value: BigInt(params.quote.value),
    label: "swap_0x",
  });

  return calls;
}

/** Batch Smart Wallet: approve venta → swap 0x → approve USDC → buy(minBuyAmount). */
export function build0xFullBatchCalls(params: {
  sellToken: PaymentToken;
  sellAmount: bigint;
  needsSellApprove: boolean;
  allowanceTarget: Address;
  quote: SwapQuoteResponse;
  minBuyAmount: bigint;
  needsUsdcApprove: boolean;
}): PurchaseCall[] {
  const presale = getPresaleContract();
  if (!presale) throw new Error("PRESALE_CONTRACT_MISSING");

  const calls = build0xConvertCalls({
    sellToken: params.sellToken,
    sellAmount: params.sellAmount,
    needsSellApprove: params.needsSellApprove,
    allowanceTarget: params.allowanceTarget,
    quote: params.quote,
  });

  if (params.needsUsdcApprove) {
    calls.push({
      to: USDC_BASE.address,
      data: encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "approve",
        args: [presale, params.minBuyAmount],
      }),
      label: "approve_usdc",
    });
  }

  calls.push({
    to: presale,
    data: encodeFunctionData({
      abi: PRESALE_ABI,
      functionName: "buy",
      args: [params.minBuyAmount],
    }),
    label: "buy",
  });

  return calls;
}

export function getStepLabels(params: {
  paymentToken: PaymentToken;
  supportsBatch: boolean;
  phase: PurchasePhase;
  needsUsdcApprove: boolean;
  needsSellApprove: boolean;
}): string[] {
  if (params.supportsBatch) {
    if (params.paymentToken.id !== "USDC") return [BUY_FLOW_COPY.compraStepBatch0x];
    // USDC con batch: una firma si hay approve + buy; con una sola call no aporta nada.
    if (params.needsUsdcApprove) return [BUY_FLOW_COPY.compraStepBatch];
  }

  if (params.paymentToken.id === "USDC") {
    const steps: string[] = [];
    if (params.needsUsdcApprove) steps.push(BUY_FLOW_COPY.compraStepUsdcApprove);
    steps.push(BUY_FLOW_COPY.compraStepUsdcBuy);
    return steps;
  }

  if (params.phase === "convert") {
    const steps: string[] = [];
    if (params.needsSellApprove) steps.push(BUY_FLOW_COPY.compraStepConvertApprove);
    steps.push(BUY_FLOW_COPY.compraStepConvertSwap);
    return steps;
  }

  const steps: string[] = [];
  if (params.needsUsdcApprove) steps.push(BUY_FLOW_COPY.compraStepUsdcApprove);
  steps.push(BUY_FLOW_COPY.compraStepUsdcBuy);
  return steps;
}

export function getAllowanceSpenderUsdc(): Address | undefined {
  return getPresaleContract();
}
