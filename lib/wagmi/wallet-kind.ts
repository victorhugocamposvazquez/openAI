/** Perfil de la wallet conectada (solo informativo). */

import {
  COINBASE_WALLET_CONNECTOR_ID,
  INJECTED_CONNECTOR_ID,
  WALLET_CONNECT_CONNECTOR_ID,
} from "./connectors";

export type WalletFundingProfile = {
  label: string;
  hint?: string;
};

export function getWalletFundingProfile(connectorId?: string): WalletFundingProfile {
  if (!connectorId) {
    return { label: "Sin conectar" };
  }

  if (connectorId === COINBASE_WALLET_CONNECTOR_ID) {
    return { label: "Cuenta Base (Face ID)" };
  }

  if (connectorId === INJECTED_CONNECTOR_ID || connectorId === "io.metamask") {
    return { label: "Wallet (extensión o app)" };
  }

  if (connectorId === WALLET_CONNECT_CONNECTOR_ID) {
    return { label: "Wallet móvil (WalletConnect)" };
  }

  return {
    label: connectorId,
    hint: "Conecta con una wallet compatible (MetaMask, Trust Wallet, etc.).",
  };
}
