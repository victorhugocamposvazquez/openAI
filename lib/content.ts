/** Static content for the openAI Protocol demo. */

import { brandLegal } from "./brand-legal";

const {
  referencedCompany,
  productBrand,
  tokenTicker,
  affiliationNoticeSoft,
  ecosystemDisclaimer,
  legalChecklist,
  marketingPitch,
} = brandLegal;

export const ecosystem = [
  { name: "openChat", desc: "Asistente conversacional del ecosistema openAI Protocol. Suscripciones y consumo generan ingresos que alimentan la tesorería y la recompra de OPEN." },
  { name: "openAPI", desc: "Modelos servidos vía API del protocolo. Cada millón de tokens procesados se factura; parte de la comisión recompra OPEN." },
  { name: "openImage", desc: "Generación de imágenes por difusión. El consumo por crédito alimenta el flujo de recompra del token." },
  { name: "openMotion", desc: "Generación de vídeo a partir de texto. Cargas de cómputo intensivas, facturadas por segundo renderizado." },
  { name: "openVoice", desc: "Voz y transcripción en tiempo real. Uso medido por minuto de audio procesado." },
  { name: "openCode", desc: "Copiloto de programación del protocolo. Plan por asiento más consumo de cómputo por sugerencia generada." },
];

export const tokenWhy = [
  { icon: "↗", title: "Acciones reales en tesorería", desc: `El capital de ${tokenTicker} se destina a comprar acciones de ${referencedCompany} en mercados privados.` },
  { icon: "◴", title: "Flywheel permanente", desc: "Accede on-chain hoy. Tras la OPI, la tesorería sigue acumulando acciones y quemando OPEN con cada uso de openAPI y los servicios open*." },
  { icon: "◆", title: "Ingresos del ecosistema open*", desc: "openChat, openAPI y el resto de productos generan comisiones; el 30% recompra y quema OPEN." },
];

export const steps = [
  { n: "1", title: "Conecta tu wallet", desc: "MetaMask, Coinbase, Trust o la wallet de tu móvil en un toque." },
  { n: "2", title: "Compra OPEN", desc: "Con tarjeta o cripto. Tu capital entra en la tesorería del protocolo." },
  { n: "3", title: "Sigue tu inversión", desc: "Valor, asignación y movimientos en tiempo real." },
];

// hub nodes (OPEN in the center syncing with the 6 services)
export const hubPos = [
  "position:absolute;left:50%;top:7.7%;transform:translate(-50%,-50%)",
  "position:absolute;left:84.2%;top:28.8%;transform:translate(-50%,-50%)",
  "position:absolute;left:84.2%;top:71.2%;transform:translate(-50%,-50%)",
  "position:absolute;left:50%;top:88.8%;transform:translate(-50%,-50%)",
  "position:absolute;left:15.8%;top:71.2%;transform:translate(-50%,-50%)",
  "position:absolute;left:15.8%;top:28.8%;transform:translate(-50%,-50%)",
];
export const hubMeta: [string, string, string][] = [
  ["openChat", "Suscripción", "por suscripción"],
  ["openAPI", "API", "por token"],
  ["openImage", "Imagen", "por crédito"],
  ["openMotion", "Vídeo", "por segundo"],
  ["openVoice", "Voz", "por minuto"],
  ["openCode", "Código", "por asiento"],
];

