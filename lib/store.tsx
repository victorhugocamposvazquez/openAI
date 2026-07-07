"use client";

import React, { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { startMarketTicker } from "./market";

/* ──────────────────────────────────────────────────────────
   Store global mínimo de la app.
   El estado de wallet es un ESPEJO de wagmi (lo sincroniza
   <WalletSync/>); aquí no se simula nada. Los saldos reales
   se leen on-chain con hooks (useWalletHoldings, etc.).
   ────────────────────────────────────────────────────────── */

/** Clave del antiguo demo persistido; se limpia al desconectar. */
const LEGACY_STORAGE_KEY = "openai_demo_v1";

export interface AppState {
  connected: boolean;
  address: string;
  walletOpen: boolean;
  toast: string | null;
}

export interface AppApi extends AppState {
  openWallet: () => void;
  closeWallet: () => void;
  /** Espeja el estado real de wagmi en el store (lo invoca WalletSync). */
  syncWallet: (connected: boolean, address: string | null) => void;
  /** Limpia el estado local; la desconexión on-chain la hace wagmi. */
  disconnect: () => void;
  toastMsg: (m: string) => void;
}

const Ctx = createContext<AppApi | null>(null);
export const useApp = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within <AppProvider>");
  return v;
};

const INITIAL: AppState = {
  connected: false,
  address: "",
  walletOpen: false,
  toast: null,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<AppState>(INITIAL);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    startMarketTicker();
  }, []);

  const toastMsg = useCallback((m: string) => {
    setS((p) => ({ ...p, toast: m }));
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setS((p) => ({ ...p, toast: null })), 2600);
  }, []);

  const openWallet = useCallback(() => setS((p) => ({ ...p, walletOpen: true })), []);
  const closeWallet = useCallback(() => setS((p) => ({ ...p, walletOpen: false })), []);

  const syncWallet = useCallback((connected: boolean, address: string | null) => {
    setS((p) => {
      const nextAddress = connected ? (address ?? p.address) : "";
      if (p.connected === connected && p.address === nextAddress) return p;
      return {
        ...p,
        connected,
        address: nextAddress,
        // Al conectarse, cerramos el modal de conexión si estaba abierto.
        walletOpen: connected ? false : p.walletOpen,
      };
    });
  }, []);

  const disconnect = useCallback(() => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {}
    setS((p) => ({ ...p, connected: false, address: "" }));
    toastMsg("Wallet desconectada");
  }, [toastMsg]);

  const api: AppApi = useMemo(
    () => ({ ...s, openWallet, closeWallet, syncWallet, disconnect, toastMsg }),
    [s, openWallet, closeWallet, syncWallet, disconnect, toastMsg]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
