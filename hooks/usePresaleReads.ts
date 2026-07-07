"use client";

import { useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { getPresaleContract, PRESALE_ABI } from "@/lib/onramp/presale-contract";

export function usePresaleRemainingCap() {
  const presale = getPresaleContract();
  return useReadContract({
    address: presale,
    abi: PRESALE_ABI,
    functionName: "remainingCapUSDC",
    chainId: base.id,
    query: { enabled: Boolean(presale) },
  });
}

export function usePresaleOpenQuote(usdcAmount?: bigint) {
  const presale = getPresaleContract();
  return useReadContract({
    address: presale,
    abi: PRESALE_ABI,
    functionName: "quote",
    args: usdcAmount !== undefined ? [usdcAmount] : undefined,
    chainId: base.id,
    query: { enabled: Boolean(presale && usdcAmount && usdcAmount > 0n) },
  });
}
