"use client";

import { useCallback, useRef, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { formatUnits } from "viem";
import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { formatUsdcBalance, USDC_BASE } from "@/lib/onramp/constants";
import { useUsdcBalance } from "@/hooks/useUsdcBalance";
import { getWalletFundingProfile } from "@/lib/wagmi/wallet-kind";

type LogLine = { id: number; text: string };

export default function TestRampClient() {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending: connecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balanceData, isSuccess } = useUsdcBalance(address);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const logId = useRef(0);

  const walletProfile = getWalletFundingProfile(connector?.id);
  const injectedConnector = connectors.find((c) => c.id === "injected" || c.type === "injected");

  const pushLog = useCallback((text: string) => {
    logId.current += 1;
    setLogs((prev) => [{ id: logId.current, text }, ...prev].slice(0, 120));
  }, []);

  const connectWallet = () => {
    if (!injectedConnector) {
      pushLog("Conector injected no disponible.");
      return;
    }
    connect({ connector: injectedConnector, chainId: 8453 });
  };

  const checkBalance = () => {
    if (!address || !isConnected) {
      pushLog("Conecta una wallet primero.");
      return;
    }
    if (!isSuccess || balanceData === undefined) {
      pushLog("Saldo aún no disponible.");
      return;
    }
    const amount = Number(formatUnits(balanceData.value, USDC_BASE.decimals));
    pushLog(`USDC en Base: ${formatUsdcBalance(amount)}`);
  };

  return (
    <main style={css("max-width:800px;margin:0 auto;padding:48px 24px 120px")}>
      <h1 style={css("font:700 28px var(--font-hanken);margin:0 0 8px")}>Pruebas de wallet</h1>
      <p style={css("font:400 14px var(--font-hanken);color:#8A8A94;margin:0 0 8px")}>
        Dirección: {address ?? "sin conectar"}
      </p>
      <p style={css("font:400 13px var(--font-hanken);color:#B8B8BD;margin:0 0 24px")}>
        Conector: {connector?.id ?? "—"} · {walletProfile.label}
      </p>

      <section style={css("margin-bottom:32px")}>
        <h2 style={css("font:600 18px var(--font-hanken);margin:0 0 12px")}>Wallet inyectada</h2>
        <div style={css("display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px")}>
          {!isConnected ? (
            <Hov
              as="button"
              type="button"
              disabled={connecting}
              onClick={connectWallet}
              style="appearance:none;cursor:pointer;background:#0D0D0D;color:#fff;border:none;border-radius:10px;padding:12px 16px;font:600 14px var(--font-hanken)"
              hover="background:#000"
            >
              {connecting ? "Conectando…" : "Conectar wallet"}
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
            onClick={checkBalance}
            style="appearance:none;cursor:pointer;background:#0D0D0D;color:#fff;border:none;border-radius:10px;padding:12px 16px;font:600 14px var(--font-hanken)"
            hover="background:#000"
          >
            Comprobar USDC
          </Hov>
        </div>
      </section>

      <pre style={css("background:#0D0D0D;color:#E8E8EA;border-radius:12px;padding:16px;font:400 12px/1.5 var(--font-mono);max-height:420px;overflow:auto;white-space:pre-wrap")}>
        {logs.length === 0 ? "Sin eventos aún." : logs.map((l) => l.text).join("\n")}
      </pre>
    </main>
  );
}
