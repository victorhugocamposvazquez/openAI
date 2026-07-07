"use client";

import { useMemo } from "react";
import { useAccount, useCapabilities } from "wagmi";
import { base } from "wagmi/chains";
import { chainSupportsAtomicBatch } from "@/lib/wagmi/capabilities";

/** Consulta capacidades on-chain; fallback a secuencial si falla la query. */
export function useAtomicBatchSupport() {
  const { address, isConnected } = useAccount();
  const { data, isLoading, isError, isFetching } = useCapabilities({
    account: address,
    chainId: base.id,
    query: {
      enabled: isConnected && !!address,
      retry: 1,
      staleTime: 30_000,
    },
  });

  return useMemo(
    () => ({
      supportsBatch: data ? chainSupportsAtomicBatch(data, base.id) : false,
      capabilities: data,
      isLoading: isLoading || isFetching,
      queryFailed: isError,
    }),
    [data, isLoading, isFetching, isError]
  );
}
