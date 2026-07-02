/**
 * Marco legal de marca e inversión — única fuente de verdad para copy marketing + legal.
 * Revisión obligatoria por abogado (marcas + valores / MiCA / CNMV) antes de producción.
 */

/** Fases del flywheel económico: capital → equity → productos → ingresos → tesorería. */
export type TreasuryPhase = {
  id: string;
  title: string;
  technical: string;
  outputs: string[];
};

export const treasuryMechanism = {
  /** Resumen ejecutivo del modelo (1 párrafo). */
  summary:
    "Los fondos aportados por los inversores (vía compra de OPEN o stablecoins en tesorería) se asignan en dos capas: (1) adquisición y custodia de acciones reales de OpenAI, Inc. en un vehículo legal off-chain, y (2) operación del ecosistema de productos del openAI Protocol para generar ingresos recurrentes. El valor del token deriva del NAV compuesto de la tesorería (equity + caja operativa) y del programa de recompra financiado por comisiones.",

  /** Límite legal: qué es y qué no es OPEN. */
  legalBoundary:
    "OPEN no es una acción de OpenAI, Inc. ni confiere derechos de voto, dividendos directos ni registro en el cap table. Representa una unidad de participación económica en la tesorería del protocolo, cuyos activos incluyen exposición a acciones de OpenAI, Inc. mantenidas por un vehículo independiente.",

  phases: [
    {
      id: "subscription",
      title: "1. Suscripción — entrada de capital",
      technical:
        "El inversor adquiere OPEN en preventa primaria o en pools on-chain (USDC/ETH/fiat vía on-ramp). El contrato de tesorería (TreasuryRouter) registra la operación on-chain y enruta el colateral a la wallet multisig de tesorería del protocolo.",
      outputs: ["OPEN acreditado en wallet del inversor", "Stablecoins/ETH en Treasury Multisig"],
    },
    {
      id: "equity-acquisition",
      title: "2. Adquisición de equity — acciones reales",
      technical:
        "La tesorería transfiere capital al vehículo off-chain (SPV / trust regulado) encargado de comprar y custodiar acciones de OpenAI, Inc. en mercados secundarios privados. El SPV publica attestations periódicas del holding (NAV equity, fecha de valoración, custodio). El oráculo de NAV ingesta esas attestations como input de precio de referencia.",
      outputs: [
        "Posición verificable en acciones de OpenAI, Inc.",
        "NAV equity publicado on-chain vía oráculo",
      ],
    },
    {
      id: "operating-layer",
      title: "3. Capa operativa — productos del protocolo",
      technical:
        "Una parte de la tesorería financia la operación del ecosistema open* (openChat, openAPI, openImage, openMotion, openVoice, openCode): infraestructura, APIs, cómputo y distribución. Los ingresos por suscripción, consumo por token/crédito y comisiones de transacción se consolidan en el Operating Revenue Pool (contrato o cuenta segregada auditada).",
      outputs: [
        "Ingresos recurrentes del ecosistema",
        "Métricas de uso on-chain (eventos FeeCollected)",
      ],
    },
    {
      id: "value-accrual",
      title: "4. Acumulación de valor — dual engine",
      technical:
        "El valor económico del protocolo combina dos motores: (A) revalorización de la posición en acciones de OpenAI, Inc. (mark-to-market del SPV), y (B) superávit operativo neto de los productos. El NAV compuesto = equity NAV + reservas operativas − pasivos. El precio de mercado de OPEN tiende al NAV compuesto, modulado por liquidez on-chain.",
      outputs: ["NAV compuesto publicado", "Correlación token ↔ activos subyacentes"],
    },
    {
      id: "buyback-burn",
      title: "5. Recompra y quema — retorno al holder",
      technical:
        "El 30% de las comisiones netas del Operating Revenue Pool se enruta automáticamente al contrato BuybackBurn. El contrato ejecuta órdenes de compra de OPEN contra pools de liquidez y envía los tokens a una dirección de quema irreversible. El resto se reinvierte: acumulación de equity, liquidez o crecimiento del ecosistema, según gobernanza.",
      outputs: ["Contracción verificable de oferta circulante", "Presión de demanda estructural"],
    },
  ] as const satisfies readonly TreasuryPhase[],

  components: [
    { name: "Treasury Multisig", role: "Custodia on-chain de stablecoins/ETH; autoriza transferencias al SPV y a ops." },
    { name: "Equity SPV (off-chain)", role: "Compra, custodia y valora acciones de OpenAI, Inc.; emite attestations de holding." },
    { name: "Operating Revenue Pool", role: "Consolida ingresos de productos open*; split automático recompra / reinversión." },
    { name: "BuybackBurn (on-chain)", role: "Recompra programática de OPEN y quema verificable." },
    { name: "NAV Oracle", role: "Agrega NAV equity (SPV) + reservas operativas; publica precio de referencia." },
    { name: "OPEN (ERC-20)", role: "Unidad de participación económica en la tesorería del protocolo; no es acción." },
  ] as const,

  allocationPolicy: {
    /** Placeholder — gobernanza fija rangos; completar con abogado + tesorería. */
    equityTarget: "Mayoría del capital neto de nuevas suscripciones destinado a acumulación de equity en OpenAI, Inc.",
    operatingReserve: "Reserva operativa para APIs, cómputo y distribución del ecosistema open*.",
    liquidityReserve: "Colateral en pools on-chain para liquidez secundaria de OPEN.",
    buybackRate: "30% de comisiones netas → BuybackBurn; resto según propuesta de gobernanza.",
  },
} as const;

