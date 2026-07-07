"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useApp } from "@/lib/store";
import { formatAddress } from "@/lib/wagmi/format-address";

/** Espeja el estado real de wagmi (conexión + dirección) en el store de la app. */
export function WalletSync() {
  const { address, isConnected } = useAccount();
  const { syncWallet } = useApp();

  useEffect(() => {
    syncWallet(isConnected, address ? formatAddress(address) : null);
  }, [isConnected, address, syncWallet]);

  return null;
}
