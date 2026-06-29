"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { fmtUSD, ACCENT } from "@/lib/format";
import { useApp } from "@/lib/store";

const NAV: [string, string][] = [
  ["/", "Inicio"],
  ["/mercado", "Mercado"],
  ["/comprar", "Comprar"],
  ["/swap", "Swap"],
  ["/cartera", "Cartera"],
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <div data-mobnav style={css("position:fixed;bottom:0;left:0;right:0;z-index:60;grid-template-columns:repeat(5,1fr);background:rgba(255,255,255,0.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-top:1px solid #ECECEC;padding:8px 4px env(safe-area-inset-bottom)")}>
      {NAV.map(([href, label]) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} style={{ ...css("text-decoration:none;text-align:center;font:600 11px var(--font-hanken);padding:8px 2px"), color: active ? ACCENT : "#9A9AA0" }}>
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export function MobileCta() {
  const app = useApp();
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === "/comprar" || pathname === "/swap") return null;
  return (
    <div data-mobcta style={css("position:fixed;left:0;right:0;bottom:64px;z-index:55;padding:10px 16px calc(10px + env(safe-area-inset-bottom));background:linear-gradient(to top, rgba(255,255,255,0.96) 60%, rgba(255,255,255,0))")}>
      <button onClick={() => router.push("/comprar")} style={css("width:100%;appearance:none;cursor:pointer;background:#0D0D0D;color:#fff;border:none;border-radius:13px;padding:15px;font:600 16px var(--font-hanken);box-shadow:0 10px 26px -10px rgba(13,13,13,0.5);display:flex;align-items:center;justify-content:center;gap:8px")}>
        Comprar APEN <span style={{ ...css("font:600 13px var(--font-mono)"), color: ACCENT }}>{fmtUSD(app.price)}</span>
      </button>
    </div>
  );
}
