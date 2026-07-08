"use client";

import { useQuery } from "@tanstack/react-query";
import { PRICES_USD } from "@/lib/format";

export type LivePrice = { usd: number; change24h: number };

type PricesResponse = {
  prices: Record<string, LivePrice>;
  updatedAt: number;
};

async function fetchPrices(): Promise<PricesResponse> {
  const res = await fetch("/api/prices");
  if (!res.ok) throw new Error("PRICES_UNAVAILABLE");
  return (await res.json()) as PricesResponse;
}

/**
 * Precios de mercado reales (CoinGecko vía /api/prices), refrescados cada 60 s.
 * `priceOf` hace fallback a los precios de referencia locales si la API falla.
 */
export function useLivePrices() {
  const query = useQuery({
    queryKey: ["live-prices"],
    queryFn: fetchPrices,
    refetchInterval: 60_000,
    staleTime: 55_000,
    retry: 1,
  });

  const prices = query.data?.prices;

  const priceOf = (ticker: string): number =>
    prices?.[ticker]?.usd ?? PRICES_USD[ticker] ?? 0;

  const changeOf = (ticker: string): number | undefined => prices?.[ticker]?.change24h;

  return {
    prices,
    priceOf,
    changeOf,
    isLive: Boolean(prices),
    isLoading: query.isLoading,
  };
}
