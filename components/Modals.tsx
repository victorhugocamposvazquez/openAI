"use client";

import { useEffect, useState } from "react";
import { useConnect, type Connector } from "wagmi";
import { css } from "@/lib/css";
import { ACCENT } from "@/lib/format";
import { useApp } from "@/lib/store";
import { Hov } from "./ui";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";
import { hasWalletConnect } from "@/lib/wagmi/config";
import {
  findCoinbaseWalletConnector,
  findWalletConnectConnector,
  getConnectorId,
  getInjectedWalletOptions,
} from "@/lib/wagmi/connectors";
import { mapConnectError } from "@/lib/wagmi/connect-error";
import { isMobileDevice } from "@/lib/wagmi/device";

const OVERLAY = "position:fixed;inset:0;z-index:1000;background:rgba(13,13,13,0.42);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:24px;animation:ov .18s ease";

const CHAIN_ID = 8453;

export function WalletModal() {
  const app = useApp();
  const { walletOpen, closeWallet } = app;
  const { connect, connectors, isPending, variables, error, reset } = useConnect();
  // Los providers inyectados solo existen en cliente (evita desajuste de hidratación).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Cerrar con Escape.
  useEffect(() => {
    if (!walletOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeWallet();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [walletOpen, closeWallet]);

  if (!walletOpen) return null;

  const coinbaseConnector = findCoinbaseWalletConnector(connectors);
  const injectedWallets = mounted ? getInjectedWalletOptions(connectors) : [];
  const walletConnectConnector = findWalletConnectConnector(connectors);
  const pendingId = isPending ? getConnectorId(variables?.connector as Connector | undefined) : null;

  const connectWith = (connector: Connector) => {
    if (isPending) return;
    reset();
    connect(
      { connector, chainId: CHAIN_ID },
      {
        onSuccess: () => {
          app.closeWallet();
          app.toastMsg("Wallet conectada");
        },
      }
    );
  };

  const option = (
    connector: Connector,
    label: string,
    sub: string,
    icon: React.ReactNode
  ) => (
    <Hov
      key={connector.uid}
      as="button"
      disabled={isPending}
      onClick={() => connectWith(connector)}
      style="appearance:none;cursor:pointer;display:flex;align-items:center;gap:14px;width:100%;background:#fff;border:1px solid #ECECEC;border-radius:14px;padding:14px 16px;text-align:left"
      hover="border-color:#0D0D0D;background:#FAFAFA"
    >
      {icon}
      <span style={css("flex:1")}>
        <span style={css("display:block;font:600 15px var(--font-hanken)")}>
          {pendingId === connector.id ? "Conectando…" : label}
        </span>
        <span style={css("display:block;font:400 12px var(--font-hanken);color:#8A8A94")}>{sub}</span>
      </span>
      <span style={css("color:#C8C8CE;font-size:18px")}>›</span>
    </Hov>
  );

  const letterIcon = (letter: string, color: string) => (
    <span
      style={{
        ...css("flex:none;width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font:700 16px var(--font-hanken)"),
        background: color,
      }}
    >
      {letter}
    </span>
  );

  return (
    <div onClick={app.closeWallet} style={css(OVERLAY)}>
      <div onClick={(e) => e.stopPropagation()} style={css("width:400px;max-width:100%;background:#fff;border-radius:22px;padding:24px;animation:pop .22s cubic-bezier(.2,.7,.2,1)")}>
        <div style={css("display:flex;justify-content:space-between;align-items:center;margin-bottom:6px")}>
          <h3 style={css("font:600 20px var(--font-hanken);letter-spacing:-0.02em;margin:0")}>Conectar wallet</h3>
          <button onClick={app.closeWallet} style={css("appearance:none;border:none;background:#F4F4F5;width:30px;height:30px;border-radius:50%;cursor:pointer;color:#6B6B76;font-size:16px")}>×</button>
        </div>
        <p style={css("font:400 14px var(--font-hanken);color:#6B6B76;margin:0 0 18px")}>Elige tu wallet para conectarte de forma segura.</p>
        <div style={css("display:flex;flex-direction:column;gap:8px")}>
          {coinbaseConnector
            ? option(
                coinbaseConnector,
                BUY_FLOW_COPY.connectFaceId,
                "Coinbase Smart Wallet — sin extensión",
                letterIcon("C", "#2775CA")
              )
            : null}

          {injectedWallets.map((connector) =>
            option(
              connector,
              connector.name,
              "Extensión del navegador",
              connector.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={connector.icon} alt="" width={38} height={38} style={css("flex:none;border-radius:10px")} />
              ) : (
                letterIcon("W", "#8A8A94")
              )
            )
          )}

          {walletConnectConnector
            ? option(
                walletConnectConnector,
                "WalletConnect",
                isMobileDevice() ? "Abre tu wallet móvil" : "Escanea con tu wallet móvil",
                letterIcon("W", "#3A8DFF")
              )
            : null}

          {mounted && injectedWallets.length === 0 ? (
            <p style={css("font:400 12px/1.5 var(--font-hanken);color:#8A8A94;margin:4px 2px 0")}>
              {BUY_FLOW_COPY.noWalletExtension}
            </p>
          ) : null}

          {!walletConnectConnector && !hasWalletConnect ? (
            <p style={css("font:400 12px/1.5 var(--font-hanken);color:#8A8A94;margin:4px 2px 0")}>
              {BUY_FLOW_COPY.walletConnectEnvHint}
            </p>
          ) : null}
        </div>

        {error ? (
          <p style={css("font:400 13px var(--font-hanken);color:#D14343;margin:12px 0 0")}>
            {mapConnectError(error)}
          </p>
        ) : null}
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
