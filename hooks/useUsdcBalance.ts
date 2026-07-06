"use client";

import { useBalance } from "wagmi";
import { base } from "wagmi/chains";
import { USDC_BASE } from "@/lib/onramp/constants";

const REFETCH_MS = 10_000;

export function useUsdcBalance(address?: `0x${string}`) {
  return useBalance({
    address,
    token: USDC_BASE.address,
    chainId: base.id,
    query: {
      enabled: Boolean(address),
      refetchInterval: REFETCH_MS,
    },
  });
}
