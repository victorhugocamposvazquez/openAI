/**
 * Paso 1 — Legal y cumplimiento (entidad descentralizada).
 * Rellena estos datos antes de solicitar cuenta en Transak/MoonPay.
 * Un abogado debe revisar términos, privacidad y riesgos antes de producción.
 *
 * Nota: Transak/MoonPay suelen exigir un contacto legal y a veces una entidad
 * puente (foundation, DAO LLC, asociación) para el alta de comercio, aunque
 * el protocolo sea descentralizado. Consulta con asesoría legal especializada en Web3.
 */
export const legalConfig = {
  entityType: "decentralized" as const,

  /** Nombre público del protocolo / DAO. */
  protocolName: "[COMPLETAR: ej. openAI Protocol]",
  /** Cómo se toman decisiones (Snapshot, multisig, on-chain vote…). */
  governanceModel:
    "[COMPLETAR: ej. gobernanza on-chain por holders de OPEN; parámetros del protocolo votados por la comunidad]",
  /** Contrato del token OPEN (cuando esté desplegado). */
  tokenContractAddress: "[COMPLETAR: 0x… o pendiente]",
  tokenChain: "[COMPLETAR: ej. Ethereum, Base, Arbitrum]",

  /**
   * Identificador para comunicaciones legales (DAO, contribuidores del protocolo,
   * foundation puente, multisig… — no una SL tradicional).
   */
  operatorName: "[COMPLETAR: openAI Protocol / Contribuidores del protocolo]",
  /** Jurisdicción de referencia o del wrapper legal, si existe. */
  operatorCountry: "[COMPLETAR: ej. protocolo global / foundation en Suiza o Wyoming DAO LLC]",
  operatorTaxId: "N/A — organización descentralizada sin CIF/NIF centralizado",
  operatorAddress:
    "Sin domicilio social único. Comunicaciones a través de los canales públicos del protocolo.",

  contactLegal: "legal@tudominio.com",
  contactPrivacy: "privacidad@tudominio.com",
  contactSupport: "soporte@tudominio.com",
  /** Foro o canal público de gobernanza (Discord, forum, Snapshot…). */
  governanceUrl: "[COMPLETAR: https://snapshot.org/#/… o similar]",

  lastUpdated: "29 de junio de 2026",
  siteUrl: "https://openai-six-ruddy.vercel.app",
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
