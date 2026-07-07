import { brandLegal } from "@/lib/brand-legal";
import { legalConfig } from "@/lib/legal.config";

/** Metadata WalletConnect / Reown (wagmi walletConnect connector). */
export const WALLET_CONNECT_METADATA = {
  name: brandLegal.productBrand,
  description: "Adquiere OPEN en la red Base con tu wallet.",
  url: legalConfig.siteUrl,
  icons: [`${legalConfig.siteUrl}/favicon.ico`],
} as const;

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
  sinWalletSubtitle: "Crea una cuenta segura o conecta la wallet que ya uses.",
  connectFaceId: "Crear cuenta con Face ID",
  connectExistingWallet: "Ya tengo wallet",
  walletModalTitle: "Elige tu wallet",
  walletModalSubtitle: "MetaMask, Trust Wallet u otra compatible con Base.",
  connectInjected: "MetaMask / extensión",
  connectWalletConnect: "WalletConnect",
  connectWallet: "Conectar wallet",
  connectDesktopHint:
    "Crea una cuenta con Face ID o conecta una wallet existente. La red debe ser Base (Chain ID 8453).",
  walletConnectEnvHint:
    "Para WalletConnect en móvil, añade NEXT_PUBLIC_WC_PROJECT_ID (gratis en cloud.reown.com).",
  switchChainTitle: "Cambia tu wallet a la red Base",
  switchChainSubtitle: "Esta operación solo funciona en Base (Chain ID 8453).",
  switchChainCta: "Cambiar a Base",
  switchChainRejected: "Rechazaste el cambio de red. Cámbiala manualmente a Base en tu wallet para continuar.",
  confirmInWalletApp: "Confirma en tu app de wallet",
  confirmInWalletAppHint: "Abre tu wallet, firma la transacción y vuelve aquí. El estado se actualizará solo.",
  noWalletExtension: "No detectamos ninguna extensión. Instala MetaMask o usa el botón de QR.",
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
  compraTitle: "Comprar OPEN",
  compraSubtitle: "Autoriza y confirma la compra con USDC en Base.",
  compraRouteUsdc: "Pagar con USDC",
  compraRouteSwap: "Convertir y comprar",
  compraAmountLabel: "Importe en USDC",
  compraStartCta: "Iniciar compra",
  compraRetryCta: "Reintentar paso pendiente",
  compraDoneTitle: "Compra enviada",
  compraDoneSubtitle: "Tu transacción se ha enviado correctamente.",
  compraContractMissing: "Contrato de preventa no configurado (NEXT_PUBLIC_PRESALE_CONTRACT).",
  compraStepUsdcApprove: "Paso 1/2 — Autorizar USDC",
  compraStepUsdcBuy: "Paso 2/2 — Comprar OPEN",
  compraStepSwapApprove: "Paso 1/3 — Autorizar conversión",
  compraStepSwapConvert: "Paso 2/3 — Convertir a ETH",
  compraStepSwapBuy: "Paso 3/3 — Comprar OPEN",
  compraStepBatch: "Firmar compra (una sola firma)",
  compraWaitingConfirm: "Esperando confirmación on-chain…",
  compraUserRejected: "Rechazaste la transacción. Puedes reintentar el paso pendiente.",
} as const;

export function formatUsdcBalance(amount: number): string {
  return `${amount.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
}

/** @deprecated Usar formatUsdcBalance para saldos on-chain. */
export function formatUserBalance(amount: number): string {
  return formatUsdcBalance(amount);
}
