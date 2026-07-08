"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { css } from "@/lib/css";
import { fmtUSD, ACCENT, NEG } from "@/lib/format";
import { useAccount } from "wagmi";
import { useApp } from "@/lib/store";
import { useWalletDisconnect } from "@/hooks/useWalletDisconnect";
import { useOpenPrice } from "@/hooks/useOpenPrice";
import { formatAddress } from "@/lib/wagmi/format-address";
import { Hov, Logo } from "./ui";
import { brandLegal } from "@/lib/brand-legal";

const NAV: { href: string; label: string; badge?: string }[] = [
  { href: "/", label: "Inicio" },
  { href: "/mercado", label: "Mercado" },
  { href: "/comprar", label: "Adquirir" },
  // El swap llega tras el TGE: el badge evita que parezca una función rota.
  { href: "/swap", label: "Swap", badge: "Pronto" },
  { href: "/cartera", label: "Cartera" },
];

const NavLinks = memo(function NavLinks() {
  const pathname = usePathname();
  return (
    <nav data-nav style={css("display:flex;gap:2px")}>
      {NAV.map(({ href, label, badge }) => {
        const active = pathname === href;
        return (
          <Hov
            key={href}
            as={Link}
            href={href}
            prefetch
            style={
              "text-decoration:none;display:inline-flex;align-items:center;gap:6px;background:" +
              (active ? "#F2F2F3" : "transparent") +
              ";color:" +
              (active ? "#0D0D0D" : "#6B6B76") +
              ";font:500 14px/1 var(--font-hanken);padding:9px 14px;border-radius:10px;letter-spacing:-0.01em"
            }
            hover={active ? undefined : "background:#F7F7F8;color:#0D0D0D"}
          >
            {label}
            {badge ? (
              <span
                style={css(
                  "font:600 9px var(--font-hanken);letter-spacing:0.05em;text-transform:uppercase;color:#8A8A94;background:#F2F2F3;padding:2px 6px;border-radius:999px"
                )}
              >
                {badge}
              </span>
            ) : null}
          </Hov>
        );
      })}
    </nav>
  );
});

function PriceChip() {
  const { price, change } = useOpenPrice();
  const pos = change >= 0;
  const changeStr = (pos ? "+" : "") + change.toFixed(2) + "%";
  const changeColor = pos ? ACCENT : NEG;

  return (
    <Hov
      as={Link}
      href="/mercado"
      prefetch
      title="Ver mercado de OPEN"
      data-pricechip
      style="text-decoration:none;display:flex;align-items:center;gap:8px;padding:7px 12px;border:1px solid #ECECEC;border-radius:999px"
      hover="border-color:#0D0D0D"
    >
      <span style={css("width:6px;height:6px;border-radius:50%;background:" + ACCENT)} />
      <span style={css("font:500 12px var(--font-mono);color:#8A8A94")}>OPEN</span>
      <span style={css("font:600 13px var(--font-mono);color:#0D0D0D")}>{fmtUSD(price)}</span>
      <span style={{ ...css("font:600 12px var(--font-mono)"), color: changeColor }}>{changeStr}</span>
    </Hov>
  );
}

function WalletActions() {
  const pathname = usePathname();
  const app = useApp();
  const { address, isConnected, isReconnecting } = useAccount();
  const disconnectWallet = useWalletDisconnect();
  const onComprar = pathname === "/comprar";

  // Mientras wagmi restaura la sesión, hueco neutro (evita el parpadeo
  // de "Conectar wallet" en cada recarga con sesión activa).
  if (isReconnecting) {
    return <div style={css("width:120px;height:38px;border-radius:999px;background:#F4F4F5")} />;
  }

  // Estado real de wagmi como única fuente de verdad.
  if (isConnected && address) {
    return (
      <div style={css("display:flex;align-items:center;gap:8px")}>
        <Link
          href="/cartera"
          prefetch
          style={css("text-decoration:none;cursor:pointer;display:flex;align-items:center;gap:8px;padding:8px 14px;border:1px solid #ECECEC;background:#fff;border-radius:999px")}
        >
          <span style={css("width:7px;height:7px;border-radius:50%;background:" + ACCENT)} />
          <span style={css("font:500 13px var(--font-mono);color:#0D0D0D")}>{formatAddress(address)}</span>
        </Link>
        <Hov
          as="button"
          type="button"
          title="Desconectar wallet"
          onClick={disconnectWallet}
          style="appearance:none;cursor:pointer;display:flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid #ECECEC;background:#fff;border-radius:50%;color:#8A8A94"
          hover="border-color:#D14343;color:#D14343"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </Hov>
      </div>
    );
  }

  // En /comprar el propio flujo de compra gestiona la conexión.
  if (onComprar) {
    return null;
  }

  return (
    <Hov
      as="button"
      type="button"
      onClick={app.openWallet}
      style="appearance:none;cursor:pointer;background:#0D0D0D;color:#fff;border:none;border-radius:999px;padding:10px 18px;font:600 14px var(--font-hanken);letter-spacing:-0.01em"
      hover="background:#000"
    >
      Conectar wallet
    </Hov>
  );
}

export default function Header() {
  return (
    <header data-header style={css("position:sticky;top:0;z-index:50;background:rgba(255,255,255,0.82);backdrop-filter:saturate(180%) blur(14px);-webkit-backdrop-filter:saturate(180%) blur(14px);border-bottom:1px solid #ECECEC")}>
      <div data-header-inner style={css("max-width:1200px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;gap:20px")}>
        <Link href="/" prefetch title={brandLegal.productBrand} style={css("text-decoration:none;display:flex;align-items:center;gap:10px")}>
          <Logo />
          <span data-header-wordmark style={css("font:700 19px var(--font-hanken);letter-spacing:-0.04em;color:#0D0D0D")}>Protocol</span>
        </Link>

        <NavLinks />

        <div style={css("display:flex;align-items:center;gap:10px")}>
          <PriceChip />
          <WalletActions />
        </div>
      </div>
    </header>
  );
}
