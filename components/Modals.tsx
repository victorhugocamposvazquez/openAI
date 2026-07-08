"use client";

import { useEffect } from "react";
import { css } from "@/lib/css";
import { ACCENT } from "@/lib/format";
import { useApp } from "@/lib/store";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";
import { WalletOptions } from "./wallet/WalletOptions";

const OVERLAY = "position:fixed;inset:0;z-index:1000;background:rgba(13,13,13,0.42);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:24px;animation:ov .18s ease";

export function WalletModal() {
  const app = useApp();
  const { walletOpen, closeWallet } = app;

  // Cerrar con Escape y bloquear el scroll de fondo mientras está abierto.
  useEffect(() => {
    if (!walletOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeWallet();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [walletOpen, closeWallet]);

  if (!walletOpen) return null;

  return (
    <div onClick={app.closeWallet} style={css(OVERLAY)} role="dialog" aria-modal="true">
      <div onClick={(e) => e.stopPropagation()} style={css("width:400px;max-width:100%;background:#fff;border-radius:22px;padding:24px;animation:pop .22s cubic-bezier(.2,.7,.2,1)")}>
        <div style={css("display:flex;justify-content:space-between;align-items:center;margin-bottom:6px")}>
          <h3 style={css("font:600 20px var(--font-hanken);letter-spacing:-0.02em;margin:0")}>{BUY_FLOW_COPY.walletModalTitle}</h3>
          <button aria-label="Cerrar" onClick={app.closeWallet} style={css("appearance:none;border:none;background:#F4F4F5;width:30px;height:30px;border-radius:50%;cursor:pointer;color:#6B6B76;font-size:16px")}>×</button>
        </div>
        <p style={css("font:400 14px var(--font-hanken);color:#6B6B76;margin:0 0 18px")}>{BUY_FLOW_COPY.walletModalSubtitle}</p>
        <WalletOptions
          onSuccess={() => {
            app.closeWallet();
            app.toastMsg("Wallet conectada");
          }}
        />
      </div>
    </div>
  );
}

export function Toast() {
  const app = useApp();
  if (!app.toast) return null;
  return (
    <div style={css("position:fixed;bottom:28px;left:50%;z-index:1100;transform:translateX(-50%);background:#0D0D0D;color:#fff;padding:13px 22px;border-radius:999px;font:600 14px var(--font-hanken);box-shadow:0 12px 30px -8px rgba(0,0,0,0.4);animation:tin .25s cubic-bezier(.2,.7,.2,1);display:flex;align-items:center;gap:10px;white-space:nowrap")}>
      <span style={css("width:7px;height:7px;border-radius:50%;background:" + ACCENT)} />
      {app.toast}
    </div>
  );
}
