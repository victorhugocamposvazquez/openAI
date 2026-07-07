import { brandLegal } from "@/lib/brand-legal";

/** USDC en Base (solo uso interno; no mostrar al usuario). */
export const USDC_BASE = {
  address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const,
  decimals: 6,
};

/** Ramp SDK embebido (vía A) — desactivado: requiere partner API key. */
export const RAMP_SDK_ENABLED = false;

/** Parámetros en URL de Ramp (vía B) — desactivado: bloqueado sin API key. */
export const RAMP_URL_PARAMS_ENABLED = false;

/** Modo de obtención de fondos — desactivado: solo wallets con USDC propio. */
export type FundingMode = "none" | "smart_wallet" | "ramp_manual";
export const FUNDING_MODE: FundingMode = "none";

/** Importe fiat (solo si se reactiva Ramp con params). */
export const ONRAMP_FIAT = {
  currency: "EUR",
  min: 20,
  max: 5000,
  defaultValue: "50",
} as const;

export const RAMP_CONFIG = {
  swapAsset: "BASE_USDC",
  variant: "auto" as const,
  widgetTimeoutMs: 8000,
  productionUrl: "https://app.rampnetwork.com",
  demoUrl: "https://app.demo.rampnetwork.com",
  hostAppName: brandLegal.productBrand,
  selectedCountryCode: "ES",
  hostLogoUrlFallback: "https://assets.rampnetwork.com/misc/test-logo.png",
};

export const BUY_FLOW_COPY = {
  pageTitle: "Adquirir OPEN",
  pageSubtitle: "Conecta tu wallet y asegúrate de tener USDC en la red Base.",
  sinWalletTitle: "Conecta tu wallet",
  sinWalletSubtitle: "Usa MetaMask, Trust Wallet u otra wallet compatible con la red Base.",
  connectWallet: "Conectar wallet",
  connectExtensionHint:
    "Necesitas una extensión o app de wallet instalada. Acepta conectar en la red Base (Chain ID 8453).",
  noWalletExtension: "No detectamos ninguna wallet. Instala MetaMask, Trust Wallet u otra compatible.",
  sinFondosTitle: "Necesitas USDC en Base",
  sinFondosSubtitle: "Deposita USDC en tu wallet en la red Base para continuar con la preventa.",
  sinFondosPollingHint:
    "Cuando recibas USDC en Base, detectaremos el saldo automáticamente. No hace falta recargar la página.",
  walletAddressLabel: "Tu dirección en Base",
  checkingBalance: "Comprobando saldo…",
  rampManualNetworkWarning:
    "Importante: el USDC debe estar en la red Base. Enviar fondos a otra red puede provocar pérdidas.",
  listoTitle: "¡Fondos listos!",
  listoSubtitle: (balance: string) => `Tienes ${balance} disponibles para invertir en OPEN.`,
  continueCta: "Continuar a la compra",
} as const;

export function formatUsdcBalance(amount: number): string {
  return `${amount.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
}

/** @deprecated Usar formatUsdcBalance para saldos on-chain. */
export function formatUserBalance(amount: number): string {
  return formatUsdcBalance(amount);
}
