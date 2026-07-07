/** Perfil de la wallet conectada (solo informativo). */

export type WalletFundingProfile = {
  label: string;
  hint?: string;
};

export function getWalletFundingProfile(connectorId?: string): WalletFundingProfile {
  if (!connectorId) {
    return { label: "Sin conectar" };
  }

  if (connectorId === "injected" || connectorId === "io.metamask") {
    return { label: "Wallet (extensión)" };
  }

  return {
    label: connectorId,
    hint: "Conecta con una wallet compatible (MetaMask, Trust Wallet, etc.).",
  };
}