export const brandLegal = {
  referencedCompany: "OpenAI, Inc.",
  referencedCompanyNote:
    "OpenAI, Inc. es una entidad independiente. No patrocina, respalda ni controla este protocolo.",

  productBrand: "openAI Protocol",
  wordmark: "openAI",
  tokenTicker: "OPEN",

  investmentMechanism: treasuryMechanism.summary + " " + treasuryMechanism.legalBoundary,

  shortDisclaimer:
    "openAI Protocol y el token OPEN no están afiliados, patrocinados ni respaldados por OpenAI, Inc. OPEN no es una acción de OpenAI ni un producto emitido por OpenAI, Inc.",

  microDisclaimer: "Referencia a OpenAI, Inc.; sin afiliación.",

  footerDisclaimer:
    "openAI Protocol es un ecosistema independiente operado de forma descentralizada. OpenAI, OpenAI, Inc. y marcas relacionadas son propiedad de sus respectivos titulares. Este sitio no constituye una oferta pública de valores ni asesoramiento de inversión. Invertir conlleva riesgos, incluida la pérdida total del capital.",

  ecosystemDisclaimer:
    "openChat, openAPI, openImage, openMotion, openVoice y openCode son productos del ecosistema openAI Protocol. ChatGPT, DALL·E, Sora, Whisper y Codex son marcas de OpenAI, Inc.",

  affiliationDocAnchor: "/docs/affiliation",

  marketingAllowed: [
    "Exposición económica respaldada por acciones reales de OpenAI, Inc. en tesorería del protocolo",
    "Ingresos operativos del ecosistema open* como segundo motor de valor",
    "Referencia factual a la empresa como activo subyacente del SPV",
    "Mencionar OPI / salida a bolsa prevista como contexto de mercado (si es verificable)",
    "Usar «OpenAI, Inc.» con forma legal completa al hablar de la empresa real",
    "Disclaimer visible en cada flujo de compra",
  ],

  marketingForbidden: [
    "Decir «somos OpenAI», «official», «partner», «endorsed by» o «powered by OpenAI»",
    "Usar el logotipo de OpenAI, Inc. o imitaciones confusas como marca propia",
    "Afirmar que OPEN = acción de OpenAI o que otorga derechos de accionista",
    "Prometer rentabilidad garantizada, paridad 1:1 con acciones ni OPI asegurada",
    "Ocultar comisiones, riesgos o la independencia del protocolo",
    "Dirigir el producto a inversores de países sin evaluar restricciones (EE.UU., etc.)",
  ],

  suggestedTagline:
    "Protocolo con tesorería respaldada por acciones de OpenAI, Inc. e ingresos del ecosistema open*.",
  suggestedCta: "Obtener OPEN",

  copy: {
    heroHeadline: "Invierte en OPEN antes de la OPI de OpenAI, Inc.",
    heroSubheadline:
      "Tu capital alimenta la tesorería del protocolo: compra acciones reales de OpenAI, Inc. y opera el ecosistema open* para generar ingresos. OPEN es el token de participación — no es una acción.",
    heroBadge: "Preventa abierta · OPI prevista 2027",
    ecosystemTitle: "Un token. Todo el ecosistema openAI Protocol.",
    ecosystemLead:
      "Los fondos de los inversores se convierten en equity real de OpenAI, Inc. y en infraestructura operativa. Los productos open* generan comisiones que recompran y queman OPEN.",
    valueTitle: "Doble motor de valor: equity + ingresos operativos",
    valueLead:
      "Motor 1: acciones reales de OpenAI, Inc. en custodia del SPV del protocolo. Motor 2: ingresos recurrentes de openChat, openAPI y el resto del ecosistema. El 30% de las comisiones financia recompra y quema de OPEN.",
    buyConsentExtra:
      "OPEN no es una acción de OpenAI, Inc. Es participación económica en la tesorería del protocolo, respaldada por acciones reales y flujos operativos.",
    receiptHeader: "openAI Protocol — Recibo de operación",
    receiptFooter: "Gracias por participar en el openAI Protocol.",
  },

  nomenclature: {
    protocol: "openAI Protocol",
    company: "OpenAI, Inc.",
    rule:
      "Marketing: openAI Protocol + OPEN. Activo subyacente: siempre OpenAI, Inc. con forma legal. Mecanismo: tesorería → SPV → equity + capa operativa open*.",
  },
} as const;

/** Referencia estándar a la empresa real (activo subyacente). */
export function formatCompanyRef() {
  return brandLegal.referencedCompany;
}

/** Texto legal corto para usar junto a claims de inversión. */
export function withDisclaimer(claim: string) {
  return `${claim} ${brandLegal.microDisclaimer}`;
}

export function getAffiliationNotice() {
  return `${brandLegal.productBrand} es independiente de ${brandLegal.referencedCompany}. ${brandLegal.referencedCompanyNote}`;
}

/** Párrafo técnico del flywheel para docs / FAQ. */
export function getTreasuryFlywheelText() {
  return treasuryMechanism.phases.map((p) => `${p.title}: ${p.technical}`).join(" ");
}
