"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  BridgeError,
  BridgeOrigin,
  BridgeQuoteResponse,
  BridgeToken,
} from "@/lib/bridge/relay";

async function fetchBridgeQuote(body: {
  originChainId: number;
  originCurrency: string;
  amount: string;
  recipient: string;
  userAddress?: string;
}): Promise<BridgeQuoteResponse> {
  const res = await fetch("/api/bridge-quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error((json as BridgeError).error ?? "No se pudo obtener la cotización del puente.");
  }
  return json as BridgeQuoteResponse;
}

export function useBridgeQuote(params: {
  origin?: BridgeOrigin;
  token?: BridgeToken;
  amount?: bigint;
  /** Dirección en Base que recibirá el USDC. */
  recipient?: `0x${string}`;
  /** Dirección EVM en la red de origen (misma wallet). */
  userAddress?: `0x${string}`;
  /** Si es false, la quote solo se pide con refetch() (flujo de depósito). */
  auto?: boolean;
}) {
  const { origin, token, amount, recipient, userAddress } = params;
  const isDeposit = origin?.kind === "deposit";

  const ready = Boolean(
    origin && token && amount && amount > 0n && recipient && (isDeposit || userAddress)
  );

  const query = useQuery({
    queryKey: [
      "bridge-quote",
      origin?.chainId,
      token?.currency,
      amount?.toString(),
      recipient,
    ],
    queryFn: () =>
      fetchBridgeQuote({
        originChainId: origin!.chainId,
        originCurrency: token!.currency,
        amount: amount!.toString(),
        recipient: recipient!,
        userAddress: isDeposit ? undefined : userAddress,
      }),
    enabled: ready && params.auto !== false,
    // Las quotes EVM caducan en ~60 s; refrescamos antes de que expire.
    refetchInterval: isDeposit ? false : 45_000,
    staleTime: 40_000,
    retry: 1,
  });

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!query.data) return;
    const t = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(t);
  }, [query.data]);

  const isExpired = query.data ? now >= query.data.expiresAt : false;
  const expiresInSec = query.data ? Math.max(0, Math.ceil((query.data.expiresAt - now) / 1000)) : 0;

  return {
    quote: query.data,
    isLoading: query.isLoading || query.isFetching,
    isExpired,
    expiresInSec,
    error: query.error instanceof Error ? query.error.message : undefined,
    refetch: query.refetch,
    ready,
  };
}
