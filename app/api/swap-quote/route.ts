import { type NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { fetchZeroXSwapQuote } from "@/lib/onramp/zerox";
import { CBBTC_BASE, NATIVE_ETH_ADDRESS, WETH_BASE } from "@/lib/onramp/payment-tokens";
import type { SwapQuoteError } from "@/lib/onramp/swap-quote-types";

/** Solo los tokens de pago soportados — evita usar la API key como proxy abierto. */
const ALLOWED_SELL_TOKENS = new Set(
  [NATIVE_ETH_ADDRESS, WETH_BASE, CBBTC_BASE].map((a) => a.toLowerCase())
);

export async function GET(req: NextRequest) {
  const sellToken = req.nextUrl.searchParams.get("sellToken");
  const sellAmount = req.nextUrl.searchParams.get("sellAmount");
  const taker = req.nextUrl.searchParams.get("taker");

  if (!sellToken || !isAddress(sellToken)) {
    return NextResponse.json({ error: "Token de venta no válido." } satisfies SwapQuoteError, { status: 400 });
  }
  if (!ALLOWED_SELL_TOKENS.has(sellToken.toLowerCase())) {
    return NextResponse.json({ error: "Token de pago no admitido." } satisfies SwapQuoteError, { status: 400 });
  }
  if (!sellAmount || !/^\d+$/.test(sellAmount) || sellAmount === "0") {
    return NextResponse.json({ error: "Importe de venta no válido." } satisfies SwapQuoteError, { status: 400 });
  }
  if (!taker || !isAddress(taker)) {
    return NextResponse.json({ error: "Dirección de wallet no válida." } satisfies SwapQuoteError, { status: 400 });
  }

  try {
    const quote = await fetchZeroXSwapQuote({ sellToken, sellAmount, taker });
    return NextResponse.json(quote);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo obtener la cotización.";
    const fallbackUsdc =
      message === "NO_LIQUIDITY" ||
      message === "QUOTE_INCOMPLETE" ||
      message.includes("liquidity") ||
      message.includes("NO_ROUTE");

    return NextResponse.json(
      {
        error: fallbackUsdc
          ? "No hay liquidez suficiente para este intercambio."
          : message === "ZEROX_API_KEY_MISSING"
            ? "Servicio de cotización no configurado."
            : "No se pudo obtener la cotización de cambio.",
        fallbackUsdc,
      } satisfies SwapQuoteError,
      { status: fallbackUsdc ? 422 : 500 }
    );
  }
}
