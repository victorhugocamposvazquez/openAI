"use client";

import { css } from "@/lib/css";
import { fmtUSD } from "@/lib/format";
import { baseTk } from "@/lib/content";
import { useLivePrices } from "@/hooks/useLivePrices";
import { useOpenPrice } from "@/hooks/useOpenPrice";

const TICKERS = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "AVAX", "LINK", "DOT"];

export default function Marquee() {
  const live = useLivePrices();
  const { price, change } = useOpenPrice();
  const pos = change >= 0;
  const changeStr = (pos ? "+" : "") + change.toFixed(2) + "%";

  // Precios reales de CoinGecko; mientras cargan, los de referencia estáticos.
  const tk = TICKERS.map((s) => {
    const p = live.prices?.[s];
    if (p) {
      const up = p.change24h >= 0;
      return { s, p: fmtUSD(p.usd), c: (up ? "+" : "") + p.change24h.toFixed(1) + "%", up };
    }
    return baseTk.find((t) => t.s === s) ?? { s, p: "—", c: "", up: true };
  });

  const items = [...tk, { s: "OPEN", p: fmtUSD(price), c: changeStr, up: pos }];
  const doubled = [...items, ...items];

  return (
    <div style={css("border-bottom:1px solid #F2F2F3;background:#fff;overflow:hidden;white-space:nowrap")} data-marquee>
      <div style={css("display:inline-flex;align-items:center;animation:scrollx 60s linear infinite;will-change:transform")}>
        {doubled.map((t, i) => (
          <span key={i} style={css("display:inline-flex;align-items:center;gap:6px;padding:7px 0")}>
            <span style={css("font:500 11px var(--font-mono);color:#9A9AA0")}>{t.s}</span>
            <span style={css("font:400 11px var(--font-mono);color:#B4B4BA")}>{t.p}</span>
            <span style={{ ...css("font:400 11px var(--font-mono)"), color: t.up ? "#9FB0AA" : "#B7A2A2" }}>{t.c}</span>
            <span style={css("font:400 11px var(--font-mono);color:#DADADD;padding:0 10px")}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
