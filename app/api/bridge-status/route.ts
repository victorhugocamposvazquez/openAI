import { type NextRequest, NextResponse } from "next/server";
import { RELAY_API, type BridgeError, type BridgeStatusResponse } from "@/lib/bridge/relay";

export async function GET(req: NextRequest) {
  const requestId = req.nextUrl.searchParams.get("requestId");

  if (!requestId || !/^0x[a-fA-F0-9]{64}$/.test(requestId)) {
    return NextResponse.json({ error: "requestId no válido." } satisfies BridgeError, { status: 400 });
  }

  const apiKey = process.env.RELAY_API_KEY?.trim();

  try {
    const res = await fetch(`${RELAY_API}/intents/status/v3?requestId=${requestId}`, {
      headers: apiKey ? { "x-api-key": apiKey } : undefined,
      cache: "no-store",
    });

    const json = (await res.json()) as {
      status?: string;
      txHashes?: string[];
      failReason?: string;
      message?: string;
    };

    if (!res.ok) {
      return NextResponse.json(
        { error: json.message ?? "No se pudo consultar el estado del puente." } satisfies BridgeError,
        { status: 502 }
      );
    }

    const payload: BridgeStatusResponse = {
      status: (json.status ?? "waiting") as BridgeStatusResponse["status"],
      txHashes: json.txHashes,
      failReason: json.failReason,
    };

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { error: "No se pudo consultar el estado del puente." } satisfies BridgeError,
      { status: 502 }
    );
  }
}
