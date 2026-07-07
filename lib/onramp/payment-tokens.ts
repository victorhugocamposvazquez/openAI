import type { Address } from "viem";
import { USDC_BASE } from "./constants";

export type PaymentTokenId = "USDC" | "ETH" | "WETH" | "CBBTC";

/** Dirección especial 0x para ETH nativo. */
export const NATIVE_ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as Address;

export const WETH_BASE = "0x4200000000000000000000000000000000000006" as Address;

export const CBBTC_BASE = "0xcbB7C0000aB88B473b1fFdAe5fe8828ee86C5Dc1" as Address;

export type PaymentToken = {
  id: PaymentTokenId;
  symbol: string;
  address: Address;
  decimals: number;
  isNative: boolean;
};

export const PAYMENT_TOKENS: Record<PaymentTokenId, PaymentToken> = {
  USDC: {
    id: "USDC",
    symbol: "USDC",
    address: USDC_BASE.address,
    decimals: USDC_BASE.decimals,
    isNative: false,
  },
  ETH: {
    id: "ETH",
    symbol: "ETH",
    address: NATIVE_ETH_ADDRESS,
    decimals: 18,
    isNative: true,
  },
  WETH: {
    id: "WETH",
    symbol: "WETH",
    address: WETH_BASE,
    decimals: 18,
    isNative: false,
  },
  CBBTC: {
    id: "CBBTC",
    symbol: "cbBTC",
    address: CBBTC_BASE,
    decimals: 8,
    isNative: false,
  },
};

export const PAYMENT_TOKEN_LIST: PaymentToken[] = [
  PAYMENT_TOKENS.USDC,
  PAYMENT_TOKENS.ETH,
  PAYMENT_TOKENS.WETH,
  PAYMENT_TOKENS.CBBTC,
];

export function getPaymentToken(id: PaymentTokenId): PaymentToken {
  return PAYMENT_TOKENS[id];
}

/** Token on-chain para balance/allowance (ETH nativo → sin contrato). */
export function getBalanceTokenAddress(token: PaymentToken): Address | undefined {
  if (token.isNative) return undefined;
  return token.address;
}
