import { ONRAMP_FIAT, RAMP_CONFIG } from "./constants";
import { resolveRampWidgetUrl } from "./ramp-env";

export function buildRampFallbackUrl(address: string, fiatValue: string, baseUrl?: string): string {
  const params = new URLSearchParams({
    swapAsset: RAMP_CONFIG.swapAsset,
    userAddress: address,
    fiatCurrency: ONRAMP_FIAT.currency,
    fiatValue: fiatValue,
  });
  return `${resolveRampWidgetUrl(baseUrl)}/?${params.toString()}`;
}

export function openRampFallbackTab(address: string, fiatValue: string, baseUrl?: string): void {
  const url = buildRampFallbackUrl(address, fiatValue, baseUrl);
  window.open(url, "_blank", "noopener,noreferrer");
}
