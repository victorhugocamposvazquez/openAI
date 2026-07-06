import { RAMP_CONFIG } from "./constants";

const RAMP_TEST_LOGO = "https://assets.rampnetwork.com/misc/test-logo.png";

/** Logo HTTPS requerido por Ramp en el SDK embebido. */
export function getRampHostLogoUrl(): string {
  if (typeof window !== "undefined" && window.location.origin.startsWith("http")) {
    return `${window.location.origin}/openai-logo.png`;
  }
  return RAMP_TEST_LOGO;
}

/** En local usamos demo; en producción sin API key el overlay suele fallar → B. */
export function resolveRampWidgetUrl(override?: string): string {
  if (override) return override;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return RAMP_CONFIG.demoUrl;
    }
  }

  return RAMP_CONFIG.productionUrl;
}

export function canUseRampOverlay(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_RAMP_HOST_API_KEY);
}
