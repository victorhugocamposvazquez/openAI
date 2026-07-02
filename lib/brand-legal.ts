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
    "OPEN no es una acción de OpenAI, Inc. ni confiere derechos de voto, dividendos directos ni registro en el cap table. Representa una unidad de participación económica en la tesorería del protocolo, cuyos activos pueden incluir exposición a acciones de OpenAI, Inc. mantenidas por un vehículo independiente (SPV). No existe paridad 1:1 OPEN ↔ acción ni redención garantizada por acciones de OpenAI, Inc.",

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

  /** Pitch de producto — tono inversión, sin disuadir. */
  marketingPitch:
    "OPEN es la vía on-chain del openAI Protocol: el capital de los holders se invierte en acciones reales de OpenAI, Inc. y en el ecosistema open*.",

  /** Aviso de afiliación — tono suave para footer y flujos de producto. */
  affiliationNoticeSoft:
    "Con OPEN inviertes en acciones reales de OpenAI, Inc. a través del openAI Protocol — on-chain, con liquidez y antes de la OPI. Proyecto independiente de la empresa.",

  affiliationLinkLabel: "Transparencia legal",

  /** Formulación legal completa — docs, recibos y consentimientos. */
  shortDisclaimer:
    "openAI Protocol y el token OPEN no están afiliados, patrocinados ni respaldados por OpenAI, Inc. OPEN no es una acción de OpenAI ni un producto emitido por OpenAI, Inc.",

  microDisclaimer: "OPEN canaliza capital hacia acciones reales de OpenAI, Inc.",

  /** Para secciones de valor / NAV — tono producto. */
  navDisclaimerMarketing:
    "El valor de OPEN sigue la tesorería del protocolo: equity en OpenAI, Inc. e ingresos del ecosistema open*.",

  navDisclaimer:
    "El precio de mercado de OPEN puede diferir del NAV publicado. No hay paridad 1:1 con acciones ni redención garantizada.",

  geoNotice:
    "Este servicio no está dirigido a residentes de Estados Unidos (salvo jurisdicciones permitidas), ni a territorios sujetos a sanciones internacionales. Eres responsable de cumplir la normativa de tu país.",

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
    "Invierte en acciones reales de OpenAI, Inc. a través del token OPEN.",

  suggestedCta: "Obtener OPEN",

  copy: {
    heroHeadline: "Invierte en OPEN antes de la OPI de OpenAI, Inc.",
    heroSubheadline:
      "Tu capital compra acciones reales de OpenAI, Inc. en la tesorería del protocolo — on-chain, con liquidez y sin esperar al bróker.",
    heroMicro: "",
    heroBadge: "Preventa abierta · OPI prevista 2027",
    opiContext: "OPI prevista · septiembre de 2027 · fecha estimada, sujeta a cambios",
    equityMicro: "Cada OPEN alimenta la compra de acciones reales de OpenAI, Inc. en mercados privados.",
    ecosystemTitle: "Un token que invierte en acciones reales. Todo el ecosistema open*.",
    ecosystemLead:
      "La tesorería del protocolo adquiere equity de OpenAI, Inc. y opera openChat, openAPI y el resto de productos. Más uso, más ingresos, más demanda sobre OPEN.",
    valueTitle: "Acciones reales + ingresos del ecosistema",
    valueLead:
      "La tesorería acumula acciones de OpenAI, Inc. mientras open* genera comisiones recurrentes. El 30% se destina a recomprar y quemar OPEN.",
    buyConsentExtra:
      "Entiendo que OPEN representa participación en la tesorería del protocolo, que invierte en acciones reales de OpenAI, Inc. Invertir conlleva riesgos, incluida la pérdida total del capital.",
    receiptLegalBlock:
      "OPEN no es acción. Sin afiliación con OpenAI, Inc. No es asesoramiento de inversión.",
    emailFooter:
      "openAI Protocol · independiente de OpenAI, Inc. · OPEN no es una acción · no es asesoramiento de inversión",
    receiptHeader: "openAI Protocol — Recibo de operación",
    receiptFooter: "Gracias por participar en el openAI Protocol.",
  },

  /** Textos obligatorios por zona — única fuente para marketing + cumplimiento UI. */
  legalChecklist: {
    zones: {
      footerAffiliation: "affiliationNoticeSoft",
      hero: "heroMicro",
      countdown: "opiContext",
      ecosystem: "equityMicro",
      valueAccrual: "navDisclaimerMarketing",
      buy: "affiliationNoticeSoft",
      swap: "affiliationNoticeSoft",
      docCta: "marketingPitch",
      footer: "footerDisclaimer",
    },
    consent: {
      card:
        "Acepto términos, privacidad y riesgos. El pago con tarjeta lo procesa Transak/MoonPay. OPEN canaliza inversión en acciones reales vía el protocolo.",
      crypto:
        "Acepto términos, privacidad y riesgos. Entiendo que OPEN invierte vía la tesorería del protocolo y que las operaciones on-chain son irreversibles.",
      swap:
        "Entiendo que OPEN refleja la tesorería del protocolo y que el swap on-chain es irreversible.",
    },
    tokenNatureParagraph:
      "OPEN te da participación en la tesorería del openAI Protocol, que compra y custodia acciones reales de OpenAI, Inc. y opera el ecosistema open*. Es la vía on-chain para invertir antes de la OPI, con liquidez desde el primer día.",
    tokenNatureLegal:
      "OPEN no otorga derechos de accionista directos sobre OpenAI, Inc. El precio de mercado puede diferir del NAV. Invertir conlleva riesgo de pérdida total.",
    preLaunch: [
      "Disclaimer en footer, compra, recibos y docs legales",
      "Doc /docs/affiliation y /docs/compliance accesibles",
      "Logo alt/title = openAI Protocol",
      "Dominio y emails propios (no openai.com)",
      "legal.config.ts completado (entidad, SPV, contrato)",
      "Attestations de tesorería publicables",
      "Geo-aviso visible en flujos de compra",
      "Sin promesas de rentabilidad ni OPI garantizada",
      "Revisión externa por abogado (marcas + valores)",
    ],
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

/** Texto legal de una zona del checklist (resuelve claves anidadas en copy). */
export function getLegalZoneText(zone: keyof typeof brandLegal.legalChecklist.zones): string {
  const key = brandLegal.legalChecklist.zones[zone];
  if (key === "affiliationNoticeSoft") return brandLegal.affiliationNoticeSoft;
  if (key === "heroMicro") return brandLegal.copy.heroMicro;
  if (key === "opiContext") return brandLegal.copy.opiContext;
  if (key === "equityMicro") return brandLegal.copy.equityMicro;
  if (key === "navDisclaimerMarketing") return brandLegal.navDisclaimerMarketing;
  if (key === "marketingPitch") return brandLegal.marketingPitch;
  if (key === "footerDisclaimer") return brandLegal.footerDisclaimer;
  return brandLegal.shortDisclaimer;
}

/** Párrafo técnico del flywheel para docs / FAQ. */
export function getTreasuryFlywheelText() {
  return treasuryMechanism.phases.map((p) => `${p.title}: ${p.technical}`).join(" ");
}
