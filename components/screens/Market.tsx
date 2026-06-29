"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { fmtUSD, ACCENT } from "@/lib/format";
import { buildSeries } from "@/lib/series";
import { useMarket } from "@/lib/market";
import { Chart } from "../Chart";

const series = buildSeries();
const SUPPLY = 850000000;
const TFS = ["1D", "1W", "1M", "1Y", "ALL"];

export default function Market() {
  const { price, change } = useMarket();
  const router = useRouter();
  const [tf, setTf] = useState("1M");
  const pos = change >= 0;
  const changeStr = (pos ? "+" : "") + change.toFixed(2) + "%";
  const changeColor = pos ? ACCENT : "#D14343";
  const cap = price * SUPPLY;
  const arr = series[tf];
  const cmax = Math.max(...arr);
  const stats = [
    { label: "Cap. de mercado", value: fmtUSD(cap) },
    { label: "Volumen 24h", value: "$182.4M" },
    { label: "Suministro circulante", value: "850M APEN" },
    { label: "Suministro total", value: "5,000M APEN" },
    { label: "Máximo histórico", value: fmtUSD(cmax) },
    { label: "Recaudado en preventa", value: "$214M" },
  ];

  return (
    <main style={css("max-width:1200px;margin:0 auto;padding:40px 24px")}>
      <div style={css("display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:20px;margin-bottom:24px")}>
        <div>
          <div style={css("display:flex;align-items:center;gap:10px;margin-bottom:8px")}>
            <span style={css("width:30px;height:30px;border-radius:8px;background:#0D0D0D;display:flex;align-items:center;justify-content:center")}><svg width="13" height="13" viewBox="0 0 12 12"><path d="M6 1.6 L10.4 10.4 L1.6 10.4 Z" fill="#fff" /></svg></span>
            <span style={css("font:600 22px var(--font-hanken);letter-spacing:-0.02em")}>APEN <span style={css("color:#9A9AA0;font-weight:400")}>/ USD</span></span>
          </div>
          <div style={css("display:flex;align-items:baseline;gap:12px")}>
            <span style={css("font:600 44px var(--font-mono);letter-spacing:-0.03em")}>{fmtUSD(price)}</span>
            <span style={{ ...css("font:600 17px var(--font-mono)"), color: changeColor }}>{changeStr}</span>
          </div>
        </div>
        <div style={css("display:flex;gap:4px;background:#F4F4F5;padding:4px;border-radius:12px")}>
          {TFS.map((k) => {
            const active = tf === k;
            return (
              <button key={k} onClick={() => setTf(k)} style={{ ...css("appearance:none;border:none;cursor:pointer;font:600 13px var(--font-mono);padding:8px 16px;border-radius:9px"), background: active ? "#fff" : "transparent", color: active ? "#0D0D0D" : "#8A8A94", boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>
                {k}
              </button>
            );
          })}
        </div>
      </div>
      <div style={css("background:#fff;border:1px solid #ECECEC;border-radius:20px;padding:22px;margin-bottom:24px")}>
        <Chart key={tf} series={arr} price={price} height={360} gradId="gMain" />
      </div>
      <div data-2col style={css("display:grid;grid-template-columns:1.6fr 1fr;gap:24px;align-items:start")}>
        <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:1px;background:#ECECEC;border:1px solid #ECECEC;border-radius:18px;overflow:hidden")}>
          {stats.map((m, i) => (
            <div key={i} style={css("background:#fff;padding:20px 22px")}>
              <div style={css("font:500 13px var(--font-hanken);color:#8A8A94;margin-bottom:6px")}>{m.label}</div>
              <div style={css("font:600 19px var(--font-mono);letter-spacing:-0.01em")}>{m.value}</div>
            </div>
          ))}
        </div>
        <div style={css("background:#0D0D0D;color:#fff;border-radius:20px;padding:26px")}>
          <div style={css("font:600 19px var(--font-hanken);letter-spacing:-0.02em;margin-bottom:6px")}>¿Listo para invertir?</div>
          <p style={css("font:400 14px/1.5 var(--font-hanken);color:#B8B8BD;margin:0 0 20px")}>Compra APEN al precio de mercado o intercámbialo desde tu wallet.</p>
          <button onClick={() => router.push("/comprar")} style={css("width:100%;appearance:none;cursor:pointer;background:#fff;color:#0D0D0D;border:none;border-radius:12px;padding:13px;font:600 15px var(--font-hanken);margin-bottom:10px")}>Comprar APEN</button>
          <button onClick={() => router.push("/swap")} style={css("width:100%;appearance:none;cursor:pointer;background:transparent;color:#fff;border:1px solid #3A3A3A;border-radius:12px;padding:13px;font:600 15px var(--font-hanken)")}>Intercambiar</button>
        </div>
      </div>
    </main>
  );
}
