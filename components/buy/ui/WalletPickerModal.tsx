"use client";

import { useEffect, useState } from "react";
import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";
import { hasWalletConnect } from "@/lib/wagmi/config";
import {
  clearStaleWalletConnectPairings,
  findWalletConnectConnector,
  getConnectorId,
  getInjectedWalletOptions,
  isWalletConnectConnector,
} from "@/lib/wagmi/connectors";
import { mapConnectError } from "@/lib/wagmi/connect-error";
import { isMobileDevice } from "@/lib/wagmi/device";
import { useConnect, type Connector } from "wagmi";

const CHAIN_ID = 8453;

type Props = {
  onClose: () => void;
};

export function WalletPickerModal({ onClose }: Props) {
  const { connect, connectors, isPending, variables, error, reset } = useConnect();
  // Los providers inyectados solo existen en cliente; evitamos desajustes de hidratación.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Cerrar con Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const injectedWallets = mounted ? getInjectedWalletOptions(connectors) : [];
  const walletConnectConnector = findWalletConnectConnector(connectors);
  const pendingId = isPending ? getConnectorId(variables?.connector as Connector | undefined) : null;

  const connectWith = (connector: Connector) => {
    if (isPending) return;
    const isWc = isWalletConnectConnector(connector.id);
    // Un intento WalletConnect fallido deja pairings a medias que rompen el siguiente.
    if (isWc && error) clearStaleWalletConnectPairings();
    reset();
    connect(
      // Con WalletConnect NO forzamos la red: si la wallet móvil no tiene Base
      // añadida, la sesión se aprueba en la wallet pero la conexión falla al
      // volver. El BaseChainGuard pide el cambio a Base después, con su UI.
      isWc ? { connector } : { connector, chainId: CHAIN_ID },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={css(
        "position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,0.45)"
      )}
      onClick={onClose}
    >
      <div
        style={css(
          "width:100%;max-width:400px;padding:24px;border-radius:20px;background:#fff;border:1px solid #ECECEC;box-shadow:0 20px 60px rgba(0,0,0,0.15)"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={css("font:700 20px/1.25 var(--font-hanken);color:#0D0D0D;margin:0 0 8px")}>
          {BUY_FLOW_COPY.walletModalTitle}
        </h3>
        <p style={css("font:400 14px/1.5 var(--font-hanken);color:#8A8A94;margin:0 0 20px")}>
          {BUY_FLOW_COPY.walletModalSubtitle}
        </p>

        <div style={css("display:flex;flex-direction:column;gap:10px")}>
          {injectedWallets.map((connector) => (
            <Hov
              key={connector.uid}
              as="button"
              type="button"
              disabled={isPending}
              onClick={() => connectWith(connector)}
              style="appearance:none;cursor:pointer;display:flex;align-items:center;gap:12px;width:100%;background:#fff;color:#0D0D0D;border:1px solid #E6E6E8;border-radius:12px;padding:13px 14px;font:600 15px var(--font-hanken);text-align:left"
              hover="border-color:#0D0D0D"
            >
              {connector.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={connector.icon}
                  alt=""
                  width={26}
                  height={26}
                  style={css("border-radius:7px;flex-shrink:0")}
                />
              ) : (
                <span
                  style={css(
                    "width:26px;height:26px;border-radius:7px;background:#F2F2F3;display:inline-flex;align-items:center;justify-content:center;font:700 12px var(--font-hanken);color:#8A8A94;flex-shrink:0"
                  )}
                >
                  W
                </span>
              )}
              <span style={css("flex:1")}>
                {pendingId === connector.id ? "Conectando…" : connector.name}
              </span>
            </Hov>
          ))}

          {mounted && injectedWallets.length === 0 ? (
            <p style={css("font:400 12px/1.5 var(--font-hanken);color:#8A8A94;margin:0")}>
              {BUY_FLOW_COPY.noWalletExtension}
            </p>
          ) : null}

          {walletConnectConnector ? (
            <Hov
              as="button"
              type="button"
              disabled={isPending}
              onClick={() => connectWith(walletConnectConnector)}
              style="appearance:none;cursor:pointer;width:100%;background:#fff;color:#0D0D0D;border:1px solid #E6E6E8;border-radius:12px;padding:14px;font:600 15px var(--font-hanken)"
              hover="border-color:#0D0D0D"
            >
              {pendingId === walletConnectConnector.id
                ? isMobileDevice()
                  ? "Abriendo wallet…"
                  : "Abriendo QR…"
                : BUY_FLOW_COPY.connectWalletConnect}
            </Hov>
          ) : null}

          {!walletConnectConnector && !hasWalletConnect ? (
            <p style={css("font:400 12px var(--font-hanken);color:#8A8A94;margin:0")}>
              {BUY_FLOW_COPY.walletConnectEnvHint}
            </p>
          ) : null}

          <Hov
            as="button"
            type="button"
            onClick={onClose}
            style="appearance:none;cursor:pointer;width:100%;background:#F7F7F8;color:#0D0D0D;border:1px solid #E6E6E8;border-radius:12px;padding:14px;font:600 14px var(--font-hanken)"
            hover="border-color:#0D0D0D"
          >
            Cancelar
          </Hov>
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
