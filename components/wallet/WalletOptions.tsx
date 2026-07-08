"use client";

import { useEffect, useState } from "react";
import { useConnect, type Connector } from "wagmi";
import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";
import { hasWalletConnect } from "@/lib/wagmi/config";
import {
  clearStaleWalletConnectPairings,
  findCoinbaseWalletConnector,
  findWalletConnectConnector,
  getConnectorId,
  getInjectedWalletOptions,
  isWalletConnectConnector,
} from "@/lib/wagmi/connectors";
import { mapConnectError } from "@/lib/wagmi/connect-error";
import { isMobileDevice } from "@/lib/wagmi/device";

const CHAIN_ID = 8453;

type WalletOption = {
  key: string;
  connector: Connector;
  label: string;
  sub: string;
  pendingLabel: string;
  icon: React.ReactNode;
  recommended?: boolean;
};

type Props = {
  /** Se invoca cuando la conexión termina bien (cerrar modal, toast…). */
  onSuccess: () => void;
};

function letterIcon(letter: string, color: string) {
  return (
    <span
      style={{
        ...css(
          "flex:none;width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font:700 16px var(--font-hanken)"
        ),
        background: color,
      }}
    >
      {letter}
    </span>
  );
}

function phoneIcon() {
  return (
    <span
      style={css(
        "flex:none;width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:#3A8DFF"
      )}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="2" width="12" height="20" rx="3" />
        <path d="M11 18h2" />
      </svg>
    </span>
  );
}

function connectorIcon(connector: Connector) {
  return connector.icon ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={connector.icon}
      alt=""
      width={38}
      height={38}
      style={css("flex:none;border-radius:10px")}
    />
  ) : (
    letterIcon("W", "#8A8A94")
  );
}

/**
 * Lista de formas de conectar, compartida por todos los selectores de wallet.
 * Reglas de usabilidad:
 * - Cero tecnicismos: nunca se muestra "WalletConnect" ni "inyectada".
 * - El orden depende del dispositivo: en móvil primero la app de wallet,
 *   en escritorio primero las extensiones detectadas.
 * - Nada de mensajes en negativo ("no detectamos…"): si no hay extensión,
 *   simplemente se ofrecen las alternativas que sí funcionan.
 */
export function WalletOptions({ onSuccess }: Props) {
  const { connect, connectors, isPending, variables, error, reset } = useConnect();
  // Los providers inyectados y el user-agent solo existen en cliente.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pendingId = isPending
    ? getConnectorId(variables?.connector as Connector | undefined)
    : null;

  const connectWith = (connector: Connector) => {
    if (isPending) return;
    const isWc = isWalletConnectConnector(connector.id);
    // Un intento WalletConnect fallido deja pairings a medias que rompen el siguiente.
    if (isWc && error) clearStaleWalletConnectPairings();
    reset();
    connect(
      // Con la wallet móvil NO forzamos la red: si no tiene Base añadida, la
      // sesión se aprueba en la wallet pero la conexión muere al volver.
      // El BaseChainGuard pide el cambio a Base después, con su propia UI.
      isWc ? { connector } : { connector, chainId: CHAIN_ID },
      { onSuccess }
    );
  };

  if (!mounted) return <div style={css("height:120px")} />;

  const mobile = isMobileDevice();
  const injected = getInjectedWalletOptions(connectors);
  const wc = findWalletConnectConnector(connectors);
  const coinbase = findCoinbaseWalletConnector(connectors);

  const injectedOptions: WalletOption[] = injected.map((connector) => ({
    key: connector.uid,
    connector,
    label: connector.name,
    sub: BUY_FLOW_COPY.walletOptionExtensionSub,
    pendingLabel: BUY_FLOW_COPY.walletConnecting,
    icon: connectorIcon(connector),
  }));

  const wcOption: WalletOption | null = wc
    ? {
        key: "mobile-wallet",
        connector: wc,
        label: mobile ? BUY_FLOW_COPY.walletOptionMobileApp : BUY_FLOW_COPY.walletOptionQr,
        sub: mobile ? BUY_FLOW_COPY.walletOptionMobileAppSub : BUY_FLOW_COPY.walletOptionQrSub,
        pendingLabel: mobile ? BUY_FLOW_COPY.walletOpeningApp : BUY_FLOW_COPY.walletOpeningQr,
        icon: phoneIcon(),
      }
    : null;

  const createOption: WalletOption | null = coinbase
    ? {
        key: "create-wallet",
        connector: coinbase,
        label: BUY_FLOW_COPY.walletOptionCreate,
        sub: BUY_FLOW_COPY.walletOptionCreateSub,
        pendingLabel: BUY_FLOW_COPY.walletConnecting,
        icon: letterIcon("+", "#2775CA"),
      }
    : null;

  // Primero la wallet que el usuario ya tiene delante: extensiones detectadas
  // (en móvil, el provider inyectado solo existe dentro del navegador de una
  // wallet, y entonces es la suya); después la wallet del móvil y, por último,
  // crear una nueva.
  const options = [...injectedOptions, wcOption, createOption].filter(
    Boolean
  ) as WalletOption[];

  if (options.length > 0) options[0]!.recommended = true;

  return (
    <div style={css("display:flex;flex-direction:column;gap:8px")}>
      {options.map((opt) => (
        <Hov
          key={opt.key}
          as="button"
          type="button"
          disabled={isPending}
          onClick={() => connectWith(opt.connector)}
          style="appearance:none;cursor:pointer;display:flex;align-items:center;gap:14px;width:100%;background:#fff;border:1px solid #ECECEC;border-radius:14px;padding:14px 16px;text-align:left"
          hover="border-color:#0D0D0D;background:#FAFAFA"
        >
          {opt.icon}
          <span style={css("flex:1;min-width:0")}>
            <span style={css("display:flex;align-items:center;gap:8px")}>
              <span style={css("font:600 15px var(--font-hanken);color:#0D0D0D")}>
                {pendingId === opt.connector.id ? opt.pendingLabel : opt.label}
              </span>
              {opt.recommended && pendingId !== opt.connector.id ? (
                <span
                  style={{
                    ...css("font:600 10px var(--font-hanken);letter-spacing:0.04em;text-transform:uppercase;padding:3px 7px;border-radius:999px;color:#0E8C6A"),
                    background: "color-mix(in srgb, var(--accent,#0E8C6A) 12%, #fff)",
                  }}
                >
                  Recomendado
                </span>
              ) : null}
            </span>
            <span style={css("display:block;font:400 12px var(--font-hanken);color:#8A8A94;margin-top:2px")}>
              {opt.sub}
            </span>
          </span>
          <span style={css("color:#C8C8CE;font-size:18px")}>›</span>
        </Hov>
      ))}

      {!mobile && injectedOptions.length === 0 && options.length > 0 ? (
        <p style={css("font:400 12px/1.5 var(--font-hanken);color:#8A8A94;margin:4px 2px 0")}>
          {BUY_FLOW_COPY.noExtensionHint}
        </p>
      ) : null}

      {options.length === 0 ? (
        <p style={css("font:400 13px/1.5 var(--font-hanken);color:#8A8A94;margin:0")}>
          {hasWalletConnect
            ? "No hay ninguna forma de conexión disponible en este navegador."
            : BUY_FLOW_COPY.walletConnectEnvHint}
        </p>
      ) : null}

      {error ? (
        <p style={css("font:400 13px var(--font-hanken);color:#D14343;margin:8px 0 0")}>
          {mapConnectError(error)}
        </p>
      ) : null}
    </div>
  );
}
