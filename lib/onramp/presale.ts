/** Stub del contrato de preventa — sustituir por llamada on-chain. */

export function continueToPresale(params: { address: string; balanceLabel: string }) {
  if (process.env.NODE_ENV === "development") {
    console.log("[presale stub] Continuar a la compra", params);
  }
}
