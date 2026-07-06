import { parseAbi } from "viem";
import { base } from "wagmi/chains";
import { USDC_BASE } from "./constants";

export const USDC_TRANSFER_ABI = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
]);

/** 1 USDC (6 decimales) — self-transfer de prueba. */
export const SMART_WALLET_PROBE_AMOUNT = 1_000_000n;

export type SmartWalletFundingProbeResult = {
  outcome: "submitted" | "rejected" | "error" | "success";
  errorName?: string;
  errorMessage?: string;
  errorRaw?: string;
  hash?: string;
  popupLikelyShown: boolean;
  fundingOfferLikely: boolean;
  interpretation: string;
  observedOptions: string[];
};

export function buildSelfTransferConfig(address: `0x${string}`) {
  return {
    address: USDC_BASE.address,
    abi: USDC_TRANSFER_ABI,
    functionName: "transfer" as const,
    args: [address, SMART_WALLET_PROBE_AMOUNT] as const,
    chainId: base.id,
  };
}

function errorText(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}

export function interpretFundingProbeError(error: unknown): SmartWalletFundingProbeResult {
  const text = errorText(error).toLowerCase();
  const name = error instanceof Error ? error.name : undefined;
  const message = error instanceof Error ? error.message : String(error);

  const rejected =
    name === "UserRejectedRequestError" ||
    text.includes("user rejected") ||
    text.includes("user denied") ||
    text.includes("rejected the request");

  const insufficient =
    text.includes("insufficient") ||
    text.includes("fondos insuficientes") ||
    text.includes("not enough") ||
    text.includes("exceeds balance");

  const fundingHints = [
    "add funds",
    "buy",
    "magic spend",
    "fund",
    "purchase",
    "on-ramp",
    "onramp",
    "deposit",
  ];
  const matchedHints = fundingHints.filter((h) => text.includes(h));

  if (rejected) {
    return {
      outcome: "rejected",
      errorName: name,
      errorMessage: message,
      errorRaw: errorText(error),
      popupLikelyShown: true,
      fundingOfferLikely: matchedHints.length > 0,
      interpretation:
        matchedHints.length > 0
          ? "El popup se abrió; el mensaje sugiere opciones de funding. Revisa visualmente qué botones mostró Coinbase."
          : "El usuario cerró o rechazó el popup. Observa si antes de cerrar apareció alguna opción de añadir fondos.",
      observedOptions:
        matchedHints.length > 0
          ? matchedHints.map((h) => `Detectado en error: "${h}"`)
          : ["Revisar manualmente el popup (rechazado sin pistas en el error)"],
    };
  }

  if (insufficient) {
    return {
      outcome: "error",
      errorName: name,
      errorMessage: message,
      errorRaw: errorText(error),
      popupLikelyShown: true,
      fundingOfferLikely: true,
      interpretation:
        "Fondos insuficientes detectados. Es probable que Coinbase haya mostrado opciones para añadir fondos antes del error.",
      observedOptions: [
        "Fondos insuficientes (error on-chain/simulación)",
        ...matchedHints.map((h) => `Pista: "${h}"`),
      ],
    };
  }

  return {
    outcome: "error",
    errorName: name,
    errorMessage: message,
    errorRaw: errorText(error),
    popupLikelyShown: !text.includes("connector") && !text.includes("not connected"),
    fundingOfferLikely: matchedHints.length > 0,
    interpretation: "Error inesperado. Revisa el popup de Coinbase y el detalle del error.",
    observedOptions:
      matchedHints.length > 0
        ? matchedHints.map((h) => `Pista en error: "${h}"`)
        : ["Sin pistas automáticas — anota manualmente lo que viste en el popup"],
  };
}

export function interpretFundingProbeSuccess(hash: string): SmartWalletFundingProbeResult {
  return {
    outcome: "success",
    hash,
    popupLikelyShown: true,
    fundingOfferLikely: false,
    interpretation:
      "La transacción se firmó y envió. Si tenías fondos, fue un self-transfer de 1 USDC (sin pérdida). Si no, esto no debería ocurrir.",
    observedOptions: ["Tx completada — revisar si el popup ofreció funding antes de firmar"],
  };
}

export function interpretFundingProbeSubmitted(hash: string): SmartWalletFundingProbeResult {
  return {
    outcome: "submitted",
    hash,
    popupLikelyShown: true,
    fundingOfferLikely: false,
    interpretation: "Transacción enviada; pendiente de confirmación.",
    observedOptions: ["Tx en mempool"],
  };
}
