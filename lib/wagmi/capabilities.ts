import { base } from "wagmi/chains";

type AtomicCapability = {
  status?: "supported" | "ready" | "unsupported" | string;
  supported?: boolean | string;
};

function isAtomicSupported(cap?: AtomicCapability): boolean {
  if (!cap) return false;
  if (cap.status === "supported" || cap.status === "ready") return true;
  if (cap.supported === true || cap.supported === "supported") return true;
  return false;
}

/** Detecta batching atómico (EIP-5792) en la chain indicada — sin asumir tipo de conector. */
export function chainSupportsAtomicBatch(capabilities: unknown, chainId: number = base.id): boolean {
  if (!capabilities || typeof capabilities !== "object") return false;

  const chainHex = `0x${chainId.toString(16)}`;
  const record = capabilities as Record<string, Record<string, unknown>>;
  const chainCaps = record[chainHex];
  if (!chainCaps) return false;

  if (isAtomicSupported(chainCaps.atomic as AtomicCapability | undefined)) return true;
  if (isAtomicSupported(chainCaps.atomicBatch as AtomicCapability | undefined)) return true;

  return false;
}
