"use client";

import { formatUnits, parseUnits } from "viem";
import { OPEN_TOKEN_DECIMALS, USDC_BASE } from "@/lib/onramp/constants";
import { usePresaleOpenQuote } from "@/hooks/usePresaleReads";
import { useMarket } from "@/lib/market";

/** 100 USDC de muestra para derivar el precio con precisión. */
const SAMPLE_USDC = parseUnits("100", USDC_BASE.decimals);

/**
 * Precio de OPEN en USD.
 * Fuente primaria: el contrato de preventa (quote() on-chain = precio real de venta).
 * Fallback: el ticker simulado de marketing si el contrato no está configurado.
 */
export function useOpenPrice() {
  const { price: simulatedPrice, change } = useMarket();
  const { data: openForSample } = usePresaleOpenQuote(SAMPLE_USDC);

  let price = simulatedPrice;
  let isOnchain = false;

  if (openForSample !== undefined && openForSample > 0n) {
    const openAmount = Number(formatUnits(openForSample, OPEN_TOKEN_DECIMALS));
    if (openAmount > 0) {
      price = 100 / openAmount;
      isOnchain = true;
    }
  }

  return { price, change, isOnchain };
}
