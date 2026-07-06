import { ONRAMP_FIAT, RAMP_CONFIG, RAMP_URL_PARAMS_ENABLED } from "./constants";
import { resolveRampWidgetUrl } from "./ramp-env";

export function getRampManualUrl(): string {
  const base = resolveRampWidgetUrl(RAMP_CONFIG.productionUrl);
  return base.endsWith("/") ? base : `${base}/`;
}

export function buildRampFallbackUrl(address: string, fiatValue: string, baseUrl?: string): string {
  if (!RAMP_URL_PARAMS_ENABLED) return getRampManualUrl();

  const params = new URLSearchParams({
    swapAsset: RAMP_CONFIG.swapAsset,
    userAddress: address,
    fiatCurrency: ONRAMP_FIAT.currency,
    fiatValue: fiatValue,
  });
  const base = resolveRampWidgetUrl(baseUrl);
  return `${base}/?${params.toString()}`;
}

export function openRampManualTab(): void {
  window.open(getRampManualUrl(), "_blank", "noopener,noreferrer");
}

export function openRampFallbackTab(address: string, fiatValue: string, baseUrl?: string): void {
  const url = buildRampFallbackUrl(address, fiatValue, baseUrl);
  window.open(url, "_blank", "noopener,noreferrer");
}