export const faqDefs: [string, string][] = [
  [`¿Qué es ${tokenTicker} y qué hace con mi capital?`, `${marketingPitch} ${legalChecklist.tokenNatureParagraph}`],
  [`¿Cómo se invierte en ${referencedCompany}?`, `La tesorería destina el capital a comprar acciones reales de ${referencedCompany} vía SPV — antes y después de la OPI. Paralelamente opera openChat, openAPI y el resto de servicios open*; el 30% de sus comisiones recompra y quema OPEN, y el resto refuerza la acumulación de acciones.`],
  [`¿Cómo compro ${tokenTicker}?`, "Conecta tu wallet y paga con USDC, ETH, WETH o cbBTC en la red Base. También puedes traer fondos desde otras redes (Ethereum, Arbitrum, Solana, Bitcoin…) y los convertimos en USDC en tu wallet de Base automáticamente."],
  ["¿Tengo que esperar a la salida a bolsa para invertir?", `No. La preventa está abierta: inviertes hoy on-chain en acciones reales de ${referencedCompany}. La OPI es un hito de mercado, no el final del protocolo — ${brandLegal.copy.postOpiFlywheel}`],
  [`¿Cómo y cuándo puedo vender mis ${tokenTicker}?`, `Tras el evento de generación del token (TGE), ${tokenTicker} contará con liquidez on-chain y podrás intercambiarlo por ETH, USDC u otros tokens desde tu wallet.`],
  [`¿En qué se diferencia ${tokenTicker} de comprar la acción en bolsa?`, `${tokenTicker} es el token del ${productBrand}: participas en la tesorería que acumula equity de ${referencedCompany} de forma continua, con liquidez on-chain y recompra programática financiada por openAPI y los servicios open*.`],
  [`¿Cómo se relaciona el precio de ${tokenTicker} con las acciones?`, legalChecklist.tokenNatureLegal],
  ["¿Quién custodia mis tokens?", `Tú. El protocolo no custodia tus ${tokenTicker}: la compra se firma desde tu propia wallet y solo tú controlas las claves.`],
  ["¿Qué comisiones tiene?", "La preventa no añade comisiones propias: pagas la comisión de red de Base (céntimos) y, si pagas con un token distinto de USDC o desde otra red, el coste de conversión del mercado, que se muestra antes de confirmar."],
  ["¿Es esto un riesgo?", `Como cualquier inversión, el valor de ${tokenTicker} puede subir o bajar. Invierte solo lo que puedas permitirte. ${affiliationNoticeSoft}`],
  [`¿Qué pasa después de la OPI?`, brandLegal.copy.postOpiFlywheel + ` ${tokenTicker} sigue reflejando la tesorería: más acciones de ${referencedCompany}, más ingresos de servicios y recompras verificables on-chain.`],
];

export const tkSegs: [string, number, string][] = [
  ["Preventa pública", 30, "var(--accent,#0E8C6A)"],
  ["Liquidez on-chain", 25, "#D8D8DC"],
  ["Recompra y quema", 20, "#8FD9C4"],
  ["Marketing", 20, "#E0B36A"],
  ["Equipo (lock-up 3a)", 5, "#5A5A60"],
];

export const assetMeta: Record<string, { name: string; color: string; sym: string }> = {
  OPEN: { name: "OPEN Token", color: "#0E8C6A", sym: "A" },
  ETH: { name: "Ethereum", color: "#6478F0", sym: "Ξ" },
  BTC: { name: "Bitcoin", color: "#E9962E", sym: "₿" },
  USDC: { name: "USD Coin", color: "#2775CA", sym: "$" },
};

export const baseTk: { s: string; p: string; c: string; up: boolean }[] = [
  { s: "BTC", p: "$64,180", c: "+1.8%", up: true },
  { s: "ETH", p: "$3,452", c: "+2.4%", up: true },
  { s: "SOL", p: "$172.30", c: "-0.9%", up: false },
  { s: "BNB", p: "$611.40", c: "+0.6%", up: true },
  { s: "XRP", p: "$0.583", c: "+3.1%", up: true },
  { s: "ADA", p: "$0.461", c: "-1.2%", up: false },
  { s: "DOGE", p: "$0.142", c: "+4.7%", up: true },
  { s: "AVAX", p: "$34.10", c: "-0.4%", up: false },
  { s: "LINK", p: "$16.82", c: "+1.1%", up: true },
  { s: "DOT", p: "$7.14", c: "-0.7%", up: false },
];

export type DocSection = { h?: string; p: string[]; id?: string };
export type Doc = {
  eyebrow: string;
  title: string;
  meta: string;
  subtitle: string;
  hasStats?: boolean;
  stats?: { value: string; label: string }[];
  sections: DocSection[];
};

/** Shown under ecosystem grid on Home. */
export { ecosystemDisclaimer };
