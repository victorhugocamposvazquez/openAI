"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { fmtUSD, ACCENT, NEG } from "@/lib/format";
import { useApp } from "@/lib/store";
import { Hov, Logo } from "./ui";

const NAV: [string, string][] = [
  ["/", "Inicio"],
  ["/mercado", "Mercado"],
  ["/comprar", "Comprar"],
  ["/swap", "Swap"],
  ["/cartera", "Cartera"],
];

export default function Header() {
  const app = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const pos = app.change >= 0;
  const changeStr = (pos ? "+" : "") + app.change.toFixed(2) + "%";
  const changeColor = pos ? ACCENT : NEG;

  return (
    <header style={css("position:sticky;top:0;z-index:50;background:rgba(255,255,255,0.82);backdrop-filter:saturate(180%) blur(14px);-webkit-backdrop-filter:saturate(180%) blur(14px);border-bottom:1px solid #ECECEC")}>
      <div style={css("max-width:1200px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;gap:20px")}>
        <Link href="/" style={css("text-decoration:none;display:flex;align-items:center;gap:10px")}>
          <Logo />
          <span style={css("font:700 19px var(--font-hanken);letter-spacing:-0.04em;color:#0D0D0D")}>
            apen<span style={{ color: ACCENT }}>AI</span>
          </span>
        </Link>

        <nav data-nav style={css("display:flex;gap:2px")}>
          {NAV.map(([href, label]) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} style={css("text-decoration:none;background:" + (active ? "#F2F2F3" : "transparent") + ";color:" + (active ? "#0D0D0D" : "#6B6B76") + ";font:500 14px/1 var(--font-hanken);padding:9px 14px;border-radius:10px;letter-spacing:-0.01em")}>
                {label}
              </Link>
            );
          })}
        </nav>

        <div style={css("display:flex;align-items:center;gap:10px")}>
          <div data-pricechip style={css("display:flex;align-items:center;gap:8px;padding:7px 12px;border:1px solid #ECECEC;border-radius:999px")}>
            <span style={css("width:6px;height:6px;border-radius:50%;background:" + ACCENT)} />
            <span style={css("font:500 12px var(--font-mono);color:#8A8A94")}>APEN</span>
            <span style={css("font:600 13px var(--font-mono);color:#0D0D0D")}>{fmtUSD(app.price)}</span>
            <span style={{ ...css("font:600 12px var(--font-mono)"), color: changeColor }}>{changeStr}</span>
          </div>
          {app.connected ? (
            <button onClick={() => router.push("/cartera")} style={css("appearance:none;cursor:pointer;display:flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid #ECECEC;background:#fff;border-radius:999px")}>
              <span style={css("width:7px;height:7px;border-radius:50%;background:" + ACCENT)} />
              <span style={css("font:500 13px var(--font-mono);color:#0D0D0D")}>{app.address}</span>
            </button>
          ) : (
            <Hov as="button" onClick={app.openWallet} style="appearance:none;cursor:pointer;background:#0D0D0D;color:#fff;border:none;border-radius:999px;padding:10px 18px;font:600 14px var(--font-hanken);letter-spacing:-0.01em" hover="background:#000">
              Conectar wallet
            </Hov>
          )}
        </div>
      </div>
    </header>
  );
}
