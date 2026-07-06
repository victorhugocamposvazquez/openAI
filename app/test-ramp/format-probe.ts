import type { SmartWalletFundingProbeResult } from "@/lib/onramp/smart-wallet-funding";

export function formatProbeResult(result: SmartWalletFundingProbeResult): string[] {
  const outcomeEs: Record<SmartWalletFundingProbeResult["outcome"], string> = {
    submitted: "enviada",
    rejected: "rechazada",
    error: "error",
    success: "éxito",
  };

  return [
    "── Resultado del funding ──",
    `método: ${result.method === "wallet_sendCalls" ? "wallet_sendCalls (Cuenta Base)" : "transacción estándar"}`,
    `resultado: ${outcomeEs[result.outcome]}`,
    `ventana abierta: ${result.popupLikelyShown ? "sí" : "no"}`,
    `ofreció funding: ${result.fundingOfferLikely ? "sí" : "no"}`,
    `interpretación: ${result.interpretation}`,
    ...(result.capabilities ? [`capacidades: ${JSON.stringify(result.capabilities, null, 2)}`] : []),
    ...(result.errorName ? [`error (nombre): ${result.errorName}`] : []),
    ...(result.errorMessage ? [`error (mensaje): ${result.errorMessage}`] : []),
    ...(result.hash ? [`id / hash: ${result.hash}`] : []),
    "opciones detectadas:",
    ...result.observedOptions.map((o) => `  · ${o}`),
  ];
}
