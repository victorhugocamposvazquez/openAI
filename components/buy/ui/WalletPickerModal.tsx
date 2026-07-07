"use client";

import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";
import { hasWalletConnect } from "@/lib/wagmi/config";
import {
  findInjectedConnector,
  findWalletConnectConnector,
  getConnectorId,
} from "@/lib/wagmi/connectors";
import { isMobileDevice } from "@/lib/wagmi/device";
import { useConnect, type Connector } from "wagmi";

const CHAIN_ID = 8453;

type Props = {
  onClose: () => void;
};

export function WalletPickerModal({ onClose }: Props) {
  const { connect, connectors, isPending, variables, error } = useConnect();

  const injectedConnector = findInjectedConnector(connectors);
  const walletConnectConnector = findWalletConnectConnector(connectors);
  const pendingId = isPending ? getConnectorId(variables?.connector as Connector | undefined) : null;

  const connectWith = (connector: Connector) => {
    if (isPending) return;
    connect(
      { connector, chainId: CHAIN_ID },
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
          {injectedConnector ? (
            <Hov
              as="button"
              type="button"
              disabled={isPending}
              onClick={() => connectWith(injectedConnector)}
              style="appearance:none;cursor:pointer;width:100%;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:14px;font:600 15px var(--font-hanken)"
              hover="background:#000"
            >
              {pendingId === injectedConnector.id ? "Conectando…" : BUY_FLOW_COPY.connectInjected}
            </Hov>
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
          <p style={css("font:400 13px var(--font-hanken);color:#D14343;margin:12px 0 0")}>{error.message}</p>
        ) : null}
      </div>
    </div>
  );
}
