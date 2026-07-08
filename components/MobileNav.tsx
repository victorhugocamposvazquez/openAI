"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";
import { css } from "@/lib/css";
import { fmtUSD, ACCENT } from "@/lib/format";
import { useOpenPrice } from "@/hooks/useOpenPrice";
import { brandLegal } from "@/lib/brand-legal";

const NAV: { href: string; label: string; icon: (active: boolean) => ReactElement }[] = [
  {
    href: "/",
    label: "Inicio",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" stroke={active ? ACCENT : "#6B6B76"} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/mercado",
    label: "Mercado",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 19V5M4 19h16M8 19V11M12 19V7M16 19v-4" stroke={active ? ACCENT : "#6B6B76"} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/comprar",
    label: "Adquirir",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke={active ? ACCENT : "#6B6B76"} strokeWidth="1.8" />
        <path d="M12 8v8M8 12h8" stroke={active ? ACCENT : "#6B6B76"} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/swap",
    label: "Swap",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M7 7h11l-2-2M17 17H6l2 2" stroke={active ? ACCENT : "#6B6B76"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 17V7M17 7v10" stroke={active ? ACCENT : "#6B6B76"} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/cartera",
    label: "Cartera",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H18v14H6.5A2.5 2.5 0 0 1 4 17.5v-9Z" stroke={active ? ACCENT : "#6B6B76"} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M18 10h2.5A1.5 1.5 0 0 1 22 11.5v3A1.5 1.5 0 0 1 20.5 16H18" stroke={active ? ACCENT : "#6B6B76"} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function MobileCtaPrice() {
  const { price } = useOpenPrice();
  return (
    <span style={{ ...css("font:600 13px var(--font-mono)"), color: ACCENT }}>{fmtUSD(price)}</span>
  );
}

/** Barra inferior fija: CTA + navegación en un solo bloque (sin huecos). */
export const MobileDock = memo(function MobileDock() {
  const pathname = usePathname();
  const showCta = pathname !== "/comprar" && pathname !== "/swap";

  return (
    <div
      data-mobile-dock
      style={css(
        "position:fixed;bottom:0;left:0;right:0;z-index:60;background:#fff;border-top:1px solid #D8D8DC;box-shadow:0 -8px 24px rgba(13,13,13,0.08);padding-bottom:env(safe-area-inset-bottom)"
      )}
    >
      {showCta && (
        <div data-mobcta style={css("padding:8px 12px 0")}>
          <Link
            href="/comprar"
            prefetch
            style={css(
              "width:100%;text-decoration:none;cursor:pointer;background:#0D0D0D;color:#fff;border-radius:14px;padding:13px 16px;font:600 16px var(--font-hanken);box-shadow:0 8px 20px -8px rgba(13,13,13,0.35);display:flex;align-items:center;justify-content:center;gap:8px"
            )}
          >
            {brandLegal.suggestedCta} <MobileCtaPrice />
          </Link>
        </div>
      )}
      <nav
        data-mobnav
        aria-label="Navegación principal"
        style={css("display:grid;grid-template-columns:repeat(5,1fr);padding:4px 6px 6px")}
      >
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              prefetch
              aria-current={active ? "page" : undefined}
              style={{
                ...css("text-decoration:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:6px 4px;border-radius:12px;min-height:48px"),
                background: active ? "color-mix(in srgb, var(--accent) 10%, #fff)" : "transparent",
              }}
            >
              {icon(active)}
              <span style={{ ...css("font:600 10px var(--font-hanken);letter-spacing:0.01em"), color: active ? ACCENT : "#6B6B76" }}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
});

/** @deprecated Usar MobileDock */
export const MobileNav = MobileDock;
/** @deprecated Usar MobileDock */
export function MobileCta() {
  return null;
}
