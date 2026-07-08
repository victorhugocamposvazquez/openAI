import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Ticker → id de CoinGecko. */
const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  AVAX: "avalanche-2",
  LINK: "chainlink",
  DOT: "polkadot",
  USDC: "usd-coin",
};

export type LivePrice = { usd: number; change24h: number };
export type PricesResponse = {
  prices: Record<string, LivePrice>;
  updatedAt: number;
};

export async function GET() {
  const ids = Object.values(COINGECKO_IDS).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

  try {
    // Caché de datos de Next: una llamada real a CoinGecko por minuto como máximo.
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`coingecko ${res.status}`);
    const data = (await res.json()) as Record<string, { usd?: number; usd_24h_change?: number }>;

    const prices: Record<string, LivePrice> = {};
    for (const [ticker, id] of Object.entries(COINGECKO_IDS)) {
      const row = data[id];
      if (row?.usd !== undefined) {
        prices[ticker] = { usd: row.usd, change24h: row.usd_24h_change ?? 0 };
      }
    }

    if (Object.keys(prices).length === 0) throw new Error("empty response");

    return NextResponse.json<PricesResponse>(
      { prices, updatedAt: Date.now() },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
    );
  } catch {
    // El cliente hará fallback a los precios de referencia locales.
    return NextResponse.json({ error: "PRICES_UNAVAILABLE" }, { status: 502 });
  }
}
