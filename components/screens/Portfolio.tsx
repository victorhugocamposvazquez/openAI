"use client";

import { useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { fmtUSD, fmtN, ACCENT, PRICES_USD } from "@/lib/format";
import { useApp } from "@/lib/store";
import { useMarket } from "@/lib/market";
import { assetMeta } from "@/lib/content";
import { formatAddress } from "@/lib/wagmi/format-address";
import { useWalletHoldings } from "@/hooks/useWalletHoldings";
import { useWalletDisconnect } from "@/hooks/useWalletDisconnect";

export default function Portfolio() {
  const app = useApp();
  const router = useRouter();
  const disconnectWallet = useWalletDisconnect();
  const { price } = useMarket();
  const { address, isConnected, holdings, isLoading } = useWalletHoldings();

  if (!isConnected || !address) {
    return (
      <main style={css("max-width:1100px;margin:0 auto;padding:40px 24px")}>
        <div style={css("display:flex;flex-direction:column;align-items:center;text-align:center;padding:80px 24px")}>
          <span style={css("width:64px;height:64px;border-radius:18px;background:#F4F4F5;display:flex;align-items:center;justify-content:center;margin-bottom:22px")}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8A8A94" strokeWidth="1.8"><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M16 12h3" /></svg></span>
          <h2 style={css("font:600 26px var(--font-hanken);letter-spacing:-0.03em;margin:0 0 8px")}>Conecta tu wallet</h2>
          <p style={css("font:400 16px var(--font-hanken);color:#6B6B76;margin:0 0 24px;max-width:380px")}>Conéctala para ver tus saldos reales en la red Base y tu historial on-chain.</p>
          <button onClick={app.openWallet} style={css("appearance:none;cursor:pointer;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:14px 28px;font:600 16px var(--font-hanken)")}>Conectar wallet</button>
        </div>
      </main>
    );
  }

  // Precios de referencia para valorar en USD (OPEN desde el ticker de mercado).
  const priceOf = (ticker: string) => (ticker === "OPEN" ? price : PRICES_USD[ticker] ?? 0);

  const total = holdings.reduce((acc, h) => acc + h.amount * priceOf(h.ticker), 0);

  const rows = holdings
    .filter((h) => h.amount > 0)
    .map((h) => {
      const val = h.amount * priceOf(h.ticker);
      const pct = total > 0 ? (val / total) * 100 : 0;
      const meta = assetMeta[h.ticker] ?? { name: h.name, color: "#8A8A94", sym: h.ticker[0] ?? "?" };
      return {
        ticker: h.ticker,
        name: meta.name,
        color: meta.color,
        sym: meta.sym,
        amount: fmtN(h.amount, h.decimals) + " " + h.ticker,
        value: fmtUSD(val),
        pct: pct.toFixed(1) + "%",
        width: pct.toFixed(1) + "%",
      };
    });

  return (
    <main style={css("max-width:1100px;margin:0 auto;padding:40px 24px")}>
      <div style={css("display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;margin-bottom:28px")}>
        <div>
          <div style={css("display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap")}>
            <h2 style={css("font:600 26px var(--font-hanken);letter-spacing:-0.03em;margin:0")}>Mi cartera</h2>
            <span title={address} style={css("font:500 12px var(--font-mono);color:#6B6B76;background:#F4F4F5;padding:5px 10px;border-radius:999px")}>{formatAddress(address)}</span>
            <button onClick={disconnectWallet} style={css("appearance:none;border:none;background:none;cursor:pointer;font:500 13px var(--font-hanken);color:#D14343")}>Desconectar</button>
          </div>
          <div style={css("font:500 13px var(--font-hanken);color:#8A8A94")}>Valor total en Base</div>
          <div style={css("display:flex;align-items:baseline;gap:12px")}>
            <span style={css("font:600 42px var(--font-mono);letter-spacing:-0.03em")}>{isLoading ? "…" : fmtUSD(total)}</span>
          </div>
        </div>
        <div style={css("display:flex;gap:10px")}>
          <button onClick={() => router.push("/comprar")} style={css("appearance:none;cursor:pointer;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:12px 22px;font:600 15px var(--font-hanken)")}>Adquirir</button>
        </div>
      </div>
      <div data-2col style={css("display:grid;grid-template-columns:1.4fr 1fr;gap:24px;align-items:start")}>
        <div style={css("background:#fff;border:1px solid #ECECEC;border-radius:20px;overflow:hidden")}>
          <div style={css("padding:18px 22px;border-bottom:1px solid #F0F0F1;font:600 16px var(--font-hanken)")}>Tus activos en Base</div>
          {rows.length > 0 ? (
            rows.map((h) => (
              <div key={h.ticker} style={css("padding:16px 22px;border-bottom:1px solid #F4F4F5;display:flex;align-items:center;gap:14px")}>
                <span style={{ ...css("flex:none;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font:600 13px var(--font-mono)"), background: h.color }}>{h.sym}</span>
                <div style={css("flex:1")}>
                  <div style={css("font:600 15px var(--font-hanken)")}>{h.name}</div>
                  <div style={css("font:400 13px var(--font-mono);color:#8A8A94")}>{h.amount}</div>
                  <div style={css("height:4px;background:#F0F0F1;border-radius:2px;margin-top:8px;overflow:hidden")}><div style={{ height: "100%", width: h.width, background: h.color }} /></div>
                </div>
                <div style={css("text-align:right")}>
                  <div style={css("font:600 15px var(--font-mono)")}>{h.value}</div>
                  <div style={css("font:400 12px var(--font-mono);color:#8A8A94")}>{h.pct}</div>
                </div>
              </div>
            ))
          ) : (
            <div style={css("padding:48px 22px;text-align:center;font:400 14px var(--font-hanken);color:#A8A8AE")}>
              {isLoading ? "Cargando saldos…" : <>Sin saldo en Base todavía.<br />Adquiere OPEN o deposita fondos para empezar.</>}
            </div>
          )}
        </div>
        <div style={css("background:#fff;border:1px solid #ECECEC;border-radius:20px;overflow:hidden")}>
          <div style={css("padding:18px 22px;border-bottom:1px solid #F0F0F1;font:600 16px var(--font-hanken)")}>Movimientos</div>
          <div style={css("padding:28px 22px;text-align:center")}>
            <p style={css("font:400 14px/1.5 var(--font-hanken);color:#6B6B76;margin:0 0 16px")}>
              Tu historial completo de transacciones está en el explorador de la red Base.
            </p>
            <a
              href={`https://basescan.org/address/${address}`}
              target="_blank"
              rel="noreferrer"
              style={css("display:inline-flex;align-items:center;gap:8px;text-decoration:none;background:#fff;color:#0D0D0D;border:1px solid #DADADD;border-radius:12px;padding:12px 18px;font:600 14px var(--font-hanken)")}
            >
              Ver en Basescan
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6" /><path d="M10 14 21 3" /></svg>
            </a>
            <p style={css("font:400 12px/1.5 var(--font-hanken);color:#A8A8AE;margin:16px 0 0")}>
              Las compras de OPEN aparecen como interacciones con el contrato de preventa.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
