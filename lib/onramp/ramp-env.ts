import { ONRAMP_FIAT, RAMP_CONFIG } from "./constants";

export type RampSdkParams = {
  userAddress: string;
  fiatValue: string;
  rampUrl?: string;
};

export function hasRampHostApiKey(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_RAMP_HOST_API_KEY);
}

/**
 * Sin hostApiKey Ramp solo permite overlay en el entorno demo.
 * Con clave de partner → producción (salvo override o flag de demo).
 */
export function resolveRampWidgetUrl(override?: string): string {
  if (override) return override;
  if (process.env.NEXT_PUBLIC_RAMP_USE_DEMO === "true") return RAMP_CONFIG.demoUrl;
  if (!hasRampHostApiKey()) return RAMP_CONFIG.demoUrl;
  return RAMP_CONFIG.productionUrl;
}

/** Logo HTTPS fiable; el asset local /openai-logo.png no existe en el repo. */
export function getRampHostLogoUrl(): string {
  const custom = process.env.NEXT_PUBLIC_RAMP_HOST_LOGO_URL;
  if (custom) return custom;
  return RAMP_CONFIG.hostLogoUrlFallback;
}

export function buildRampSdkConfig(params: RampSdkParams) {
  const hostApiKey = process.env.NEXT_PUBLIC_RAMP_HOST_API_KEY;
  const widgetUrl = resolveRampWidgetUrl(params.rampUrl);

  if (process.env.NODE_ENV === "development") {
    console.log("[ramp] SDK config", {
      widgetUrl,
      hasApiKey: Boolean(hostApiKey),
      swapAsset: RAMP_CONFIG.swapAsset,
    });
  }

  return {
    url: widgetUrl,
    hostAppName: RAMP_CONFIG.hostAppName,
    hostLogoUrl: getRampHostLogoUrl(),
    swapAsset: RAMP_CONFIG.swapAsset,
    fiatCurrency: ONRAMP_FIAT.currency,
    fiatValue: params.fiatValue,
    userAddress: params.userAddress,
    variant: RAMP_CONFIG.variant,
    defaultFlow: "ONRAMP" as const,
    enabledFlows: ["ONRAMP" as const],
    selectedCountryCode: RAMP_CONFIG.selectedCountryCode,
    closeable: true,
    ...(hostApiKey ? { hostApiKey } : {}),
  };
}

export function isRampDemoMode(): boolean {
  return resolveRampWidgetUrl().includes("demo.rampnetwork.com");
}
