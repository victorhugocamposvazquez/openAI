/** Tipo de wallet conectada — el funding integrado solo aplica a Base Account. */

export const BASE_ACCOUNT_CONNECTOR_ID = "baseAccount";

export type WalletFundingProfile = {
  supportsIntegratedFunding: boolean;
  label: string;
  hint?: string;
};

export function getWalletFundingProfile(connectorId?: string): WalletFundingProfile {
  if (connectorId === BASE_ACCOUNT_CONNECTOR_ID) {
    return {
      supportsIntegratedFunding: true,
      label: "Base Account (Smart Wallet)",
    };
  }

  if (connectorId === "coinbaseWalletSDK") {
    return {
      supportsIntegratedFunding: false,
      label: "Coinbase Wallet",
      hint: "Parece la extensión o app Coinbase, no Base Account. Desconecta y usa «Crear cuenta Base (Face ID)».",
    };
  }

  return {
    supportsIntegratedFunding: false,
    label: connectorId ?? "Wallet desconocida",
    hint: "Conecta con Base Account (Face ID) para probar el funding integrado.",
  };
}
