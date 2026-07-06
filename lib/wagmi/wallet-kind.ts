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
      label: "Cuenta Base (Smart Wallet)",
    };
  }

  if (connectorId === "coinbaseWalletSDK") {
    return {
      supportsIntegratedFunding: false,
      label: "Coinbase Wallet (extensión)",
      hint: "Estás con la extensión o app Coinbase, no con Cuenta Base. Desconecta y pulsa «Crear cuenta Base (Face ID)».",
    };
  }

  return {
    supportsIntegratedFunding: false,
    label: connectorId ?? "Wallet desconocida",
    hint: "Conecta con Cuenta Base (Face ID) para añadir fondos de forma integrada.",
  };
}
