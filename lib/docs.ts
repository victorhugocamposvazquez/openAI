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
      { value: "5,000M", label: "Suministro total" },
      { value: "30%", label: "Comisiones a recompra" },
      { value: "ERC-20", label: "Estándar del token" },
      { value: "2027", label: "OPI prevista" },
    ],
    sections: [
      { h: "Resumen ejecutivo", p: [treasuryMechanism.summary, `El diseño persigue tres objetivos: acumular y seguir acumulando equity real de ${brandLegal.referencedCompany} (antes, durante y después de su OPI), monetizar de forma permanente el ecosistema de productos del ${brandLegal.productBrand}, y mantener liquidez on-chain del token OPEN sin custodia centralizada sobre los tokens del inversor.`, brandLegal.copy.postOpiFlywheel, treasuryMechanism.legalBoundaryMarketing + " Este documento tiene carácter informativo y no constituye asesoramiento financiero."] },
      { h: "1. Contexto y motivación", p: ["Las empresas privadas de alto crecimiento concentran gran parte de su revalorización en las fases previas a su salida a bolsa, un periodo al que el inversor minorista rara vez tiene acceso. Cuando la compañía finalmente cotiza, buena parte de la apreciación ya se ha producido y queda reservada a inversores institucionales y rondas privadas.", `OPEN propone un flywheel on-chain: el capital de los suscriptores financia la compra de acciones reales de ${brandLegal.referencedCompany} y la operación de productos open* que generan ingresos recurrentes. Esos flujos se consolidan en un NAV compuesto que orienta el valor de mercado del token.`] },
      { h: "2. El token OPEN", p: ["OPEN es un token fungible conforme al estándar ERC-20, desplegado sobre una red EVM con costes de transacción reducidos. El suministro total es fijo en 5.000 millones de unidades; el contrato no incluye función de acuñación adicional, por lo que la oferta solo puede mantenerse o decrecer.", brandLegal.legalChecklist.tokenNatureParagraph, treasuryMechanism.legalBoundaryMarketing] },
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
      { h: "7. Distribución del suministro", p: ["El suministro de 5.000 millones de OPEN se distribuye así: 30% a la preventa pública, 25% a liquidez on-chain, 20% al fondo de recompra y quema, 20% a marketing y crecimiento, y 5% al equipo.", "La asignación del equipo queda bloqueada durante 36 meses con liberación lineal a partir del mes 12. La reserva de marketing se libera por tramos ligados a hitos públicos de adopción, evitando presiones de venta repentinas sobre el mercado."] },
      { h: "8. Liquidez y mercado", p: ["El 25% del suministro destinado a liquidez se despliega en pools on-chain que garantizan que cualquier inversor pueda comprar o vender OPEN en todo momento. Los compradores de preventa no están sujetos a periodos de bloqueo.", "La profundidad de los pools y los parámetros de las comisiones se calibran para minimizar el slippage en operaciones de tamaño habitual y para sostener un mercado ordenado durante los eventos de recompra."] },
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
    meta: "Suministro fijo · 5.000M OPEN",
    subtitle: "Distribución del suministro, calendarios de bloqueo y el mecanismo de recompra que sostiene el valor del token.",
    hasStats: true,
    stats: [
      { value: "5,000M", label: "Suministro total" },
      { value: "30%", label: "Preventa pública" },
      { value: "20%", label: "Recompra y quema" },
      { value: "5%", label: "Equipo (lock-up 3a)" },
    ],
    sections: [
      { h: "Distribución del suministro", p: ["Preventa pública: 30%. Liquidez on-chain: 25%. Recompra y quema: 20%. Marketing: 20%. Equipo: 5% (bloqueado 3 años). El suministro total es fijo: no se acuñarán nuevos OPEN."] },
      { h: "Calendario de bloqueo", p: ["La asignación del equipo queda bloqueada durante 36 meses con liberación lineal a partir del mes 12. La reserva de marketing se libera por tramos ligados a hitos públicos de adopción."] },
      { h: "Recompra y quema", p: ["El 30% de las comisiones del ecosistema financia recompras periódicas de OPEN, que se retiran de circulación de forma permanente y verificable. Este mecanismo es el principal motor de contracción de la oferta."] },
      { h: "Liquidez", p: ["El 25% destinado a liquidez se despliega en pools on-chain para garantizar que cualquier inversor pueda comprar o vender OPEN en todo momento, sin periodos de bloqueo para los compradores de preventa."] },
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
      { h: "Comprar e intercambiar", p: ["Las compras con cripto y los intercambios se ejecutan contra los pools de liquidez del protocolo. El flujo típico es: approve del token de origen (si aplica), simulación de la operación para estimar el importe recibido y el slippage, y envío de la transacción de swap.", "Las compras con tarjeta se delegan en los proveedores de on-ramp Transak y MoonPay mediante sus SDK. El widget del proveedor recoge los datos de pago y, al completarse, acredita los OPEN en la wallet del usuario."] },
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
      { h: "Problemas con un pago", p: ["Las compras con tarjeta se procesan en Transak o MoonPay. Si un pago queda pendiente, consulta primero el panel del proveedor; desde ahí podrás ver el estado y solicitar asistencia."] },
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
        h: "4. Pagos con tarjeta (on-ramp)",
        p: [
          "Los pagos con tarjeta, Apple Pay, SEPA u otros métodos fiat se procesan exclusivamente a través de proveedores terceros regulados (Transak, MoonPay u otros que indiquemos).",
          "Al pagar con tarjeta, abandonas temporalmente nuestro sitio o se abre el widget del proveedor. Ese proveedor es responsable del procesamiento del pago, KYC/AML y cumplimiento PCI. Nosotros no recibimos ni almacenamos números de tarjeta, CVC ni datos bancarios completos.",
          "Las comisiones del proveedor y del protocolo se muestran antes de confirmar. Los reembolsos y disputas de tarjeta se rigen por la política del proveedor de pago.",
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
          "Los datos de tarjeta, identidad (KYC) y documentos los recogen y tratan Transak, MoonPay u otros proveedores de on-ramp conforme a sus propias políticas. Nosotros no almacenamos PAN, CVC ni copias de DNI salvo que la ley lo exija en un procedimiento concreto.",
        ],
      },
      {
        h: "3. Proveedores de pago (Transak / MoonPay)",
        p: [
          "Al pagar con tarjeta, compartimos con el proveedor los datos mínimos necesarios: importe, moneda, dirección de wallet de destino, identificador de pedido y URL de retorno.",
          "Consulta la política de privacidad de Transak (transak.com) y MoonPay (moonpay.com) para saber cómo tratan tus datos personales.",
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
        h: "Pagos con tarjeta",
        p: [
          "Los pagos fiat los procesa un tercero (Transak/MoonPay). Pueden aplicarse comisiones, límites diarios, rechazos bancarios o retrasos por verificación de identidad.",
          "Los contracargos y disputas se gestionan con el emisor de la tarjeta y el proveedor de on-ramp, no directamente con nosotros.",
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
    subtitle: "Textos obligatorios, zonas de disclaimer y checklist pre-lanzamiento para el equipo y partners (on-ramps, exchanges).",
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
          `Tarjeta: ${brandLegal.legalChecklist.consent.card}`,
          `Cripto: ${brandLegal.legalChecklist.consent.crypto}`,
          `Swap: ${brandLegal.legalChecklist.consent.swap}`,
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
          "Si eres un proveedor de on-ramp, exchange o regulador y necesitas confirmación escrita de no afiliación, contacta por el canal legal designado.",
        ],
      },
    ],
  },
};

export const docSlugs = Object.keys(docMap);
