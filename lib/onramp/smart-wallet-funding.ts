import { encodeFunctionData, parseAbi, type WalletClient } from "viem";
import { base } from "wagmi/chains";
import { USDC_BASE } from "./constants";

export const USDC_TRANSFER_ABI = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
]);

/** 1 USDC (6 decimales) — self-transfer de prueba. */
export const SMART_WALLET_PROBE_AMOUNT = 1_000_000n;

const BASE_CHAIN_HEX = `0x${base.id.toString(16)}`;

export type SmartWalletFundingProbeResult = {
  method: "wallet_sendCalls" | "eth_sendTransaction";
  outcome: "submitted" | "rejected" | "error" | "success";
  errorName?: string;
  errorMessage?: string;
  errorRaw?: string;
  hash?: string;
  capabilities?: unknown;
  popupLikelyShown: boolean;
  fundingOfferLikely: boolean;
  interpretation: string;
  observedOptions: string[];
};

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown }) => Promise<unknown>;
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

function buildTransferCallData(address: `0x${string}`) {
  return encodeFunctionData({
    abi: USDC_TRANSFER_ABI,
    functionName: "transfer",
    args: [address, SMART_WALLET_PROBE_AMOUNT],
  });
}

export async function fetchWalletCapabilities(
  provider: Eip1193Provider,
  address: string
): Promise<unknown> {
  try {
    return await provider.request({
      method: "wallet_getCapabilities",
      params: [address],
    });
  } catch {
    return null;
  }
}

/** Base Account usa EIP-5792 wallet_sendCalls — necesario para el flujo de funding. */
export async function probeViaSendCalls(
  provider: Eip1193Provider,
  address: `0x${string}`
): Promise<unknown> {
  const data = buildTransferCallData(address);
  return provider.request({
    method: "wallet_sendCalls",
    params: [
      {
        version: "2.0.0",
        chainId: BASE_CHAIN_HEX,
        from: address,
        atomicRequired: true,
        calls: [
          {
            to: USDC_BASE.address,
            data,
            value: "0x0",
          },
        ],
      },
    ],
  });
}

export async function probeViaWriteContract(
  walletClient: WalletClient,
  address: `0x${string}`
): Promise<`0x${string}`> {
  const config = buildSelfTransferConfig(address);
  return walletClient.writeContract({
    ...config,
    chain: base,
    account: address,
  });
}

function errorText(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}

function extractHash(result: unknown): string | undefined {
  if (!result || typeof result !== "object") return undefined;
  const r = result as Record<string, unknown>;
  if (typeof r.id === "string") return r.id;
  if (Array.isArray(r) && typeof r[0] === "string") return r[0];
  return undefined;
}

export function interpretFundingProbeError(
  error: unknown,
  method: SmartWalletFundingProbeResult["method"] = "eth_sendTransaction"
): SmartWalletFundingProbeResult {
  const text = errorText(error).toLowerCase();
  const name = error instanceof Error ? error.name : undefined;
  const message = error instanceof Error ? error.message : String(error);

  const rejected =
    name === "UserRejectedRequestError" ||
    text.includes("user rejected") ||
    text.includes("user denied") ||
    text.includes("user cancelled") ||
    text.includes("rejected the request");

  const insufficient =
    text.includes("insufficient") ||
    text.includes("fondos insuficientes") ||
    text.includes("not enough") ||
    text.includes("exceeds balance") ||
    text.includes("likely to fail");

  const fundingHints = [
    "add funds",
    "buy",
    "magic spend",
    "fund",
    "purchase",
    "on-ramp",
    "onramp",
    "deposit",
    "primary account",
    "auxiliary",
  ];
  const matchedHints = fundingHints.filter((h) => text.includes(h));

  if (rejected) {
    return {
      method,
      outcome: "rejected",
      errorName: name,
      errorMessage: message,
      errorRaw: errorText(error),
      popupLikelyShown: true,
      fundingOfferLikely: matchedHints.length > 0,
      interpretation:
        matchedHints.length > 0
          ? "Popup abierto con pistas de funding en el error."
          : "Popup cerrado o rechazado. Si viste «Revisar alerta» sin opción de comprar, probablemente no es Base Account.",
      observedOptions:
        matchedHints.length > 0
          ? matchedHints.map((h) => `Pista: "${h}"`)
          : ["Popup de confirmación estándar (extensión Coinbase) — no funding integrado"],
    };
  }

  if (insufficient) {
    return {
      method,
      outcome: "error",
      errorName: name,
      errorMessage: message,
      errorRaw: errorText(error),
      popupLikelyShown: true,
      fundingOfferLikely: method === "wallet_sendCalls",
      interpretation:
        method === "wallet_sendCalls"
          ? "Fondos insuficientes vía sendCalls. Base Account podría ofrecer funding antes del fallo."
          : "«Es probable que falle» + tarifa no disponible = extensión Coinbase, no Smart Wallet con funding.",
      observedOptions: [
        insufficient ? "Saldo / gas insuficiente" : "Error desconocido",
        ...matchedHints.map((h) => `Pista: "${h}"`),
      ],
    };
  }

  return {
    method,
    outcome: "error",
    errorName: name,
    errorMessage: message,
    errorRaw: errorText(error),
    popupLikelyShown: true,
    fundingOfferLikely: matchedHints.length > 0,
    interpretation: "Error inesperado. Verifica que usas Base Account (Face ID), no la extensión.",
    observedOptions:
      matchedHints.length > 0
        ? matchedHints.map((h) => `Pista: "${h}"`)
        : ["Sin pistas automáticas"],
  };
}

export function interpretFundingProbeSuccess(
  hash: string,
  method: SmartWalletFundingProbeResult["method"] = "eth_sendTransaction"
): SmartWalletFundingProbeResult {
  return {
    method,
    outcome: "success",
    hash,
    popupLikelyShown: true,
    fundingOfferLikely: false,
    interpretation:
      "Tx firmada. Self-transfer de 1 USDC si había saldo (sin pérdida neta).",
    observedOptions: ["Tx completada"],
  };
}

export async function runSmartWalletFundingProbe(params: {
  address: `0x${string}`;
  useSendCalls: boolean;
  provider?: Eip1193Provider;
  walletClient?: WalletClient;
  capabilities?: unknown;
}): Promise<SmartWalletFundingProbeResult> {
  const method = params.useSendCalls ? "wallet_sendCalls" : "eth_sendTransaction";

  try {
    if (params.useSendCalls && params.provider) {
      const result = await probeViaSendCalls(params.provider, params.address);
      const hash = extractHash(result);
      const base = interpretFundingProbeSuccess(hash ?? "batch", method);
      return { ...base, capabilities: params.capabilities };
    }

    if (!params.walletClient) {
      throw new Error("walletClient requerido para eth_sendTransaction");
    }

    const hash = await probeViaWriteContract(params.walletClient, params.address);
    return { ...interpretFundingProbeSuccess(hash, method), capabilities: params.capabilities };
  } catch (error) {
    const interpreted = interpretFundingProbeError(error, method);
    return { ...interpreted, capabilities: params.capabilities };
  }
}
