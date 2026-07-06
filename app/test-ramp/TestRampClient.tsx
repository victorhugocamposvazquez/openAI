"use client";

import { useCallback, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { ONRAMP_FIAT, RAMP_CONFIG } from "@/lib/onramp/constants";
import { openRampWidgetA } from "@/lib/onramp/ramp-open";
import { buildRampFallbackUrl } from "@/lib/onramp/ramp-fallback";
import { resolveRampWidgetUrl } from "@/lib/onramp/ramp-env";

type LogLine = { id: number; text: string };

export default function TestRampClient() {
  const { address } = useAccount();
  const [logs, setLogs] = useState<LogLine[]>([]);
  const logId = useRef(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  const pushLog = useCallback((text: string) => {
    logId.current += 1;
    setLogs((prev) => [{ id: logId.current, text }, ...prev].slice(0, 80));
  }, []);

  const runWidget = async (rampUrl?: string) => {
    if (!address) {
      pushLog("Conecta wallet primero en /comprar o aquí con wagmi.");
      return;
    }
    cleanupRef.current?.();
    pushLog(`Abriendo widget (${rampUrl ?? "producción"})…`);

    const session = await openRampWidgetA(
      { userAddress: address, fiatValue: ONRAMP_FIAT.defaultValue, rampUrl },
      {
        onConfigDone: () => pushLog("WIDGET_CONFIG_DONE"),
        onPurchaseCreated: () => pushLog("PURCHASE_CREATED"),
        onWidgetClose: (had) => pushLog(`WIDGET_CLOSE (purchase=${had})`),
        onError: (reason) => {
          pushLog(`Error / fallback: ${reason}`);
          const url = buildRampFallbackUrl(address, ONRAMP_FIAT.defaultValue, resolveRampWidgetUrl(rampUrl));
          pushLog(`URL B: ${url}`);
        },
      }
    );

    if (session) cleanupRef.current = session.cleanup;
  };

  return (
    <main style={css("max-width:800px;margin:0 auto;padding:48px 24px 120px")}>
      <h1 style={css("font:700 28px var(--font-hanken);margin:0 0 8px")}>Sandbox Ramp</h1>
      <p style={css("font:400 14px var(--font-hanken);color:#8A8A94;margin:0 0 24px")}>
        Prueba el widget en demo o producción. Dirección: {address ?? "no conectada"}
      </p>

      <div style={css("display:flex;flex-wrap:wrap;gap:10px;margin-bottom:24px")}>
        <Hov
          as="button"
          type="button"
          onClick={() => runWidget(RAMP_CONFIG.demoUrl)}
          style="appearance:none;cursor:pointer;background:#0D0D0D;color:#fff;border:none;border-radius:10px;padding:12px 16px;font:600 14px var(--font-hanken)"
          hover="background:#000"
        >
          Demo Ramp
        </Hov>
        <Hov
          as="button"
          type="button"
          onClick={() => runWidget()}
          style="appearance:none;cursor:pointer;background:#fff;color:#0D0D0D;border:1px solid #E6E6E8;border-radius:10px;padding:12px 16px;font:600 14px var(--font-hanken)"
          hover="border-color:#0D0D0D"
        >
          Producción
        </Hov>
      </div>

      <pre style={css("background:#0D0D0D;color:#E8E8EA;border-radius:12px;padding:16px;font:400 12px/1.5 var(--font-mono);max-height:360px;overflow:auto")}>
        {logs.length === 0 ? "Sin eventos aún." : logs.map((l) => `${l.text}\n`).join("")}
      </pre>
    </main>
  );
}
