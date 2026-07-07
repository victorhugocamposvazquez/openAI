"use client";

import { useAccount, useBalance, useReadContract } from "wagmi";
import { base } from "wagmi/chains";
import { ERC20_ABI } from "@/lib/onramp/presale-contract";
import {
  getBalanceTokenAddress,
  PAYMENT_TOKEN_LIST,
  type PaymentToken,
  type PaymentTokenId,
} from "@/lib/onramp/payment-tokens";
import { formatUnits } from "viem";

function useTokenBalance(token: PaymentToken, address?: `0x${string}`) {
  const tokenAddress = getBalanceTokenAddress(token);

  const native = useBalance({
    address,
    chainId: base.id,
    query: { enabled: Boolean(address && token.isNative) },
  });

  const erc20 = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: { enabled: Boolean(address && tokenAddress) },
  });

  if (token.isNative) {
    return {
      raw: native.data?.value,
      formatted: native.data
        ? `${Number(formatUnits(native.data.value, token.decimals)).toLocaleString("es-ES", { maximumFractionDigits: 6 })} ${token.symbol}`
        : "—",
      isLoading: native.isLoading,
    };
  }

  return {
    raw: erc20.data,
    formatted: erc20.data !== undefined
      ? `${Number(formatUnits(erc20.data, token.decimals)).toLocaleString("es-ES", { maximumFractionDigits: token.decimals === 8 ? 8 : 6 })} ${token.symbol}`
      : "—",
    isLoading: erc20.isLoading,
  };
}

export function usePaymentTokenBalances() {
  const { address } = useAccount();

  const usdc = useTokenBalance(PAYMENT_TOKEN_LIST[0]!, address);
  const eth = useTokenBalance(PAYMENT_TOKEN_LIST[1]!, address);
  const weth = useTokenBalance(PAYMENT_TOKEN_LIST[2]!, address);
  const cbbtc = useTokenBalance(PAYMENT_TOKEN_LIST[3]!, address);

  const map: Record<PaymentTokenId, ReturnType<typeof useTokenBalance>> = {
    USDC: usdc,
    ETH: eth,
    WETH: weth,
    CBBTC: cbbtc,
  };

  return map;
}
