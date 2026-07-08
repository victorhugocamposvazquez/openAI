import type { Doc } from "./content";

/** Doc pages (whitepaper, tokenomics, docs, audit, support, legal). */

import { legalConfig } from "./legal.config";
import { brandLegal, getAffiliationNotice, treasuryMechanism } from "./brand-legal";

const {
  protocolName,
  governanceModel,
  tokenContractAddress,
  tokenChain,
  operatorName,
  operatorCountry,
  contactLegal,
  contactPrivacy,
  governanceUrl,
  lastUpdated,
  restrictedRegions,
} = legalConfig;
const restrictedList = restrictedRegions.join("; ");
export const docMap: Record<string, Doc> = {
  whitepaper: {
    eyebrow: "Whitepaper",
    title: "OPEN Whitepaper",
    meta: "Versión 1.2 · Actualizado en 2026",
    subtitle:
      "Especificación del token OPEN: tesorería respaldada por acciones de OpenAI, Inc., capa operativa open* y mecanismo de recompra.",
    hasStats: true,
    stats: [
      { value: "21.000M", label: "Suministro total" },
      { value: "30%", label: "Comisiones a recompra" },
      { value: "ERC-20", label: "Estándar del token" },
      { value: "2027", label: "OPI prevista" },
    ],
    sections: [
      { h: "Resumen ejecutivo", p: [treasuryMechanism.summary, `El diseño persigue tres objetivos: acumular y seguir acumulando equity real de ${brandLegal.referencedCompany} (antes, durante y después de su OPI), monetizar de forma permanente el ecosistema de productos del ${brandLegal.productBrand}, y mantener liquidez on-chain del token OPEN sin custodia centralizada sobre los tokens del inversor.`, brandLegal.copy.postOpiFlywheel, treasuryMechanism.legalBoundaryMarketing + " Este documento tiene carácter informativo y no constituye asesoramiento financiero."] },
      { h: "1. Contexto y motivación", p: ["Las empresas privadas de alto crecimiento concentran gran parte de su revalorización en las fases previas a su salida a bolsa, un periodo al que el inversor minorista rara vez tiene acceso. Cuando la compañía finalmente cotiza, buena parte de la apreciación ya se ha producido y queda reservada a inversores institucionales y rondas privadas.", `OPEN propone un flywheel on-chain: el capital de los suscriptores financia la compra de acciones reales de ${brandLegal.referencedCompany} y la operación de productos open* que generan ingresos recurrentes. Esos flujos se consolidan en un NAV compuesto que orienta el valor de mercado del token.`] },
      { h: "2. El token OPEN", p: ["OPEN (OPENPROTOCOL) es un token fungible conforme al estándar ERC-20, desplegado en la red Base. El suministro total es fijo e inmutable en 21.000.000.000 de unidades; el contrato no tiene función mint, por lo que la oferta solo puede mantenerse o decrecer.", brandLegal.legalChecklist.tokenNatureParagraph, treasuryMechanism.legalBoundaryMarketing] },
      {
        h: "3. Mecanismo de tesorería — capital → acciones reales",
        p: [
          treasuryMechanism.phases[0].technical,
          treasuryMechanism.phases[1].technical,
          `Política de asignación (orientativa, sujeta a gobernanza): ${treasuryMechanism.allocationPolicy.equityTarget} ${treasuryMechanism.allocationPolicy.operatingReserve} ${treasuryMechanism.allocationPolicy.liquidityReserve}`,
          "Las attestations del SPV (holding, custodio, fecha de valoración) se publican periódicamente y alimentan el módulo NAV Oracle. El precio de mercado de OPEN sigue el NAV compuesto y puede variar respecto a la valoración unitaria del equity en el SPV.",
        ],
      },
      {
        h: "4. Capa operativa — productos open* → ingresos",
        p: [
          treasuryMechanism.phases[2].technical,
          "Los productos del ecosistema (openChat, openAPI, openImage, openMotion, openVoice, openCode) facturan por suscripción, consumo por token, crédito o asiento. Cada operación emite un evento FeeCollected verificable que alimenta el Operating Revenue Pool.",
          treasuryMechanism.phases[3].technical,
        ],
      },
      { h: "5. Vínculo con la valoración de OpenAI, Inc.", p: [`El NAV equity del SPV se marca a mercado con valoraciones de rondas privadas antes de la OPI y con cotización oficial tras la salida a bolsa. El oráculo agrega NAV equity + reservas operativas para publicar el NAV compuesto de referencia.`, "Tras la OPI, la tesorería no liquida su posición: sigue acumulando acciones en mercado público y privado mientras openAPI y los servicios open* generan ingresos que alimentan recompras de OPEN y nuevas compras de equity.", "El anclaje no es una paridad rígida: el mercado on-chain determina el precio en cada momento, pero el NAV compuesto proporciona la señal fundamental que guía el arbitraje y mantiene la correlación entre el token y los activos subyacentes."] },
      { h: "6. Acumulación de valor (value accrual)", p: [treasuryMechanism.phases[4].technical, `Política de split: ${treasuryMechanism.allocationPolicy.buybackRate}`, "Este mecanismo convierte el uso del ecosistema y la revalorización del equity en presión estructural sobre OPEN, con independencia de la actividad especulativa del mercado."] },
      { h: "7. Distribución del suministro", p: ["El suministro de 21.000.000.000 OPEN se distribuye así: 9,95% a la preventa pública (2.089.500.000 OPEN, se reciben en el TGE mediante claim), 40% a liquidez on-chain (8.400.000.000 OPEN, destinada al pool de liquidez en el TGE con LP bloqueado), 20% a tesorería y ecosistema (4.200.000.000 OPEN, recompras y quema y desarrollo del ecosistema), 15% a marketing (3.150.000.000 OPEN, disponible desde el TGE), 5% al equipo (1.050.000.000 OPEN) y 10,05% a rondas futuras (2.110.500.000 OPEN, bloqueado).", "La asignación del equipo queda bloqueada 3 años: cliff de 1 año y liberación lineal durante los 2 años siguientes, verificable on-chain."] },
      { h: "8. Liquidez y mercado", p: ["El 40% del suministro destinado a liquidez se despliega en el pool on-chain en el TGE, con el LP bloqueado, garantizando que cualquier inversor pueda comprar o vender OPEN en todo momento. Los compradores de preventa reciben sus OPEN en el TGE mediante claim y no están sujetos a bloqueo posterior.", "La profundidad de los pools y los parámetros de las comisiones se calibran para minimizar el slippage en operaciones de tamaño habitual y para sostener un mercado ordenado durante los eventos de recompra."] },
      {
        h: "9. Arquitectura técnica",
        p: [
          "Componentes del sistema:",
          ...treasuryMechanism.components.map((c) => `· ${c.name}: ${c.role}`),
          "Los contratos on-chain (OPEN, BuybackBurn, TreasuryRouter, gobernanza) son independientes, auditados y verificados en el explorador de bloques. El SPV y el Operating Revenue Pool off-chain publican informes periódicos enlazados on-chain mediante hash de attestations.",
        ],
      },
      { h: "10. Oráculo de precio", p: ["El oráculo agrega NAV equity (attestations SPV), reservas operativas y precio de mercado de OPEN. Emplea ventanas temporales y medianas para resistir manipulaciones puntuales y picos de baja liquidez.", "En caso de discrepancia anómala entre fuentes, el oráculo entra en un modo conservador que pausa los parámetros sensibles hasta que los datos se normalizan."] },
      { h: "11. Gobernanza", p: ["Determinados parámetros del protocolo —como el porcentaje de comisiones destinado a recompra, la política de asignación equity/ops o la configuración de liquidez— pueden ajustarse mediante gobernanza on-chain, dentro de rangos máximos y mínimos codificados en los contratos.", "El objetivo a medio plazo es transferir progresivamente estas decisiones a los holders de OPEN, avanzando hacia una administración descentralizada del protocolo."] },
      { h: "12. Seguridad", p: ["Los contratos han sido revisados por auditores independientes, sin hallazgos críticos ni de severidad alta pendientes. Existe además un programa de recompensas por la divulgación responsable de vulnerabilidades.", `El protocolo es self-custody respecto a los tokens OPEN del inversor: ${brandLegal.productBrand} no controla las claves de tu wallet. La custodia del equity off-chain recae en el SPV designado; su holding se audita periódicamente.`] },
      { h: "13. Hoja de ruta", p: ["2026 — Preventa pública, despliegue de liquidez on-chain, primera adquisición de equity vía SPV y activación del mecanismo de recompra.", `2027 — OPI de ${brandLegal.referencedCompany}: integración de cotización oficial en NAV Oracle, escalado de openAPI y servicios open*, y continuación de la acumulación de acciones en tesorería.`, "2028 y posteriores — Flywheel en marcha: más ingresos por uso de API y servicios, más recompras y quemas de OPEN, más equity en OpenAI, Inc., y transición progresiva de gobernanza a holders."] },
      { h: "14. Marcas de terceros", p: [brandLegal.ecosystemDisclaimer, "Las referencias a productos de OpenAI, Inc. (ChatGPT, DALL·E, Sora, Whisper, Codex) en este documento son comparativas o descriptivas del activo subyacente, no implican licencia ni afiliación."] },
      { h: "15. Aviso legal", p: [`Este documento tiene carácter informativo. ${brandLegal.investmentMechanism}`, brandLegal.shortDisclaimer, "Nada de lo aquí expuesto constituye una oferta de inversión ni asesoramiento financiero."] },
    ],
  },
  tokenomics: {
    eyebrow: "Tokenomics",
    title: "Tokenomics de OPEN",
    meta: "Suministro fijo · 21.000.000.000 OPEN",
    subtitle:
      "Distribución del suministro, calendarios de bloqueo y condiciones de la preventa. Los tokens comprados en preventa se reciben en el momento del lanzamiento (TGE) mediante claim.",
    hasStats: true,
    stats: [
      { value: "21.000M", label: "Suministro total" },
      { value: "9,95%", label: "Preventa pública" },
      { value: "40%", label: "Liquidez on-chain" },
      { value: "5%", label: "Equipo (bloqueado 3 años)" },
    ],
    sections: [
      {
        h: "El token",
        p: [
          "Nombre: OPENPROTOCOL. Símbolo: OPEN. Red: Base.",
          "Suministro total: 21.000.000.000 OPEN, fijo e inmutable. El contrato no tiene función mint: la oferta solo puede mantenerse o decrecer.",
        ],
      },
      {
        h: "Distribución del suministro",
        p: [
          "· Preventa pública — 9,95% — 2.089.500.000 OPEN — Se reciben en el lanzamiento (TGE) mediante claim.",
          "· Liquidez on-chain — 40% — 8.400.000.000 OPEN — Destinada al pool de liquidez en el TGE, con LP bloqueado.",
          "· Tesorería / Ecosistema — 20% — 4.200.000.000 OPEN — Recompras y quema, desarrollo del ecosistema.",
          "· Marketing — 15% — 3.150.000.000 OPEN — Disponible desde el TGE.",
          "· Equipo — 5% — 1.050.000.000 OPEN — Bloqueado 3 años: cliff de 1 año + liberación lineal 2 años, verificable on-chain.",
          "· Rondas futuras — 10,05% — 2.110.500.000 OPEN — Bloqueado.",
        ],
      },
      {
        h: "Preventa",
        p: [
          "Aviso importante: los tokens comprados en preventa se reciben en el momento del lanzamiento (TGE) mediante claim.",
          "Precio: 0,0005 USDC por OPEN.",
          "Cap máximo: 1.045.000 USDC. El límite está fijado en el contrato; las compras se rechazan automáticamente al alcanzarlo.",
          "La preventa es pública y abierta, sin límite por wallet. Los fondos se custodian en una Safe multisig.",
        ],
      },
      {
        h: "Calendario de bloqueo",
        p: [
          "Equipo: bloqueado 3 años en total — cliff de 1 año y liberación lineal durante los 2 años siguientes, verificable on-chain.",
          "Rondas futuras: bloqueado.",
          "Liquidez: el LP del pool on-chain queda bloqueado desde el TGE.",
        ],
      },
      {
        h: "Recompra y quema",
        p: [
          "La tesorería del protocolo (20% del suministro) financia recompras y quema de OPEN junto con el desarrollo del ecosistema. Además, el 30% de las comisiones del ecosistema financia recompras periódicas que se retiran de circulación de forma permanente y verificable.",
        ],
      },
      {
        h: "Liquidez",
        p: [
          "El 40% del suministro se destina al pool de liquidez on-chain en el TGE, con el LP bloqueado, para garantizar que cualquier inversor pueda comprar o vender OPEN en todo momento.",
        ],
      },
    ],
  },
  docs: {
    eyebrow: "Documentación",
    title: "Documentación para desarrolladores",
    meta: "Referencia de API y contratos · v1",
    subtitle: "Guías de integración, referencia de los contratos del protocolo y endpoints para consultar precio, oferta, cartera y operaciones de OPEN.",
    sections: [
      { h: "Introducción", p: ["Esta documentación cubre todo lo necesario para integrar OPEN en una aplicación: conexión de wallet, lectura de datos de mercado, ejecución de compras e intercambios, y reacción a eventos on-chain.", "El protocolo expone dos superficies complementarias: los contratos inteligentes (para operar de forma directa y sin intermediarios) y una API de datos (para consultas de mercado y de cartera con baja latencia)."] },
      { h: "Primeros pasos", p: ["Para operar necesitas una wallet compatible: MetaMask, Coinbase Wallet, WalletConnect o Rainbow. Conecta la wallet a la red EVM del protocolo y asegúrate de disponer de saldo para las comisiones de red.", "Desde el front-end, la conexión se realiza con un proveedor estándar (EIP-1193). Una vez conectada la wallet, puedes leer saldos, solicitar firmas y enviar transacciones a los contratos del protocolo."] },
      { h: "Autenticación", p: ["Las lecturas de la API de mercado son públicas y no requieren autenticación. Las operaciones que afectan a fondos se autorizan siempre con la firma de la wallet del usuario; el protocolo nunca solicita claves privadas ni frases de recuperación.", "Para integraciones de servidor (por ejemplo, paneles internos), se emiten claves de API de solo lectura con límites de uso configurables."] },
      { h: "Contratos del protocolo", p: ["El sistema se compone de tres contratos: el token OPEN (ERC-20), el módulo de recompra y quema, y el módulo de gobernanza.", "El token implementa la interfaz ERC-20 estándar: balanceOf, transfer, approve, allowance y transferFrom, además de los eventos Transfer y Approval. Las direcciones de los tres contratos y sus ABIs están verificadas y publicadas en el explorador de bloques.", "Recomendamos fijar la versión del ABI en tu integración y validar la dirección del contrato contra la lista oficial para evitar suplantaciones."] },
      { h: "Comprar e intercambiar", p: ["Las compras se ejecutan on-chain desde la wallet del usuario. El flujo típico es: approve del token de origen (si aplica), simulación de la operación para estimar el importe recibido y el slippage, y envío de la transacción.", "La preventa acepta USDC, ETH, WETH y cbBTC en la red Base: los tokens distintos de USDC se convierten vía agregador (0x) en la misma operación. También se admiten fondos desde otras redes (Ethereum, Arbitrum, Solana, Bitcoin…), que se puentean automáticamente a USDC en Base antes de la compra."] },
      { h: "API de mercado", p: ["Expone endpoints REST y WebSocket para precio en tiempo real, histórico de cotización por rango (1D, 1S, 1M, 1A, todo), oferta circulante, suministro total, volumen y capitalización.", "Los datos se sirven con marcas de tiempo y se actualizan en streaming a través de WebSocket para construir gráficos y tickers en vivo sin sondeo constante."] },
      { h: "API de cartera", p: ["Permite consultar, a partir de una dirección pública, los saldos por activo, el valor total, el coste medio de adquisición y el rendimiento (P&L) de la posición en OPEN.", "El historial de operaciones devuelve compras, ventas e intercambios con su tipo, importes, precio de ejecución, comisión y marca temporal."] },
      { h: "Webhooks y eventos", p: ["Puedes suscribirte a eventos on-chain —compra, venta, intercambio y recompra/quema— para reaccionar a la actividad en tu propia aplicación.", "Cada evento incluye la dirección implicada (enmascarada cuando procede), los importes y el hash de la transacción, de modo que puedas enlazar al explorador de bloques para su verificación."] },
      { h: "Límites de uso", p: ["La API pública aplica límites por IP y por clave. Si necesitas un caudal superior para una integración en producción, puedes solicitar una clave con límites ampliados.", "Las respuestas incluyen cabeceras con el cupo restante para que tu cliente pueda regular el ritmo de las peticiones."] },
      { h: "Gestión de errores", p: ["La API utiliza códigos HTTP estándar y un cuerpo de error con un identificador legible y un mensaje descriptivo. Las operaciones on-chain pueden revertir; en ese caso, la simulación previa indica el motivo (saldo insuficiente, slippage excedido, allowance insuficiente) antes de gastar comisiones de red."] },
      { h: "Buenas prácticas", p: ["Simula siempre las operaciones antes de enviarlas, muestra al usuario el importe mínimo recibido y las comisiones, y valida las direcciones de los contratos. Nunca solicites ni almacenes claves privadas: toda autorización debe pasar por la firma de la wallet del usuario."] },
    ],
  },
  audit: {
    eyebrow: "Auditoría",
    title: "Seguridad y auditorías",
    meta: "Contratos verificados on-chain",
    subtitle: "Los contratos del protocolo han sido revisados por auditores independientes. El código es abierto y verificable.",
    sections: [
      { h: "Alcance", p: ["La auditoría cubre el token ERC-20, el módulo de recompra/quema y el módulo de gobernanza, incluyendo control de acceso, aritmética de saldos y los flujos de quema."] },
      { h: "Resultados", p: ["Sin hallazgos críticos ni de severidad alta pendientes. Las observaciones de severidad media y baja fueron resueltas y reverificadas. El informe completo está disponible públicamente."] },
      { h: "No custodia", p: [`${brandLegal.productBrand} no custodia los fondos de los usuarios. Los OPEN se envían directamente a la wallet del inversor; solo el usuario controla sus claves privadas.`] },
      { h: "Programa de recompensas", p: ["Existe un programa de bug bounty para incentivar la divulgación responsable de vulnerabilidades por parte de la comunidad de seguridad."] },
    ],
  },
  support: {
    eyebrow: "Soporte",
    title: "Centro de soporte",
    meta: "Respuesta media < 24 h",
    subtitle: "¿Necesitas ayuda con una compra, un intercambio o tu wallet? Aquí tienes las vías de contacto y las dudas más frecuentes.",
    sections: [
      { h: "Contacto", p: ["Escríbenos a soporte@openai.demo o a través del chat de la aplicación. El equipo responde en menos de 24 horas en días laborables."] },
      { h: "Problemas con una compra", p: ["Todas las compras son transacciones on-chain firmadas desde tu wallet: puedes comprobar su estado en Basescan con el hash de la transacción. Si un puente desde otra red queda pendiente, la pantalla de compra muestra el estado en tiempo real; los envíos con importe distinto al indicado pueden retrasarse o reembolsarse automáticamente a la dirección de origen."] },
      { h: "Recuperar el acceso", p: [`El protocolo no custodia tus claves: si pierdes el acceso a tu wallet, deberás recuperarla con tu frase de recuperación. Nunca compartas tu frase semilla con nadie, tampoco con el soporte.`] },
      { h: "Estado del servicio", p: ["Publicamos incidencias y mantenimiento programado en la página de estado. La liquidez on-chain permite operar incluso durante el mantenimiento de la interfaz."] },
    ],
  },
  terms: {
    eyebrow: "Legal",
    title: "Términos y condiciones",
    meta: `Última actualización: ${lastUpdated}`,
    subtitle: `Condiciones de uso del protocolo ${protocolName}. Al utilizar esta interfaz, aceptas estos términos.`,
    sections: [
      {
        h: "1. Naturaleza descentralizada",
        p: [
          `${protocolName} es un protocolo y ecosistema tokenizado operado de forma descentralizada. No existe una sociedad limitada (SL) ni un operador central único que custodie activos o actúe como entidad de inversión.`,
          `Las reglas del protocolo se ejecutan mediante contratos inteligentes y decisiones de gobernanza: ${governanceModel}. Contrato del token OPEN (cuando aplique): ${tokenContractAddress} en ${tokenChain}.`,
          "Esta web es una interfaz mantenida por contribuidores del ecosistema. " + brandLegal.referencedCompanyNote,
        ],
      },
      {
        h: "2. Relación con OpenAI, Inc. y el token OPEN",
        id: "openai-inc",
        p: [
          `${brandLegal.referencedCompany} es el activo subyacente al que el protocolo destina capital vía tesorería y SPV, según se describe en la documentación.`,
          brandLegal.legalChecklist.tokenNatureParagraph + " " + treasuryMechanism.legalBoundary,
          "Las marcas OpenAI, ChatGPT y logotipos relacionados son propiedad de sus titulares. Su uso en este sitio es referencial o descriptivo.",
        ],
      },
      {
        h: "3. Interfaz y contribuidores",
        p: [
          "La interfaz facilita consultar datos de mercado, conectar una wallet y solicitar operaciones con el token OPEN. Los contribuidores del protocolo pueden actualizar el frontend, la documentación o integraciones, sujetos a gobernanza cuando corresponda.",
          `Comunicaciones legales designadas: ${contactLegal}. Foro de gobernanza: ${governanceUrl}.`,
          "No somos banco, entidad de pago centralizada ni asesor de inversiones. No guardamos tus claves privadas.",
        ],
      },
      {
        h: "4. Pagos y conversiones on-chain",
        p: [
          "Todas las compras se pagan con criptoactivos (USDC, ETH, WETH o cbBTC en la red Base) y se firman desde la wallet del usuario. La interfaz no acepta pagos con tarjeta ni otros métodos fiat.",
          "Si pagas con un token distinto de USDC, la conversión se ejecuta on-chain a través de un agregador de liquidez (0x) en la misma operación. Si traes fondos desde otra red, el puente lo ejecuta la infraestructura de Relay y el USDC se entrega en tu propia wallet de Base.",
          "Los costes de conversión y las comisiones de red se muestran antes de confirmar. Las transacciones on-chain son irreversibles una vez confirmadas.",
        ],
      },
      {
        h: "5. Elegibilidad y territorios restringidos",
        id: "elegibilidad",
        p: [
          "Debes ser mayor de edad en tu jurisdicción y tener capacidad legal para contratar.",
          `No puedes usar el servicio si resides en o accedes desde: ${restrictedList}.`,
          brandLegal.geoNotice,
          "Eres responsable de comprobar que el uso de criptoactivos y la compra de tokens está permitido en tu país.",
        ],
      },
      {
        h: "6. Riesgos",
        p: [
          "El valor de OPEN puede fluctuar. Invierte solo lo que puedas permitirte perder.",
          `Consulta la ${brandLegal.risksDocTitle} antes de operar. Nada en esta web constituye asesoramiento financiero, fiscal o legal.`,
        ],
      },
      {
        h: "7. Limitación de responsabilidad",
        p: [
          "En la máxima medida permitida por la ley, los contribuidores del protocolo y mantenedores de la interfaz no responden por pérdidas derivadas de la volatilidad del mercado, fallos de contratos inteligentes, bugs en el frontend, fallos de terceros (wallets, blockchains, proveedores de pago), errores de usuario o fuerza mayor.",
          "El protocolo se ofrece «tal cual». La gobernanza comunitaria puede modificar parámetros; es tu responsabilidad informarte de las propuestas vigentes.",
        ],
      },
      {
        h: "8. Modificaciones",
        p: ["Podemos actualizar estos términos. La fecha de la última versión figura al inicio. El uso continuado del servicio implica la aceptación de los cambios."],
      },
    ],
  },
  privacy: {
    eyebrow: "Legal",
    title: "Política de privacidad",
    meta: `Última actualización: ${lastUpdated}`,
    subtitle: `Protocolo ${protocolName}. Cómo se tratan los datos al usar esta interfaz.`,
    sections: [
      {
        h: "1. Responsables del tratamiento",
        p: [
          `${protocolName} es un ecosistema descentralizado. Para cumplimiento del RGPD y consultas de privacidad, contacta con el canal designado por la comunidad: ${contactPrivacy} (${operatorName}).`,
          `Referencia jurisdiccional: ${operatorCountry}. ${legalConfig.operatorAddress}`,
          "Los datos on-chain (direcciones de wallet, transacciones) son públicos por diseño de la blockchain.",
        ],
      },
      {
        h: "2. Datos que tratamos",
        p: [
          "Dirección pública de wallet, historial de operaciones en la plataforma, preferencias de idioma y datos técnicos (IP, dispositivo, logs de errores).",
          "Si te registras o conectas wallet, podemos asociar tu dirección a tu cuenta.",
          "No recogemos datos de tarjeta ni realizamos verificación de identidad (KYC): todos los pagos son criptoactivos firmados desde tu propia wallet.",
        ],
      },
      {
        h: "3. Infraestructura de terceros",
        p: [
          "Para cotizar conversiones y puentes compartimos con los proveedores de infraestructura (agregador 0x, Relay, nodos RPC) los datos mínimos necesarios: importes, tokens y dirección pública de wallet de destino.",
          "Estos proveedores no reciben datos personales identificativos por nuestra parte; consulta sus políticas de privacidad para conocer el tratamiento de los datos técnicos.",
        ],
      },
      {
        h: "4. Finalidad y base legal",
        p: [
          "Ejecutar operaciones, mostrar tu cartera, prevenir fraude, cumplir obligaciones legales y mejorar el servicio.",
          "Base legal: ejecución del contrato, interés legítimo y, cuando aplique, consentimiento.",
        ],
      },
      {
        h: "5. Conservación y derechos",
        p: [
          "Conservamos los datos el tiempo necesario para prestar el servicio y cumplir la normativa. La actividad on-chain es pública e inmutable.",
          `Puedes ejercer acceso, rectificación, supresión, oposición y portabilidad escribiendo a ${contactPrivacy}. También puedes reclamar ante la autoridad de protección de datos de tu país.`,
        ],
      },
    ],
  },
  risks: {
    eyebrow: "Legal",
    title: brandLegal.risksDocTitle,
    meta: "Lee esto antes de invertir",
    subtitle: "Invertir en OPEN conlleva riesgos. Conócelos antes de operar.",
    sections: [
      {
        h: "Volatilidad",
        p: ["El precio de OPEN puede subir o bajar con rapidez. El rendimiento pasado no garantiza resultados futuros."],
      },
      {
        h: "Riesgo de pérdida total",
        p: ["Podrías perder la totalidad del capital invertido. Invierte únicamente lo que puedas permitirte perder."],
      },
      {
        h: "Riesgo tecnológico",
        p: [
          "Los contratos inteligentes pueden contener errores. La pérdida de claves privadas implica pérdida irreversible de fondos. Las transacciones on-chain suelen ser irreversibles.",
        ],
      },
      {
        h: "Conversiones y puentes",
        p: [
          "Si pagas con un token distinto de USDC o traes fondos desde otra red, la conversión y el puente dependen de infraestructura de terceros (agregador 0x, Relay) y de las condiciones del mercado: el precio cotizado tiene validez limitada y puede variar.",
          "Los envíos cross-chain con importe distinto al indicado pueden retrasarse o acabar reembolsados a la dirección de origen. Las comisiones de red de la cadena de origen no son reembolsables.",
        ],
      },
      {
        h: "Regulación",
        p: [
          "La normativa sobre criptoactivos varía por país y puede cambiar. Es tu responsabilidad cumplir las leyes aplicables, incluidas obligaciones fiscales sobre plusvalías.",
        ],
      },
      {
        h: "Exposición al valor de OpenAI, Inc.",
        p: [
          "La tesorería del protocolo puede mantener acciones o instrumentos vinculados a " + brandLegal.referencedCompany + ". Esa exposición puede ser ilíquida, estar sujeta a lock-ups o reflejarse con retraso en el precio de " + brandLegal.tokenTicker + ".",
          "Una OPI futura de " + brandLegal.referencedCompany + " no garantiza por sí sola un resultado concreto para los holders de " + brandLegal.tokenTicker + ".",
          brandLegal.tokenTicker + " puede variar respecto al valor de mercado de la empresa por liquidez, especulación o factores técnicos.",
        ],
      },
      {
        h: "Desacople NAV ↔ precio de mercado",
        p: [
          brandLegal.navDisclaimer,
          "El NAV compuesto agrega equity en SPV y reservas operativas. Retrasos en attestations, illiquidez del SPV o especulación on-chain pueden ampliar la brecha entre NAV y precio spot de " + brandLegal.tokenTicker + ".",
        ],
      },
      {
        h: "Relación con OpenAI, Inc.",
        p: [
          brandLegal.productBrand + " canaliza inversión hacia " + brandLegal.referencedCompany + " de forma independiente. OPEN no otorga derechos de accionista directos ni acceso a productos oficiales de OpenAI.",
          "Las decisiones del protocolo pueden cambiar comisiones, listados o integraciones. Sigue las votaciones en " + governanceUrl + ".",
          "Operar con OPEN implica riesgo de smart contract: verifica la dirección del contrato antes de interactuar.",
        ],
      },
      {
        h: "Sin asesoramiento",
        p: ["Esta plataforma no ofrece asesoramiento financiero, fiscal o legal. Consulta a un profesional independiente si lo necesitas."],
      },
    ],
  },
  compliance: {
    eyebrow: "Legal",
    title: "Guía de cumplimiento y copy",
    meta: `Última actualización: ${lastUpdated}`,
    subtitle: "Textos obligatorios, zonas de disclaimer y checklist pre-lanzamiento para el equipo y partners (exchanges, integraciones).",
    sections: [
      {
        h: "Principio rector",
        p: [
          "Marketing puede nombrar OpenAI, Inc. para describir el activo subyacente (OPI, valoración, equity en SPV). La identidad del operador es openAI Protocol. OPEN representa participación en la tesorería del protocolo.",
          brandLegal.legalChecklist.tokenNatureParagraph,
        ],
      },
      {
        h: "Textos por zona de la interfaz",
        p: [
          `Footer (aviso afiliación): ${brandLegal.affiliationNoticeSoft}`,
          `Hero (micro): ${brandLegal.copy.heroMicro || "—"}`,
          `Countdown OPI: ${brandLegal.copy.opiContext}`,
          `Ecosistema / equity: ${brandLegal.copy.equityMicro}`,
          `Value accrual: ${brandLegal.navDisclaimerMarketing}`,
          `Compra / swap: ${brandLegal.affiliationNoticeSoft}`,
          `Footer legal: ${brandLegal.footerDisclaimer}`,
          `Geo: ${brandLegal.geoNotice}`,
          `Legal estricto (recibos, docs): ${brandLegal.shortDisclaimer}`,
        ],
      },
      {
        h: "Marketing permitido",
        p: brandLegal.marketingAllowed.map((item) => "· " + item),
      },
      {
        h: "Marketing prohibido",
        p: brandLegal.marketingForbidden.map((item) => "· " + item),
      },
      {
        h: "Consentimiento en flujos de operación",
        p: [
          "Checkbox UI (compra / swap): «He leído y acepto los Términos, la Política de privacidad y la Información de riesgos.»",
          `Referencia extendida (docs legales, no UI): cripto — ${brandLegal.legalChecklist.consent.crypto}; swap — ${brandLegal.legalChecklist.consent.swap}`,
        ],
      },
      {
        h: "Checklist pre-lanzamiento",
        p: brandLegal.legalChecklist.preLaunch.map((item, i) => `${i + 1}. ${item}`),
      },
      {
        h: "Contacto",
        p: [
          `Legal: ${contactLegal}. Marcas: /docs/affiliation. Riesgos: /docs/risks.`,
          "Esta guía no sustituye asesoramiento legal. Revisión externa obligatoria antes de producción con dinero real.",
        ],
      },
    ],
  },
  affiliation: {
    eyebrow: "Legal",
    title: brandLegal.affiliationDocTitle,
    meta: `Última actualización: ${lastUpdated}`,
    subtitle: `Cómo se relacionan ${brandLegal.productBrand} y ${brandLegal.referencedCompany}.`,
    sections: [
      {
        h: "Quiénes somos",
        p: [
          `${brandLegal.productBrand} canaliza capital hacia acciones reales de ${brandLegal.referencedCompany} vía tesorería y SPV, y opera el ecosistema open* con el token ${brandLegal.tokenTicker}.`,
          getAffiliationNotice(),
        ],
      },
      {
        h: "Alcance y límites",
        p: [
          "Operamos como protocolo independiente — no como filial, partner ni producto oficial de OpenAI, Inc.",
          `${brandLegal.tokenTicker} es participación en la tesorería del protocolo, no una acción emitida directamente por ${brandLegal.referencedCompany}.`,
          "Las marcas OpenAI, ChatGPT, DALL·E, Sora, Whisper y Codex se citan como referencia al activo subyacente cuando procede.",
        ],
      },
      {
        h: "Nomenclatura del ecosistema",
        p: [
          brandLegal.ecosystemDisclaimer,
          "Los nombres openChat, openAPI, openImage, openMotion, openVoice y openCode designan productos del protocolo, no servicios oficiales de OpenAI, Inc.",
        ],
      },
      {
        h: "Uso nominativo de OpenAI, Inc.",
        p: [
          `Mencionamos ${brandLegal.referencedCompany} para describir el activo subyacente al que el protocolo destina capital (p. ej. antes de una OPI). Ese uso es descriptivo.`,
          brandLegal.investmentMechanismMarketing + " " + treasuryMechanism.legalBoundary,
        ],
      },
      {
        h: "Contacto y cumplimiento",
        p: [
          `Consultas legales: ${contactLegal}. Términos completos: /docs/terms. Riesgos: /docs/risks.`,
          "Si eres un exchange, integrador o regulador y necesitas confirmación escrita de no afiliación, contacta por el canal legal designado.",
        ],
      },
    ],
  },
};

export const docSlugs = Object.keys(docMap);
