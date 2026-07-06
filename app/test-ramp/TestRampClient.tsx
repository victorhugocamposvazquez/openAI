"use client";

import { useCallback, useRef, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { RAMP_SDK_ENABLED, RAMP_CONFIG } from "@/lib/onramp/constants";
import { openRampWidgetA } from "@/lib/onramp/ramp-open";
import { getRampManualUrl } from "@/lib/onramp/ramp-fallback";
import { resolveRampWidgetUrl, isRampDemoMode } from "@/lib/onramp/ramp-env";
import {
  buildSelfTransferConfig,
  interpretFundingProbeError,
  interpretFundingProbeSuccess,
  type SmartWalletFundingProbeResult,
} from "@/lib/onramp/smart-wallet-funding";

type LogLine = { id: number; text: string };

function formatProbeResult(result: SmartWalletFundingProbeResult): string[] {
  return [
    `── Resultado funding Smart Wallet ──`,
    `outcome: ${result.outcome}`,
    `popup probable: ${result.popupLikelyShown ? "sí" : "no"}`,
    `ofreció funding (heurística): ${result.fundingOfferLikely ? "sí" : "no"}`,
    `interpretación: ${result.interpretation}`,
    ...(result.errorName ? [`error.name: ${result.errorName}`] : []),
    ...(result.errorMessage ? [`error.message: ${result.errorMessage}`] : []),
    ...(result.errorRaw ? [`error.raw: ${result.errorRaw}`] : []),
    ...(result.hash ? [`tx hash: ${result.hash}`] : []),
    `opciones observadas:`,
    ...result.observedOptions.map((o) => `  · ${o}`),
    `Anota manualmente lo que viste en el popup de Coinbase.`,
  ];
}

export default function TestRampClient() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [logs, setLogs] = useState<LogLine[]>([]);
  const logId = useRef(0);
  const cleanupRef = useRef<(() => void) | null>(null);

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

  const runSmartWalletFundingProbe = async () => {
    if (!address || !isConnected) {
      pushLog("Conecta Smart Wallet en /comprar (Face ID) y vuelve aquí.");
      return;
    }

    pushLog("Disparando transfer de 1 USDC → ti mismo (Base)…");
    pushLog("Objetivo: observar popup de Coinbase con fondos insuficientes.");

    try {
      const hash = await writeContractAsync(buildSelfTransferConfig(address));
      const result = interpretFundingProbeSuccess(hash);
      pushLines(formatProbeResult(result));
    } catch (error) {
      const result = interpretFundingProbeError(error);
      pushLines(formatProbeResult(result));
    }
  };

  const runWidget = async (rampUrl?: string) => {
    if (!RAMP_SDK_ENABLED) {
      pushLog("RAMP_SDK_ENABLED=false — vía A desactivada.");
      pushLog(`Vía B manual (sin params): ${getRampManualUrl()}`);
      return;
    }
    if (!address) {
      pushLog("Conecta wallet primero.");
      return;
    }
    cleanupRef.current?.();
    const resolved = resolveRampWidgetUrl(rampUrl);
    pushLog(`Abriendo vía A → ${resolved}${isRampDemoMode() ? " (demo)" : ""}`);

    const session = await openRampWidgetA(
      { userAddress: address, fiatValue: "50", rampUrl },
      {
        onConfigDone: () => pushLog("WIDGET_CONFIG_DONE"),
        onPurchaseCreated: () => pushLog("PURCHASE_CREATED"),
        onWidgetClose: (had) => pushLog(`WIDGET_CLOSE (purchase=${had})`),
        onError: (reason) => {
          pushLog(`Error vía A: ${reason}`);
          pushLog(`Vía B manual: ${getRampManualUrl()}`);
        },
      }
    );

    if (session) cleanupRef.current = session.cleanup;
  };

  return (
    <main style={css("max-width:800px;margin:0 auto;padding:48px 24px 120px")}>
      <h1 style={css("font:700 28px var(--font-hanken);margin:0 0 8px")}>Sandbox funding</h1>
      <p style={css("font:400 14px var(--font-hanken);color:#8A8A94;margin:0 0 24px")}>
        Wallet: {address ?? "no conectada"}
      </p>

      <section style={css("margin-bottom:32px")}>
        <h2 style={css("font:600 18px var(--font-hanken);margin:0 0 12px")}>Coinbase Smart Wallet</h2>
        <Hov
          as="button"
          type="button"
          disabled={isPending}
          onClick={runSmartWalletFundingProbe}
          style="appearance:none;cursor:pointer;background:#0D0D0D;color:#fff;border:none;border-radius:10px;padding:12px 16px;font:600 14px var(--font-hanken)"
          hover="background:#000"
        >
          {isPending ? "Esperando popup…" : "Probar funding Smart Wallet"}
        </Hov>
      </section>

      <section style={css("margin-bottom:24px")}>
        <h2 style={css("font:600 18px var(--font-hanken);margin:0 0 12px")}>Ramp (legacy)</h2>
        <p style={css("font:400 13px var(--font-hanken);color:#8A8A94;margin:0 0 12px")}>
          SDK: {RAMP_SDK_ENABLED ? "on" : "off"} · URL manual: {getRampManualUrl()}
        </p>
        <div style={css("display:flex;flex-wrap:wrap;gap:10px")}>
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
              onClick={() => runWidget(RAMP_CONFIG.demoUrl)}
              style="appearance:none;cursor:pointer;background:#fff;color:#0D0D0D;border:1px solid #E6E6E8;border-radius:10px;padding:12px 14px;font:600 13px var(--font-hanken)"
              hover="border-color:#0D0D0D"
            >
              Ramp SDK demo
            </Hov>
          ) : null}
        </div>
      </section>

      <pre style={css("background:#0D0D0D;color:#E8E8EA;border-radius:12px;padding:16px;font:400 12px/1.5 var(--font-mono);max-height:420px;overflow:auto;white-space:pre-wrap")}>
        {logs.length === 0 ? "Sin eventos aún." : logs.map((l) => l.text).join("\n")}
      </pre>
    </main>
  );
}
