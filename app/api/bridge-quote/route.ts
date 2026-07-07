import { type NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { fetchRelayBridgeQuote } from "@/lib/bridge/relay-server";
import { findBridgeOrigin, findBridgeToken, type BridgeError } from "@/lib/bridge/relay";

export async function POST(req: NextRequest) {
  let body: {
    originChainId?: number;
    originCurrency?: string;
    amount?: string;
    recipient?: string;
    userAddress?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición no válida." } satisfies BridgeError, { status: 400 });
  }

  const { originChainId, originCurrency, amount, recipient, userAddress } = body;

  if (typeof originChainId !== "number" || !originCurrency) {
    return NextResponse.json({ error: "Red o token de origen no válidos." } satisfies BridgeError, { status: 400 });
  }

  const origin = findBridgeOrigin(originChainId);
  if (!origin || !findBridgeToken(origin, originCurrency)) {
    return NextResponse.json({ error: "Red o token de origen no admitidos." } satisfies BridgeError, { status: 400 });
  }

  if (!amount || !/^[0-9]+$/.test(amount) || BigInt(amount) <= 0n) {
    return NextResponse.json({ error: "Importe no válido." } satisfies BridgeError, { status: 400 });
  }

  if (!recipient || !isAddress(recipient)) {
    return NextResponse.json({ error: "Dirección de destino no válida." } satisfies BridgeError, { status: 400 });
  }

  if (origin.kind === "evm" && (!userAddress || !isAddress(userAddress))) {
    return NextResponse.json({ error: "Dirección de origen no válida." } satisfies BridgeError, { status: 400 });
  }

  try {
    const quote = await fetchRelayBridgeQuote({
      originChainId,
      originCurrency,
      amount,
      recipient,
      userAddress: origin.kind === "evm" ? (userAddress as `0x${string}`) : undefined,
    });
    return NextResponse.json(quote);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo obtener la cotización del puente.";
    return NextResponse.json({ error: message } satisfies BridgeError, { status: 502 });
  }
}
