"use client";

import { useCallback } from "react";
import { useDisconnect } from "wagmi";
import { useApp } from "@/lib/store";

/**
 * Desconexión completa: cierra la sesión del conector de wagmi
 * (incluida la sesión WalletConnect) y limpia el estado local de la app.
 */
export function useWalletDisconnect() {
  const { disconnect } = useDisconnect();
  const { disconnect: clearAppState } = useApp();

  return useCallback(() => {
    disconnect();
    clearAppState();
  }, [disconnect, clearAppState]);
}
