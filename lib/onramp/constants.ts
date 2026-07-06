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

/** Modo de obtención de fondos en sin_fondos. Default tras tests: decidir entre ambos. */
export type FundingMode = "smart_wallet" | "ramp_manual";
export const FUNDING_MODE: FundingMode = "ramp_manual";

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
  pageSubtitle: "Primero añade fondos. Después participarás en la preventa.",
  sinWalletTitle: "Crea tu cuenta o conecta tu wallet",
  sinWalletSubtitle: "Necesitas una cuenta segura para recibir tus fondos y completar la compra.",
  connectSmartWallet: "Crear cuenta con Face ID",
  connectInjected: "Ya tengo wallet",
  sinFondosTitle: "Añade fondos para continuar",
  sinFondosSubtitle: "Sigue los pasos para recibir fondos en tu cuenta.",
  sinFondosSmartSubtitle: "Tu wallet puede ayudarte a añadir fondos de forma segura.",
  smartWalletFundsCta: "Añadir fondos con mi cuenta",
  rampManualOpenCta: "Abrir pasarela de pago",
  rampManualBeforeOpen:
    "Abriremos la pasarela de pago en una nueva pestaña. Completa el proceso allí y vuelve aquí.",
  rampManualSteps: [
    "1. Elige USDC como activo.",
    "2. Selecciona la red Base antes de continuar.",
    "3. Pega tu dirección de wallet en el campo de destino.",
    "4. Completa el pago y vuelve a esta página.",
  ],
  rampManualAddressLabel: "Tu dirección en Base",
  rampManualNetworkWarning:
    "Importante: verifica que la red sea Base antes de confirmar. Enviar fondos a otra red puede provocar pérdidas.",
  fiatLabel: "Importe en euros",
  fiatHint: (min: number, max: number) => `Entre ${min} € y ${max.toLocaleString("es-ES")} €`,
  addFundsCta: "Añadir fondos con tarjeta",
  esperandoTitle: "Estamos esperando tu pago",
  esperandoSubtitle: "Si ya completaste el pago, los fondos aparecerán en unos minutos. No cierres esta página.",
  retryPaymentCta: "¿Problemas? Reintentar pago",
  listoTitle: "¡Fondos listos!",
  listoSubtitle: (balance: string) => `Tienes ${balance} disponibles para invertir en OPEN.`,
  continueCta: "Continuar a la compra",
  paymentCancelled: "No se inició el pago. Puedes volver a intentarlo cuando quieras.",
  fundingProbeFailed: "No se pudo iniciar la solicitud de fondos. Inténtalo de nuevo.",
  consentRequired: "Debes aceptar los términos antes de continuar.",
} as const;

export function validateFiatAmount(
  raw: string
): { ok: true; amount: number; normalized: string } | { ok: false; message: string } {
  const trimmed = raw.trim().replace(",", ".");
  const amount = Number(trimmed);

  if (!trimmed || Number.isNaN(amount) || amount <= 0) {
    return { ok: false, message: "Introduce un importe válido en euros." };
  }
  if (amount < ONRAMP_FIAT.min) {
    return { ok: false, message: `El importe mínimo es ${ONRAMP_FIAT.min} €.` };
  }
  if (amount > ONRAMP_FIAT.max) {
    return { ok: false, message: `El importe máximo es ${ONRAMP_FIAT.max.toLocaleString("es-ES")} €.` };
  }

  return { ok: true, amount, normalized: amount.toString() };
}

export function formatUserBalance(amount: number): string {
  return (
    amount.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"
  );
}
