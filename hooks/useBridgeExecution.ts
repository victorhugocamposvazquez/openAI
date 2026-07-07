"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConfig } from "wagmi";
import { sendTransaction, switchChain, waitForTransactionReceipt } from "@wagmi/core";
import { base } from "wagmi/chains";
import { UserRejectedRequestError } from "viem";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";
import type { BridgeQuoteResponse, BridgeStatusResponse } from "@/lib/bridge/relay";

export type BridgeExecPhase =
  | "idle"
  | "switching_chain"
  | "awaiting_wallet"
  | "confirming_origin"
  | "awaiting_deposit"
  | "bridging"
  | "delivered"
  | "refunded"
  | "error";

export type BridgeExecState = {
  phase: BridgeExecPhase;
  error?: string;
  /** Hash de la tx de entrega en Base. */
  destinationTxHash?: string;
};

const POLL_INTERVAL_MS = 3_000;
/** Tras 45 min sin resolución dejamos de hacer polling (el estado sigue en Relay). */
const POLL_TIMEOUT_MS = 45 * 60_000;

function isUserRejection(error: unknown): boolean {
  if (error instanceof UserRejectedRequestError) return true;
  if (error instanceof Error) {
    const t = error.message.toLowerCase();
    return t.includes("user rejected") || t.includes("user denied") || t.includes("rejected");
  }
  return false;
}

function mapBridgeError(error: unknown): string {
  if (isUserRejection(error)) return BUY_FLOW_COPY.compraUserRejected;
  if (error instanceof Error) {
    const t = error.message.toLowerCase();
    if (t.includes("insufficient funds")) return BUY_FLOW_COPY.compraGasInsufficient;
    // Mensajes ya en español desde nuestras API routes.
    if (/[áéíóñ¡¿]| se | del | no /.test(error.message)) return error.message;
  }
  if (process.env.NODE_ENV === "development") console.error("[bridge] error sin mapear:", error);
  return BUY_FLOW_COPY.bridgeFailed;
}

async function fetchBridgeStatus(requestId: string): Promise<BridgeStatusResponse> {
  const res = await fetch(`/api/bridge-status?requestId=${requestId}`);
  const json = await res.json();
  if (!res.ok) throw new Error((json as { error?: string }).error ?? "status_failed");
  return json as BridgeStatusResponse;
}

export function useBridgeExecution(params: { onDelivered?: () => void }) {
  const config = useConfig();
  const [state, setState] = useState<BridgeExecState>({ phase: "idle" });
  const pollGenRef = useRef(0);
  const onDeliveredRef = useRef(params.onDelivered);
  onDeliveredRef.current = params.onDelivered;

  useEffect(() => {
    return () => {
      pollGenRef.current += 1;
    };
  }, []);

  const pollStatus = useCallback(
    async (requestId: string, waitingPhase: BridgeExecPhase) => {
      const gen = ++pollGenRef.current;
      const startedAt = Date.now();

      while (pollGenRef.current === gen && Date.now() - startedAt < POLL_TIMEOUT_MS) {
        try {
          const status = await fetchBridgeStatus(requestId);
          if (pollGenRef.current !== gen) return;

          switch (status.status) {
            case "waiting":
              setState((s) => (s.phase === waitingPhase ? s : { phase: waitingPhase }));
              break;
            case "depositing":
            case "pending":
            case "submitted":
            case "delayed":
              setState((s) => (s.phase === "bridging" ? s : { phase: "bridging" }));
              break;
            case "success":
              setState({ phase: "delivered", destinationTxHash: status.txHashes?.at(-1) });
              onDeliveredRef.current?.();
              return;
            case "refund":
              setState({ phase: "refunded" });
              return;
            case "failure":
              setState({ phase: "error", error: BUY_FLOW_COPY.bridgeFailed });
              return;
          }
        } catch {
          // Error transitorio de red: seguimos intentando.
        }
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      }
    },
    []
  );

  /** Origen EVM: cambia de red, firma las txs del depósito y hace polling. */
  const executeEvmBridge = useCallback(
    async (quote: BridgeQuoteResponse, originChainId: number) => {
      try {
        if (Date.now() >= quote.expiresAt) throw new Error(BUY_FLOW_COPY.bridgeQuoteExpired);

        setState({ phase: "switching_chain" });
        await switchChain(config, { chainId: originChainId as never });

        for (const tx of quote.txs) {
          setState({ phase: "awaiting_wallet" });
          const hash = await sendTransaction(config, {
            to: tx.to,
            data: tx.data,
            value: BigInt(tx.value),
            chainId: tx.chainId as never,
          });
          setState({ phase: "confirming_origin" });
          await waitForTransactionReceipt(config, { hash, chainId: tx.chainId as never });
        }

        // Volver a Base para la fase de compra (mejor esfuerzo; algunas wallets lo rechazan).
        switchChain(config, { chainId: base.id }).catch(() => undefined);

        setState({ phase: "bridging" });
        await pollStatus(quote.requestId, "bridging");
      } catch (error) {
        setState({ phase: "error", error: mapBridgeError(error) });
      }
    },
    [config, pollStatus]
  );

  /** Solana/Bitcoin: muestra dirección de depósito y observa hasta la entrega. */
  const watchDeposit = useCallback(
    (quote: BridgeQuoteResponse) => {
      setState({ phase: "awaiting_deposit" });
      void pollStatus(quote.requestId, "awaiting_deposit");
    },
    [pollStatus]
  );

  const reset = useCallback(() => {
    pollGenRef.current += 1;
    setState({ phase: "idle" });
  }, []);

  return { state, executeEvmBridge, watchDeposit, reset };
}
