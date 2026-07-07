import type { Address, Hex } from "viem";

/** API de Relay (api.relay.link) — puente cross-chain hacia USDC en Base. */
export const RELAY_API = "https://api.relay.link";

/** Chain IDs que Relay asigna a redes no-EVM. */
export const RELAY_BITCOIN_CHAIN_ID = 8253038;
export const RELAY_SOLANA_CHAIN_ID = 792703809;

/** Identificadores de moneda nativa en Relay. */
export const RELAY_NATIVE_EVM = "0x0000000000000000000000000000000000000000";
export const RELAY_NATIVE_SOL = "11111111111111111111111111111111";
export const RELAY_NATIVE_BTC = "bc1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqmql8k8";

/**
 * - "evm": el usuario firma la tx de depósito desde su wallet (cambio de red).
 * - "deposit": Solana/Bitcoin — Relay genera una dirección de depósito;
 *   el usuario envía desde cualquier wallet y hacemos polling del estado.
 */
export type BridgeOriginKind = "evm" | "deposit";

export type BridgeToken = {
  symbol: string;
  /** Identificador de moneda en Relay (address EVM, mint de Solana o pseudo-dirección BTC). */
  currency: string;
  decimals: number;
};

export type BridgeOrigin = {
  id: string;
  label: string;
  chainId: number;
  kind: BridgeOriginKind;
  tokens: BridgeToken[];
};

export const BRIDGE_ORIGINS: BridgeOrigin[] = [
  {
    id: "ethereum",
    label: "Ethereum",
    chainId: 1,
    kind: "evm",
    tokens: [
      { symbol: "ETH", currency: RELAY_NATIVE_EVM, decimals: 18 },
      { symbol: "USDC", currency: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
      { symbol: "USDT", currency: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
    ],
  },
  {
    id: "arbitrum",
    label: "Arbitrum",
    chainId: 42161,
    kind: "evm",
    tokens: [
      { symbol: "ETH", currency: RELAY_NATIVE_EVM, decimals: 18 },
      { symbol: "USDC", currency: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6 },
    ],
  },
  {
    id: "optimism",
    label: "Optimism",
    chainId: 10,
    kind: "evm",
    tokens: [
      { symbol: "ETH", currency: RELAY_NATIVE_EVM, decimals: 18 },
      { symbol: "USDC", currency: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", decimals: 6 },
    ],
  },
  {
    id: "polygon",
    label: "Polygon",
    chainId: 137,
    kind: "evm",
    tokens: [
      { symbol: "POL", currency: RELAY_NATIVE_EVM, decimals: 18 },
      { symbol: "USDC", currency: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6 },
    ],
  },
  {
    id: "bnb",
    label: "BNB Chain",
    chainId: 56,
    kind: "evm",
    tokens: [
      { symbol: "BNB", currency: RELAY_NATIVE_EVM, decimals: 18 },
      { symbol: "USDC", currency: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18 },
    ],
  },
  {
    id: "solana",
    label: "Solana",
    chainId: RELAY_SOLANA_CHAIN_ID,
    kind: "deposit",
    // Las direcciones de depósito de Relay solo funcionan con moneda nativa.
    tokens: [{ symbol: "SOL", currency: RELAY_NATIVE_SOL, decimals: 9 }],
  },
  {
    id: "bitcoin",
    label: "Bitcoin",
    chainId: RELAY_BITCOIN_CHAIN_ID,
    kind: "deposit",
    tokens: [{ symbol: "BTC", currency: RELAY_NATIVE_BTC, decimals: 8 }],
  },
];

export function findBridgeOrigin(chainId: number): BridgeOrigin | undefined {
  return BRIDGE_ORIGINS.find((o) => o.chainId === chainId);
}

export function findBridgeToken(origin: BridgeOrigin, currency: string): BridgeToken | undefined {
  return origin.tokens.find((t) => t.currency.toLowerCase() === currency.toLowerCase());
}

// ── Tipos normalizados (respuesta de nuestras API routes) ──

export type BridgeTx = {
  to: Address;
  data: Hex;
  value: string;
  chainId: number;
};

export type BridgeQuoteResponse = {
  requestId: string;
  /** Solo en flujo Solana/Bitcoin. */
  depositAddress?: string;
  /** Transacciones a firmar en la red de origen (solo EVM). */
  txs: BridgeTx[];
  /** USDC estimado que llegará a Base (unidades mínimas, 6 decimales). */
  amountOut: string;
  amountOutFormatted: string;
  minimumAmountOut?: string;
  /** Coste total estimado (comisiones + impacto) en USD. */
  totalImpactUsd?: string;
  /** Tiempo estimado del puente en segundos. */
  timeEstimate?: number;
  expiresAt: number;
};

export type BridgeStatus =
  | "waiting"
  | "depositing"
  | "pending"
  | "submitted"
  | "success"
  | "delayed"
  | "failure"
  | "refund";

export type BridgeStatusResponse = {
  status: BridgeStatus;
  /** Hashes de la tx de destino (Base). */
  txHashes?: string[];
  failReason?: string;
};

export type BridgeError = {
  error: string;
};
