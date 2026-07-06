"use client";

import { useCallback, useRef, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { RAMP_SDK_ENABLED } from "@/lib/onramp/constants";
import { openRampWidgetA } from "@/lib/onramp/ramp-open";
import { getRampManualUrl } from "@/lib/onramp/ramp-fallback";
import { resolveRampWidgetUrl, isRampDemoMode } from "@/lib/onramp/ramp-env";
import {
  fetchWalletCapabilities,
  runSmartWalletFundingProbe,
  type SmartWalletFundingProbeResult,
} from "@/lib/onramp/smart-wallet-funding";
import { BASE_ACCOUNT_CONNECTOR_ID, getWalletFundingProfile } from "@/lib/wagmi/wallet-kind";

type LogLine = { id: number; text: string };

function formatProbeResult(result: SmartWalletFundingProbeResult): string[] {
  return [
    "── Resultado funding ──",
    `método: ${result.method}`,
    `outcome: ${result.outcome}`,
    `wallet: ${result.method === "wallet_sendCalls" ? "Base Account (sendCalls)" : "EOA / extensión"}`,
    `popup probable: ${result.popupLikelyShown ? "sí" : "no"}`,
    `funding (heurística): ${result.fundingOfferLikely ? "sí" : "no"}`,
    `interpretación: ${result.interpretation}`,
    ...(result.capabilities ? [`capabilities: ${JSON.stringify(result.capabilities, null, 2)}`] : []),
    ...(result.errorName ? [`error.name: ${result.errorName}`] : []),
    ...(result.errorMessage ? [`error.message: ${result.errorMessage}`] : []),
    ...(result.hash ? [`hash/id: ${result.hash}`] : []),
    "opciones:",
    ...result.observedOptions.map((o) => `  · ${o}`),
  ];
}

export default function TestRampClient() {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending: connecting } = useConnect();
  const { disconnect } = useDisconnect();
  const [logs, setLogs] = useState<LogLine[]>([]);
  const logId = useRef(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  const walletProfile = getWalletFundingProfile(connector?.id);
  const baseAccountConnector = connectors.find((c) => c.id === BASE_ACCOUNT_CONNECTOR_ID);

  const pushLog = useCallback((text: string) => {
    logId.current += 1;
    setLogs((prev) => [{ id: logId.current, text }, ...prev].slice(0, 120));
  }, []);

  const pushLines = useCallback(
    (lines: string[]) => {
      lines.forEach(pushLog);
    },
    [pushLog]
  );

  const connectBaseAccount = () => {
    if (!baseAccountConnector) {
      pushLog("Conector baseAccount no disponible.");
      return;
    }
    connect({ connector: baseAccountConnector, chainId: 8453 });
  };

  const runSmartWalletFundingProbeTest = async () => {
    if (!address || !isConnected) {
      pushLog("Conecta Base Account primero (botón de abajo).");
      return;
    }

    pushLog(`Conector: ${connector?.id ?? "?"} (${walletProfile.label})`);

    if (!walletProfile.supportsIntegratedFunding) {
      pushLog(walletProfile.hint ?? "Necesitas Base Account, no la extensión Coinbase.");
      pushLog("Desconecta → «Conectar Base Account (Face ID)».");
      return;
    }

    const provider = (await connector?.getProvider()) as
      | { request: (args: { method: string; params?: unknown }) => Promise<unknown> }
      | undefined;

    if (!provider) {
      pushLog("No se pudo obtener el provider del conector.");
      return;
    }

    const capabilities = await fetchWalletCapabilities(provider, address);
    pushLog(`capabilities: ${JSON.stringify(capabilities)}`);
    pushLog("Disparando wallet_sendCalls (1 USDC self-transfer)…");

    const result = await runSmartWalletFundingProbe({
      address,
      useSendCalls: true,
      provider,
      capabilities,
    });

    pushLines(formatProbeResult(result));
  };

  const runWidget = async (rampUrl?: string) => {
    if (!RAMP_SDK_ENABLED) {
      pushLog("RAMP_SDK_ENABLED=false");
      pushLog(`Ramp manual: ${getRampManualUrl()}`);
      return;
    }
    if (!address) {
      pushLog("Conecta wallet primero.");
      return;
    }
    cleanupRef.current?.();
    const resolved = resolveRampWidgetUrl(rampUrl);
    pushLog(`vía A → ${resolved}${isRampDemoMode() ? " (demo)" : ""}`);

    const session = await openRampWidgetA(
      { userAddress: address, fiatValue: "50", rampUrl },
      {
        onConfigDone: () => pushLog("WIDGET_CONFIG_DONE"),
        onPurchaseCreated: () => pushLog("PURCHASE_CREATED"),
        onWidgetClose: (had) => pushLog(`WIDGET_CLOSE (purchase=${had})`),
        onError: (reason) => pushLog(`Error vía A: ${reason}`),
      }
    );

    if (session) cleanupRef.current = session.cleanup;
  };

  return (
    <main style={css("max-width:800px;margin:0 auto;padding:48px 24px 120px")}>
      <h1 style={css("font:700 28px var(--font-hanken);margin:0 0 8px")}>Sandbox funding</h1>
      <p style={css("font:400 14px var(--font-hanken);color:#8A8A94;margin:0 0 8px")}>
        Wallet: {address ?? "no conectada"}
      </p>
      <p style={css("font:400 13px var(--font-hanken);color:#B8B8BD;margin:0 0 24px")}>
        Conector: {connector?.id ?? "—"} · {walletProfile.label}
      </p>

      <section style={css("margin-bottom:32px")}>
        <h2 style={css("font:600 18px var(--font-hanken);margin:0 0 12px")}>Base Account (Smart Wallet)</h2>
        <div style={css("display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px")}>
          {!isConnected ? (
            <Hov
              as="button"
              type="button"
              disabled={connecting}
              onClick={connectBaseAccount}
              style="appearance:none;cursor:pointer;background:#0D0D0D;color:#fff;border:none;border-radius:10px;padding:12px 16px;font:600 14px var(--font-hanken)"
              hover="background:#000"
            >
              {connecting ? "Conectando…" : "Conectar Base Account (Face ID)"}
            </Hov>
          ) : (
            <Hov
              as="button"
              type="button"
              onClick={() => disconnect()}
              style="appearance:none;cursor:pointer;background:#fff;color:#0D0D0D;border:1px solid #E6E6E8;border-radius:10px;padding:12px 16px;font:600 14px var(--font-hanken)"
              hover="border-color:#0D0D0D"
            >
              Desconectar
            </Hov>
          )}
          <Hov
            as="button"
            type="button"
            onClick={runSmartWalletFundingProbeTest}
            style="appearance:none;cursor:pointer;background:#0D0D0D;color:#fff;border:none;border-radius:10px;padding:12px 16px;font:600 14px var(--font-hanken)"
            hover="background:#000"
          >
            Probar funding Smart Wallet
          </Hov>
        </div>
        {!walletProfile.supportsIntegratedFunding && isConnected ? (
          <p style={css("font:400 13px/1.5 var(--font-hanken);color:#D14343;margin:0")}>
            {walletProfile.hint}
          </p>
        ) : null}
      </section>

      <section style={css("margin-bottom:24px")}>
        <h2 style={css("font:600 18px var(--font-hanken);margin:0 0 12px")}>Ramp (legacy)</h2>
        <Hov
          as="button"
          type="button"
          onClick={() => window.open(getRampManualUrl(), "_blank")}
          style="appearance:none;cursor:pointer;background:#fff;color:#0D0D0D;border:1px solid #E6E6E8;border-radius:10px;padding:12px 16px;font:600 14px var(--font-hanken)"
          hover="border-color:#0D0D0D"
        >
          Abrir Ramp sin params
        </Hov>
        {RAMP_SDK_ENABLED ? (
          <Hov
            as="button"
            type="button"
            onClick={() => runWidget()}
            style="appearance:none;cursor:pointer;margin-left:10px;background:#fff;color:#0D0D0D;border:1px solid #E6E6E8;border-radius:10px;padding:12px 14px;font:600 13px var(--font-hanken)"
            hover="border-color:#0D0D0D"
          >
            Ramp SDK
          </Hov>
        ) : null}
      </section>

      <pre style={css("background:#0D0D0D;color:#E8E8EA;border-radius:12px;padding:16px;font:400 12px/1.5 var(--font-mono);max-height:420px;overflow:auto;white-space:pre-wrap")}>
        {logs.length === 0 ? "Sin eventos aún." : logs.map((l) => l.text).join("\n")}
      </pre>
    </main>
  );
}
