// Solo servidor: aquí se usa RELAY_API_KEY. No importar desde componentes cliente.
import type { Address, Hex } from "viem";
import { USDC_BASE } from "@/lib/onramp/constants";
import {
  findBridgeOrigin,
  findBridgeToken,
  RELAY_API,
  RELAY_BITCOIN_CHAIN_ID,
  RELAY_NATIVE_BTC,
  RELAY_NATIVE_SOL,
  RELAY_SOLANA_CHAIN_ID,
  type BridgeQuoteResponse,
  type BridgeTx,
} from "./relay";

const BASE_CHAIN_ID = 8453;

/**
 * Para quotes con dirección de depósito, Relay exige que `user` sea una
 * dirección de la red de origen con saldo suficiente (la doc recomienda
 * una "whale address" para quotes indicativas). El depósito real puede
 * llegar desde cualquier dirección.
 */
const BTC_QUOTE_USER = "bc1q4vxn43l44h30nkluqfxd9eckf45vr2awz38lwa";
const SOL_QUOTE_USER = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";

const EVM_QUOTE_TTL_MS = 60_000;
const DEPOSIT_QUOTE_TTL_MS = 10 * 60_000;

type RelayStepItem = {
  status: string;
  data?: {
    to?: string;
    data?: string;
    value?: string;
    chainId?: number;
  };
};

type RelayStep = {
  id: string;
  kind: string;
  requestId?: string;
  depositAddress?: string;
  items: RelayStepItem[];
};

type RelayQuoteBody = {
  steps?: RelayStep[];
  details?: {
    currencyOut?: {
      amount?: string;
      amountFormatted?: string;
      minimumAmount?: string;
    };
    totalImpact?: { usd?: string };
    timeEstimate?: number;
  };
  message?: string;
  errorCode?: string;
};

export async function fetchRelayBridgeQuote(params: {
  originChainId: number;
  originCurrency: string;
  amount: string;
  /** Dirección del usuario en Base que recibirá el USDC. */
  recipient: Address;
  /** Dirección EVM del usuario en la red de origen (solo orígenes EVM). */
  userAddress?: Address;
}): Promise<BridgeQuoteResponse> {
  const origin = findBridgeOrigin(params.originChainId);
  if (!origin) throw new Error("Red de origen no admitida.");

  const token = findBridgeToken(origin, params.originCurrency);
  if (!token) throw new Error("Token de origen no admitido.");

  const isDeposit = origin.kind === "deposit";

  if (!isDeposit && !params.userAddress) {
    throw new Error("Falta la dirección de la wallet de origen.");
  }

  const user = isDeposit
    ? origin.chainId === RELAY_BITCOIN_CHAIN_ID
      ? BTC_QUOTE_USER
      : SOL_QUOTE_USER
    : params.userAddress!;

  // refundTo con la dirección nativa activa el reembolso automático al
  // depositante original (soportado en EVM, Bitcoin y Solana).
  const refundTo = isDeposit
    ? origin.chainId === RELAY_BITCOIN_CHAIN_ID
      ? RELAY_NATIVE_BTC
      : RELAY_NATIVE_SOL
    : params.userAddress!;

  const body: Record<string, unknown> = {
    user,
    recipient: params.recipient,
    originChainId: origin.chainId,
    originCurrency: token.currency,
    destinationChainId: BASE_CHAIN_ID,
    destinationCurrency: USDC_BASE.address,
    amount: params.amount,
    tradeType: "EXACT_INPUT",
    refundTo,
    ...(isDeposit ? { useDepositAddress: true } : {}),
  };

  const apiKey = process.env.RELAY_API_KEY?.trim();

  const res = await fetch(`${RELAY_API}/quote/v2`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "x-api-key": apiKey } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const json = (await res.json()) as RelayQuoteBody;

  if (!res.ok) {
    const code = json.errorCode ?? "";
    if (code === "INSUFFICIENT_FUNDS" || code === "INSUFFICIENT_LIQUIDITY") {
      throw new Error("No hay liquidez suficiente para este importe. Prueba con otro importe.");
    }
    if (code === "AMOUNT_TOO_LOW") {
      throw new Error("El importe es demasiado pequeño para cubrir las comisiones del puente.");
    }
    // Relay exige API key para direcciones de depósito en algunas redes (p. ej. Solana).
    if (json.message?.toLowerCase().includes("api key")) {
      throw new Error(
        "Esta red requiere configurar RELAY_API_KEY en el servidor (gratis en relay.link)."
      );
    }
    throw new Error(json.message ?? "No se pudo obtener la cotización del puente.");
  }

  const steps = json.steps ?? [];
  const requestId = steps.find((s) => s.requestId)?.requestId;
  if (!requestId) throw new Error("Respuesta del puente incompleta.");

  const depositAddress = steps.find((s) => s.depositAddress)?.depositAddress || undefined;

  const txs: BridgeTx[] = [];
  if (!isDeposit) {
    for (const step of steps) {
      if (step.kind !== "transaction") continue;
      for (const item of step.items) {
        if (!item.data?.to || !item.data.data) continue;
        txs.push({
          to: item.data.to as Address,
          data: item.data.data as Hex,
          value: item.data.value ?? "0",
          chainId: item.data.chainId ?? origin.chainId,
        });
      }
    }
    if (txs.length === 0) throw new Error("Respuesta del puente incompleta.");
  } else if (!depositAddress) {
    throw new Error("Respuesta del puente incompleta.");
  }

  const out = json.details?.currencyOut;
  if (!out?.amount) throw new Error("Respuesta del puente incompleta.");

  return {
    requestId,
    depositAddress,
    txs,
    amountOut: out.amount,
    amountOutFormatted: out.amountFormatted ?? "",
    minimumAmountOut: out.minimumAmount,
    totalImpactUsd: json.details?.totalImpact?.usd,
    timeEstimate: json.details?.timeEstimate,
    expiresAt: Date.now() + (isDeposit ? DEPOSIT_QUOTE_TTL_MS : EVM_QUOTE_TTL_MS),
  };
}

export { RELAY_SOLANA_CHAIN_ID };
