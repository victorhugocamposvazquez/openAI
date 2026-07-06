import { brandLegal } from "@/lib/brand-legal";

/** USDC en Base (solo uso interno; no mostrar al usuario). */
export const USDC_BASE = {
  address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const,
  decimals: 6,
};

/** Importe fiat configurable para el on-ramp. */
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
  /** Logo HTTPS de Ramp — válido sin partner; evita 404 del logo local. */
  hostLogoUrlFallback: "https://assets.rampnetwork.com/misc/test-logo.png",
};

export const BUY_FLOW_COPY = {
  pageTitle: "Adquirir OPEN",
  pageSubtitle: "Primero añade fondos con tarjeta. Después participarás en la preventa.",
  sinWalletTitle: "Crea tu cuenta o conecta tu wallet",
  sinWalletSubtitle: "Necesitas una cuenta segura para recibir tus fondos y completar la compra.",
  connectSmartWallet: "Crear cuenta con Face ID",
  connectInjected: "Ya tengo wallet",
  sinFondosTitle: "Añade fondos para continuar",
  sinFondosSubtitle: "Indica cuánto quieres aportar en euros. El pago se procesa de forma segura con tarjeta.",
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
  rampIntegrationFailed:
    "No pudimos abrir el pago integrado. Te llevamos a la pasarela segura en una nueva pestaña.",
  fallbackWarning:
    "Abriremos el proceso de pago en una nueva pestaña. Completa el pago allí y vuelve aquí para continuar.",
  fiatInvalid: "Introduce un importe válido en euros.",
  fiatBelowMin: (min: number) => `El importe mínimo es ${min} €.`,
  fiatAboveMax: (max: number) => `El importe máximo es ${max.toLocaleString("es-ES")} €.`,
  consentRequired: "Debes aceptar los términos antes de continuar.",
} as const;

export function validateFiatAmount(
  raw: string
): { ok: true; amount: number; normalized: string } | { ok: false; message: string } {
  const trimmed = raw.trim().replace(",", ".");
  const amount = Number(trimmed);

  if (!trimmed || Number.isNaN(amount) || amount <= 0) {
    return { ok: false, message: BUY_FLOW_COPY.fiatInvalid };
  }
  if (amount < ONRAMP_FIAT.min) {
    return { ok: false, message: BUY_FLOW_COPY.fiatBelowMin(ONRAMP_FIAT.min) };
  }
  if (amount > ONRAMP_FIAT.max) {
    return { ok: false, message: BUY_FLOW_COPY.fiatAboveMax(ONRAMP_FIAT.max) };
  }

  return { ok: true, amount, normalized: amount.toString() };
}

export function formatUserBalance(amount: number): string {
  return (
    amount.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"
  );
}
