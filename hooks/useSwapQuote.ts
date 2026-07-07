"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
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

  // Tick para que el aviso de caducidad aparezca sin esperar a otro render.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!query.data) return;
    const t = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(t);
  }, [query.data]);

  const isExpired = query.data ? now >= query.data.expiresAt : false;
  const expiresInSec = query.data
    ? Math.max(0, Math.ceil((query.data.expiresAt - now) / 1000))
    : 0;

  return {
    quote: query.data,
    isLoading: query.isLoading || query.isFetching,
    isExpired,
    expiresInSec,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
    quoteFailed: Boolean(query.isError),
  };
}
