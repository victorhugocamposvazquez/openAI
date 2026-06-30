"use client";

import { css } from "@/lib/css";
import { fmtUSD } from "@/lib/format";
import { useMarket } from "@/lib/market";
import { baseTk } from "@/lib/content";

export default function Marquee() {
  const { price, change } = useMarket();
  const pos = change >= 0;
  const changeStr = (pos ? "+" : "") + change.toFixed(2) + "%";
  const tk = [...baseTk, { s: "OPEN", p: fmtUSD(price), c: changeStr, up: pos }];
  const items = [...tk, ...tk];

  return (
    <div style={css("border-bottom:1px solid #F2F2F3;background:#fff;overflow:hidden;white-space:nowrap")}>
      <div style={css("display:inline-flex;align-items:center;animation:scrollx 60s linear infinite;will-change:transform")}>
        {items.map((t, i) => (
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
