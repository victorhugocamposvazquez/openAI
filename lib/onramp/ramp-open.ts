import { ONRAMP_FIAT, RAMP_CONFIG } from "./constants";

export type RampSessionHandlers = {
  onConfigDone: () => void;
  onPurchaseCreated: () => void;
  onWidgetClose: (hadPurchase: boolean) => void;
  onError: (reason: string) => void;
};

type RampInstance = {
  show: () => unknown;
  on: (type: string, callback: (event: { type: string }) => void) => unknown;
  close: () => unknown;
};

export type RampSession = {
  via: "A";
  cleanup: () => void;
};

export async function openRampWidgetA(
  params: { userAddress: string; fiatValue: string; rampUrl?: string },
  handlers: RampSessionHandlers
): Promise<RampSession | null> {
  let instance: RampInstance | null = null;
  let purchaseCreated = false;
  let configDone = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const cleanup = () => {
    if (timeoutId) clearTimeout(timeoutId);
    try {
      instance?.close();
    } catch {
      /* noop */
    }
    instance = null;
  };

  const failToFallback = (reason: string) => {
    cleanup();
    handlers.onError(reason);
  };

  try {
    const { RampInstantSDK } = await import("@ramp-network/ramp-instant-sdk");

    instance = new RampInstantSDK({
      url: params.rampUrl ?? RAMP_CONFIG.productionUrl,
      hostAppName: RAMP_CONFIG.hostAppName,
      swapAsset: RAMP_CONFIG.swapAsset,
      fiatCurrency: ONRAMP_FIAT.currency,
      fiatValue: params.fiatValue,
      userAddress: params.userAddress,
      variant: RAMP_CONFIG.variant,
    }) as RampInstance;

    timeoutId = setTimeout(() => {
      if (!configDone) failToFallback("timeout_sin_WIDGET_CONFIG_DONE");
    }, RAMP_CONFIG.widgetTimeoutMs);

    instance.on("*", (event: { type: string }) => {
      if (process.env.NODE_ENV === "development") {
        console.log("[ramp]", event.type, event);
      }
    });

    instance.on("WIDGET_CONFIG_DONE", () => {
      configDone = true;
      if (timeoutId) clearTimeout(timeoutId);
      handlers.onConfigDone();
    });

    instance.on("PURCHASE_CREATED", () => {
      purchaseCreated = true;
      handlers.onPurchaseCreated();
    });

    instance.on("WIDGET_CLOSE", () => {
      handlers.onWidgetClose(purchaseCreated);
      cleanup();
    });

    instance.show();

    return { via: "A", cleanup };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "instanciacion_fallida";
    failToFallback(reason);
    return null;
  }
}
