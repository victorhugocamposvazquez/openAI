/**
 * Legal y cumplimiento (entidad descentralizada).
 * Un abogado debe revisar términos, privacidad y riesgos antes de producción.
 * Consulta con asesoría legal especializada en Web3.
 */
export const legalConfig = {
  entityType: "decentralized" as const,

  /** Nombre público del protocolo / DAO. */
  protocolName: "openAI Protocol",
  governanceModel:
    "Gobernanza on-chain por holders de OPEN; parámetros del protocolo (asignación tesorería, recompra, liquidez) votados por la comunidad",
  tokenContractAddress: "[COMPLETAR: 0x… o pendiente de despliegue]",
  tokenChain: "[COMPLETAR: ej. Ethereum, Base, Arbitrum]",

  /**
   * Identificador para comunicaciones legales (DAO, contribuidores del protocolo,
   * foundation puente, multisig… — no una SL tradicional).
   */
  operatorName: "openAI Protocol — Contribuidores del protocolo",
  /** Jurisdicción de referencia o del wrapper legal, si existe. */
  operatorCountry: "Protocolo global; vehículo SPV sujeto a jurisdicción definida por gobernanza",
  operatorTaxId: "N/A — organización descentralizada sin CIF/NIF centralizado",
  operatorAddress:
    "Sin domicilio social único. Comunicaciones a través de los canales públicos del protocolo.",

  contactLegal: "legal@openaiprotocol.com",
  contactPrivacy: "privacidad@openaiprotocol.com",
  contactSupport: "soporte@openaiprotocol.com",
  /** Foro o canal público de gobernanza (Discord, forum, Snapshot…). */
  governanceUrl: "[COMPLETAR: https://snapshot.org/#/… o similar]",

  lastUpdated: "29 de junio de 2026",
  siteUrl: "https://openaiprotocol.com",
  termsUrl: "/docs/terms",
  privacyUrl: "/docs/privacy",
  risksUrl: "/docs/risks",
  restrictedRegions: [
    "Estados Unidos (salvo estados permitidos)",
    "Corea del Norte",
    "Irán",
    "Siria",
    "Cuba",
    "Crimea",
    "Cualquier territorio con sanciones internacionales",
  ],
} as const;

export { brandLegal, getAffiliationNotice } from "./brand-legal";

export const legalUrls = {
  terms: legalConfig.termsUrl,
  privacy: legalConfig.privacyUrl,
  risks: legalConfig.risksUrl,
} as const;
