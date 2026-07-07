import type { Connector } from "wagmi";

export const COINBASE_WALLET_CONNECTOR_ID = "coinbaseWalletSDK";
export const INJECTED_CONNECTOR_ID = "injected";
export const WALLET_CONNECT_CONNECTOR_ID = "walletConnect";

export function getConnectorId(connector: Connector | undefined): string | undefined {
  return connector?.id;
}

export function findCoinbaseWalletConnector(connectors: readonly Connector[]) {
  return connectors.find((c) => c.id === COINBASE_WALLET_CONNECTOR_ID);
}

export function findInjectedConnector(connectors: readonly Connector[]) {
  return connectors.find((c) => c.id === INJECTED_CONNECTOR_ID || c.type === "injected");
}

export function findWalletConnectConnector(connectors: readonly Connector[]) {
  return connectors.find((c) => c.id === WALLET_CONNECT_CONNECTOR_ID);
}

export function isWalletConnectConnector(connectorId?: string) {
  return connectorId === WALLET_CONNECT_CONNECTOR_ID;
}

/** rdns de la extensión de Coinbase — duplicaría el conector coinbaseWalletSDK. */
const COINBASE_EXTENSION_RDNS = "com.coinbase.wallet";

/** ¿Hay algún provider EIP-1193 inyectado en la página? */
export function hasInjectedProvider(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean((window as Window & { ethereum?: unknown }).ethereum);
}

/**
 * Wallets inyectadas REALES para mostrar en el selector:
 * - Si hay wallets anunciadas por EIP-6963 (MetaMask, Rabby, Trust…), se listan
 *   por su nombre e icono reales, excluyendo la extensión de Coinbase (duplicada).
 * - Si no hay ninguna anunciada pero existe window.ethereum, se ofrece el
 *   conector injected genérico.
 * - Si no hay provider, se devuelve lista vacía (no se ofrece nada falso).
 */
export function getInjectedWalletOptions(connectors: readonly Connector[]): Connector[] {
  const discovered = connectors.filter(
    (c) =>
      c.type === "injected" &&
      c.id !== INJECTED_CONNECTOR_ID &&
      c.id !== COINBASE_EXTENSION_RDNS
  );
  if (discovered.length > 0) return discovered;

  if (!hasInjectedProvider()) return [];

  const generic = connectors.find((c) => c.id === INJECTED_CONNECTOR_ID);
  return generic ? [generic] : [];
}
