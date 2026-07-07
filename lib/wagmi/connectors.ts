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
