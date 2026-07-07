import type { Address } from "viem";
import { USDC_BASE } from "./constants";
import type { SwapQuoteResponse } from "./swap-quote-types";

const ZEROX_API = "https://api.0x.org";
const BASE_CHAIN_ID = 8453;
const QUOTE_TTL_MS = 30_000;
const SLIPPAGE_BPS = 100;

/**
 * AllowanceHolder de 0x v2 (dirección canónica multichain).
 * 0x solo devuelve issues.allowance.spender cuando falta allowance,
 * así que necesitamos este fallback para ETH nativo o allowance ya concedida.
 */
export const ALLOWANCE_HOLDER_BASE = "0x0000000000001fF3684f28c67538d4D072C22734" as Address;

type ZeroXQuote = {
  buyAmount?: string;
  minBuyAmount?: string;
  sellAmount?: string;
  sellToken?: string;
  buyToken?: string;
  liquidityAvailable?: boolean;
  transaction?: { to?: string; data?: string; value?: string };
  issues?: { allowance?: { spender?: string } | null };
  blockNumber?: string;
};

export function getZeroXApiKey(): string | undefined {
  return process.env.ZEROX_API_KEY?.trim() || undefined;
}

export async function fetchZeroXSwapQuote(params: {
  sellToken: Address;
  sellAmount: string;
  taker: Address;
}): Promise<SwapQuoteResponse> {
  const apiKey = getZeroXApiKey();
  if (!apiKey) throw new Error("ZEROX_API_KEY_MISSING");

  const query = new URLSearchParams({
    chainId: String(BASE_CHAIN_ID),
    sellToken: params.sellToken,
    buyToken: USDC_BASE.address,
    sellAmount: params.sellAmount,
    taker: params.taker,
    slippageBps: String(SLIPPAGE_BPS),
  });

  const res = await fetch(`${ZEROX_API}/swap/allowance-holder/quote?${query}`, {
    headers: {
      "0x-api-key": apiKey,
      "0x-version": "v2",
    },
    cache: "no-store",
  });

  const body = (await res.json()) as ZeroXQuote & { reason?: string; message?: string };

  if (!res.ok) {
    const msg = body.reason ?? body.message ?? `Error 0x (${res.status})`;
    throw new Error(msg);
  }

  if (!body.liquidityAvailable) {
    throw new Error("NO_LIQUIDITY");
  }

  const tx = body.transaction;
  if (!tx?.to || !tx.data) {
    throw new Error("QUOTE_INCOMPLETE");
  }

  return {
    to: tx.to as Address,
    data: tx.data as `0x${string}`,
    value: tx.value ?? "0",
    buyAmount: body.buyAmount ?? "0",
    minBuyAmount: body.minBuyAmount ?? body.buyAmount ?? "0",
    sellAmount: body.sellAmount ?? params.sellAmount,
    sellToken: (body.sellToken ?? params.sellToken) as Address,
    buyToken: USDC_BASE.address,
    allowanceTarget: (body.issues?.allowance?.spender as Address | undefined) ?? ALLOWANCE_HOLDER_BASE,
    expiresAt: Date.now() + QUOTE_TTL_MS,
    liquidityAvailable: Boolean(body.liquidityAvailable),
  };
}
