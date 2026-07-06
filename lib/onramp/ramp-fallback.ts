import { ONRAMP_FIAT, RAMP_CONFIG } from "./constants";

export function buildRampFallbackUrl(address: string, fiatValue: string, baseUrl = RAMP_CONFIG.productionUrl): string {
  const params = new URLSearchParams({
    swapAsset: RAMP_CONFIG.swapAsset,
    userAddress: address,
    fiatCurrency: ONRAMP_FIAT.currency,
    fiatValue: fiatValue,
  });
  return `${baseUrl}/?${params.toString()}`;
}

export function openRampFallbackTab(address: string, fiatValue: string, baseUrl = RAMP_CONFIG.productionUrl): void {
  const url = buildRampFallbackUrl(address, fiatValue, baseUrl);
  window.open(url, "_blank", "noopener,noreferrer");
}
