"use client";

import { useAccount, useBalance, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { formatUnits, type Address } from "viem";
import { ERC20_ABI } from "@/lib/onramp/presale-contract";
import { PAYMENT_TOKENS } from "@/lib/onramp/payment-tokens";
import { OPEN_TOKEN_DECIMALS, USDC_BASE } from "@/lib/onramp/constants";

const REFETCH_MS = 15_000;

/** Dirección del token OPEN en Base (opcional hasta el TGE). */
export function getOpenTokenAddress(): Address | undefined {
  const addr = process.env.NEXT_PUBLIC_OPEN_TOKEN?.trim();
  if (!addr || !addr.startsWith("0x")) return undefined;
  return addr as Address;
}

export type Holding = {
  ticker: string;
  name: string;
  amount: number;
  decimals: number;
  isLoading: boolean;
};

/**
 * Saldos reales on-chain de la wallet conectada en Base:
 * OPEN (si NEXT_PUBLIC_OPEN_TOKEN está configurado), ETH, USDC y cbBTC.
 */
export function useWalletHoldings() {
  const { address, isConnected } = useAccount();
  const openToken = getOpenTokenAddress();

  const eth = useBalance({
    address,
    chainId: base.id,
    query: { enabled: Boolean(address), refetchInterval: REFETCH_MS },
  });

  const erc20Query = (token?: Address) => ({
    address: token,
    abi: ERC20_ABI,
    functionName: "balanceOf" as const,
    args: address ? ([address] as const) : undefined,
    chainId: base.id,
    query: { enabled: Boolean(address && token), refetchInterval: REFETCH_MS },
  });

  const usdc = useReadContract(erc20Query(USDC_BASE.address));
  const cbbtc = useReadContract(erc20Query(PAYMENT_TOKENS.CBBTC.address));
  const open = useReadContract(erc20Query(openToken));

  const num = (raw: bigint | undefined, decimals: number) =>
    raw !== undefined ? Number(formatUnits(raw, decimals)) : 0;

  const holdings: Holding[] = [
    ...(openToken
      ? [
          {
            ticker: "OPEN",
            name: "OPEN Token",
            amount: num(open.data, OPEN_TOKEN_DECIMALS),
            decimals: 2,
            isLoading: open.isLoading,
          },
        ]
      : []),
    {
      ticker: "ETH",
      name: "Ethereum",
      amount: num(eth.data?.value, 18),
      decimals: 4,
      isLoading: eth.isLoading,
    },
    {
      ticker: "USDC",
      name: "USD Coin",
      amount: num(usdc.data, USDC_BASE.decimals),
      decimals: 2,
      isLoading: usdc.isLoading,
    },
    {
      ticker: "BTC",
      name: "Coinbase Wrapped BTC",
      amount: num(cbbtc.data, 8),
      decimals: 5,
      isLoading: cbbtc.isLoading,
    },
  ];

  const isLoading = eth.isLoading || usdc.isLoading || cbbtc.isLoading || open.isLoading;
  const openBalance = num(open.data, OPEN_TOKEN_DECIMALS);

  return { address, isConnected, holdings, openBalance, hasOpenToken: Boolean(openToken), isLoading };
}
