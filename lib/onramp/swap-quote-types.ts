import type { Address, Hex } from "viem";

export type SwapQuoteResponse = {
  to: Address;
  data: Hex;
  value: string;
  buyAmount: string;
  minBuyAmount: string;
  sellAmount: string;
  sellToken: Address;
  buyToken: Address;
  allowanceTarget?: Address;
  expiresAt: number;
  liquidityAvailable: boolean;
};

export type SwapQuoteError = {
  error: string;
  fallbackUsdc?: boolean;
};
