"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { base } from "wagmi/chains";
import type { PaymentToken } from "@/lib/onramp/payment-tokens";
import type { SwapQuoteError, SwapQuoteResponse } from "@/lib/onramp/swap-quote-types";

async function fetchSwapQuote(params: {
  sellToken: string;
  sellAmount: string;
  taker: string;
}): Promise<SwapQuoteResponse> {
  const qs = new URLSearchParams(params);
  const res = await fetch(`/api/swap-quote?${qs}`);
  const body = await res.json();
  if (!res.ok) {
    const err = body as SwapQuoteError;
    throw new Error(err.error ?? "QUOTE_FAILED");
  }
  return body as SwapQuoteResponse;
}

export function useSwapQuote(params: {
  paymentToken: PaymentToken;
  sellAmount?: bigint;
  enabled?: boolean;
}) {
  const { address } = useAccount();
  const enabled =
    Boolean(params.enabled && address && params.sellAmount && params.sellAmount > 0n) &&
    params.paymentToken.id !== "USDC";

  const query = useQuery({
    queryKey: ["swap-quote", params.paymentToken.id, params.sellAmount?.toString(), address],
    queryFn: () =>
      fetchSwapQuote({
        sellToken: params.paymentToken.address,
        sellAmount: params.sellAmount!.toString(),
        taker: address!,
      }),
    enabled,
    refetchInterval: 30_000,
    staleTime: 25_000,
    retry: 1,
  });

  const isExpired = query.data ? Date.now() >= query.data.expiresAt : false;

  return {
    quote: query.data,
    isLoading: query.isLoading || query.isFetching,
    isExpired,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
    quoteFailed: Boolean(query.isError),
  };
}
