import { encodeFunctionData, parseAbi, type Address, type Hex } from "viem";
import { BUY_FLOW_COPY, USDC_BASE } from "./constants";

export const ERC20_ABI = parseAbi([
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
]);

export const PRESALE_ABI = parseAbi(["function buyWithUsdc(uint256 usdcAmount) external"]);

export const SWAP_ROUTER_ABI = parseAbi([
  "function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) external returns (uint256[] amounts)",
]);

export type PurchaseRoute = "usdc" | "swap";

export function getPresaleContract(): Address | undefined {
  const addr = process.env.NEXT_PUBLIC_PRESALE_CONTRACT?.trim();
  if (!addr || !addr.startsWith("0x")) return undefined;
  return addr as Address;
}

export function getSwapRouterContract(): Address | undefined {
  const addr = process.env.NEXT_PUBLIC_SWAP_ROUTER_CONTRACT?.trim();
  if (!addr || !addr.startsWith("0x")) return undefined;
  return addr as Address;
}

export const WETH_BASE = "0x4200000000000000000000000000000000000006" as Address;

export type PurchaseCall = {
  to: Address;
  data: Hex;
  label: string;
};

export function buildUsdcPurchaseCalls(params: {
  amount: bigint;
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
        args: [presale, params.amount],
      }),
      label: "approve_usdc",
    });
  }

  calls.push({
    to: presale,
    data: encodeFunctionData({
      abi: PRESALE_ABI,
      functionName: "buyWithUsdc",
      args: [params.amount],
    }),
    label: "buy",
  });

  return calls;
}

export function buildSwapPurchaseCalls(params: {
  owner: Address;
  amount: bigint;
  needsApprove: boolean;
}): PurchaseCall[] {
  const router = getSwapRouterContract();
  const presale = getPresaleContract();
  if (!router) throw new Error("SWAP_ROUTER_MISSING");
  if (!presale) throw new Error("PRESALE_CONTRACT_MISSING");

  const calls: PurchaseCall[] = [];
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

  if (params.needsApprove) {
    calls.push({
      to: USDC_BASE.address,
      data: encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "approve",
        args: [router, params.amount],
      }),
      label: "approve_swap",
    });
  }

  calls.push({
    to: router,
    data: encodeFunctionData({
      abi: SWAP_ROUTER_ABI,
      functionName: "swapExactTokensForETH",
      args: [params.amount, 0n, [USDC_BASE.address, WETH_BASE], params.owner, deadline],
    }),
    label: "convert",
  });

  calls.push({
    to: presale,
    data: encodeFunctionData({
      abi: PRESALE_ABI,
      functionName: "buyWithUsdc",
      args: [params.amount],
    }),
    label: "buy",
  });

  return calls;
}

export function getStepLabels(route: PurchaseRoute, supportsBatch: boolean, needsApprove: boolean): string[] {
  if (supportsBatch) return [BUY_FLOW_COPY.compraStepBatch];

  if (route === "usdc") {
    const steps: string[] = [];
    if (needsApprove) steps.push(BUY_FLOW_COPY.compraStepUsdcApprove);
    steps.push(BUY_FLOW_COPY.compraStepUsdcBuy);
    return steps;
  }

  const steps: string[] = [];
  if (needsApprove) steps.push(BUY_FLOW_COPY.compraStepSwapApprove);
  steps.push(BUY_FLOW_COPY.compraStepSwapConvert);
  steps.push(BUY_FLOW_COPY.compraStepSwapBuy);
  return steps;
}

export function getAllowanceSpender(route: PurchaseRoute): Address | undefined {
  if (route === "usdc") return getPresaleContract();
  return getSwapRouterContract();
}
