/** Traduce errores de conexión de wagmi/viem a mensajes claros en español. */
export function mapConnectError(error: unknown): string {
  if (!(error instanceof Error)) return "No se pudo conectar la wallet. Inténtalo de nuevo.";

  const t = error.message.toLowerCase();

  if (t.includes("user rejected") || t.includes("user denied") || t.includes("connection request reset")) {
    return "Cancelaste la conexión. Vuelve a intentarlo cuando quieras.";
  }
  if (t.includes("already connected")) {
    return "Ya hay una wallet conectada.";
  }
  if (t.includes("resource unavailable") || t.includes("already pending") || t.includes("-32002")) {
    return "Tu wallet ya tiene una solicitud abierta. Ábrela y revísala.";
  }
  if (t.includes("provider not found") || t.includes("no provider")) {
    return "No detectamos ninguna extensión de wallet en este navegador.";
  }
  if (t.includes("chain") && (t.includes("not configured") || t.includes("unsupported"))) {
    return "Tu wallet no soporta la red Base. Añádela manualmente o usa otra wallet.";
  }

  if (process.env.NODE_ENV === "development") {
    console.error("[conexión] error sin mapear:", error);
  }
  return "No se pudo conectar la wallet. Inténtalo de nuevo.";
}
