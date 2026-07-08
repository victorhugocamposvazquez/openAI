"use client";

import { useAccount, useBalance, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { keepPreviousData } from "@tanstack/react-query";
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

  // keepPreviousData: durante los refrescos periódicos se conserva el último
  // saldo conocido en vez de volver a "sin dato" (evita el parpadeo del total).
  const eth = useBalance({
    address,
    chainId: base.id,
    query: {
      enabled: Boolean(address),
      refetchInterval: REFETCH_MS,
      placeholderData: keepPreviousData,
    },
  });

  const erc20Query = (token?: Address) => ({
    address: token,
    abi: ERC20_ABI,
    functionName: "balanceOf" as const,
    args: address ? ([address] as const) : undefined,
    chainId: base.id,
    query: {
      enabled: Boolean(address && token),
      refetchInterval: REFETCH_MS,
      placeholderData: keepPreviousData,
    },
  });

  const usdc = useReadContract(erc20Query(USDC_BASE.address));
  const cbbtc = useReadContract(erc20Query(PAYMENT_TOKENS.CBBTC.address));
  const open = useReadContract(erc20Query(openToken));

  const num = (raw: bigint | undefined, decimals: number) =>
    raw !== undefined ? Number(formatUnits(raw, decimals)) : 0;

  /**
   * Una consulta está "resuelta" cuando tiene dato o falló definitivamente.
   * isLoading de react-query vuelve a true en cada reintento de una query
   * que nunca tuvo éxito (RPC con rate limit…), lo que hacía parpadear el
   * total a "…" cada pocos segundos. Con esto el esqueleto solo aparece
   * durante la PRIMERA carga; los refrescos de fondo nunca ocultan el valor.
   */
  const pending = (q: { data?: unknown; isError: boolean }) =>
    q.data === undefined && !q.isError;

  const hasWallet = Boolean(address);
  const ethPending = hasWallet && pending(eth);
  const usdcPending = hasWallet && pending(usdc);
  const cbbtcPending = hasWallet && pending(cbbtc);
  const openPending = hasWallet && Boolean(openToken) && pending(open);

  const holdings: Holding[] = [
    ...(openToken
      ? [
          {
            ticker: "OPEN",
            name: "OPEN Token",
            amount: num(open.data, OPEN_TOKEN_DECIMALS),
            decimals: 2,
            isLoading: openPending,
          },
        ]
      : []),
    {
      ticker: "ETH",
      name: "Ethereum",
      amount: num(eth.data?.value, 18),
      decimals: 4,
      isLoading: ethPending,
    },
    {
      ticker: "USDC",
      name: "USD Coin",
      amount: num(usdc.data, USDC_BASE.decimals),
      decimals: 2,
      isLoading: usdcPending,
    },
    {
      ticker: "BTC",
      name: "Coinbase Wrapped BTC",
      amount: num(cbbtc.data, 8),
      decimals: 5,
      isLoading: cbbtcPending,
    },
  ];

  const isLoading = ethPending || usdcPending || cbbtcPending || openPending;
  const openBalance = num(open.data, OPEN_TOKEN_DECIMALS);

  return { address, isConnected, holdings, openBalance, hasOpenToken: Boolean(openToken), isLoading };
}
