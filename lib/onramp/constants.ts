import { brandLegal } from "@/lib/brand-legal";
import { legalConfig } from "@/lib/legal.config";

/** Metadata WalletConnect / Reown (wagmi walletConnect connector). */
/**
 * La URL de metadata DEBE coincidir con el origen desde el que se sirve la
 * dapp: si no coincide, Reown/WalletConnect la marca como "unverified" y
 * wallets como MetaMask pueden avisar o rechazar la sesión. En el navegador
 * usamos el origen real (cubre producción, previews y localhost); en SSR el
 * dominio canónico (el conector solo opera en cliente).
 */
const wcOrigin =
  typeof window !== "undefined" ? window.location.origin : legalConfig.siteUrl;

export const WALLET_CONNECT_METADATA = {
  name: brandLegal.productBrand,
  description: "Adquiere OPEN en la red Base con tu wallet.",
  url: wcOrigin,
  icons: [`${wcOrigin}/favicon.ico`],
} as const;

/** USDC en Base (solo uso interno; no mostrar al usuario). */
export const USDC_BASE = {
  address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const,
  decimals: 6,
};

export const BUY_FLOW_COPY = {
  pageTitle: "Adquirir OPEN",
  pageSubtitle: "Paga con USDC, ETH o cbBTC en Base — o trae fondos desde otra red.",
  sinWalletTitle: "Conecta tu wallet",
  sinWalletSubtitle: "Crea una cuenta segura o conecta la wallet que ya uses.",
  walletModalTitle: "Conectar wallet",
  walletModalSubtitle: "Usa la wallet que ya tienes o crea una nueva en segundos.",
  connectWallet: "Conectar wallet",
  connectDesktopHint:
    "La compra se firma siempre desde tu propia wallet: nadie más puede mover tus fondos.",
  // Opciones del selector (nunca mostrar tecnicismos como "WalletConnect").
  walletOptionExtensionSub: "Extensión del navegador",
  walletOptionMobileApp: "Abrir mi app de wallet",
  walletOptionMobileAppSub: "MetaMask, Trust, Rainbow y otras",
  walletOptionQr: "Con el móvil",
  walletOptionQrSub: "Escanea un código QR con la wallet de tu teléfono",
  walletOptionCreate: "Crear una wallet nueva",
  walletOptionCreateSub: "Con Face ID o Touch ID — sin instalar nada",
  walletOpeningApp: "Abriendo tu app de wallet…",
  walletOpeningQr: "Generando código QR…",
  walletConnecting: "Conectando…",
  noExtensionHint:
    "¿No usas extensión? Conecta con la wallet de tu móvil o crea una nueva.",
  walletConnectEnvHint:
    "Config: falta NEXT_PUBLIC_WC_PROJECT_ID (gratis en cloud.reown.com).",
  switchChainTitle: "Cambia tu wallet a la red Base",
  switchChainSubtitle: "Esta operación solo funciona en Base (Chain ID 8453).",
  switchChainCta: "Cambiar a Base",
  switchChainRejected: "Rechazaste el cambio de red. Cámbiala manualmente a Base en tu wallet para continuar.",
  confirmInWalletApp: "Confirma en tu app de wallet",
  confirmInWalletAppHint: "Abre tu wallet, firma la transacción y vuelve aquí. El estado se actualizará solo.",
  useAnotherWallet: "Usar otra wallet",
  sinFondosTitle: "Necesitas USDC en Base",
  sinFondosSubtitle: "Deposita USDC en tu wallet en la red Base para continuar con la preventa.",
  sinFondosPollingHint:
    "Cuando recibas USDC en Base, detectaremos el saldo automáticamente. No hace falta recargar la página.",
  walletAddressLabel: "Tu dirección en Base",
  checkingBalance: "Comprobando saldo…",
  rampManualNetworkWarning:
    "Importante: el USDC debe estar en la red Base. Enviar fondos a otra red puede provocar pérdidas.",
  listoTitle: "¡Fondos listos!",
  listoSubtitle: (balance: string) => `Tienes ${balance} disponibles para invertir en OPEN.`,
  continueCta: "Continuar a la compra",
  compraTitle: "Comprar OPEN",
  compraSubtitle: "Elige con qué moneda pagar. Convertimos a USDC y compramos OPEN desde tu wallet.",
  compraTgeNotice:
    "Los tokens comprados en preventa se reciben en el momento del lanzamiento (TGE) mediante claim, no inmediatamente tras la compra.",
  compraPayWith: "Pagar con",
  compraBalance: "Saldo",
  compraEstimatedOpen: "OPEN estimados",
  compraQuoteRefreshing: "Cotización se actualiza cada 30 s",
  compraQuoteExpired: "Actualizando el precio…",
  compraQuoteFallback: "No pudimos cotizar la conversión ahora mismo. Paga con USDC o inténtalo de nuevo en unos minutos.",
  compraCapExceeded: "El importe supera el cupo restante de la preventa. Reduce la cantidad.",
  compraConvertCta: "Convertir a fondos de compra",
  compraConvertDone: "Conversión completada. Ahora puedes comprar OPEN con tus USDC.",
  compraStepBatch0x: "Firmar conversión y compra (una sola firma)",
  compraStepConvertApprove: "Paso 1/2 — Autorizar token de pago",
  compraStepConvertSwap: "Paso 2/2 — Convertir a USDC",
  compraAmountLabel: "Importe a pagar",
  compraHintNoAmount: "Introduce un importe para continuar.",
  compraHintLegal: "Marca la casilla de condiciones para activar la compra.",
  compraHintQuoteLoading: "Calculando el precio de conversión…",
  compraStartCta: "Iniciar compra",
  compraRetryCta: "Reintentar paso pendiente",
  compraDoneTitle: "Compra enviada",
  compraDoneSubtitle:
    "Tu transacción se ha enviado correctamente. Recibirás tus OPEN en el lanzamiento (TGE) mediante claim.",
  compraContractMissing: "Contrato de preventa no configurado (NEXT_PUBLIC_PRESALE_CONTRACT).",
  compraStepUsdcApprove: "Paso 1/2 — Autorizar USDC",
  compraStepUsdcBuy: "Paso 2/2 — Comprar OPEN",
  compraStepSwapApprove: "Paso 1/3 — Autorizar conversión",
  compraStepSwapConvert: "Paso 2/3 — Convertir a ETH",
  compraStepSwapBuy: "Paso 3/3 — Comprar OPEN",
  compraStepBatch: "Firmar compra (una sola firma)",
  compraWaitingConfirm: "Esperando confirmación on-chain…",
  compraUserRejected: "Rechazaste la transacción. Puedes reintentar el paso pendiente.",
  compraBackCta: "Volver",
  compraViewTx: "Ver transacción en Basescan",
  compraInsufficientSell: (symbol: string) => `No tienes suficiente ${symbol} para este importe.`,
  compraInsufficientUsdc: "No tienes suficiente USDC para este importe.",
  compraWrongNetwork: "Cambia tu wallet a la red Base para continuar.",
  compraGasInsufficient: "No tienes ETH suficiente para pagar la comisión de red.",
  compraBatchFailed: "La operación no se completó en la red. Vuelve a intentarlo.",
  compraGenericError: "No se pudo completar la operación. Inténtalo de nuevo.",
  bridgeTabBase: "Pagar en Base",
  bridgeTabOther: "Desde otra red",
  bridgeTabReceive: "Recibir USDC",
  receiveSubtitle:
    "Envía USDC a tu dirección en la red Base desde otra wallet o un exchange. El saldo se detecta automáticamente.",
  receiveCurrentBalance: "Tu saldo USDC en Base",
  compraModeChecking: "Comprobando tu wallet…",
  compraModeOneSignature: "Confirmarás todo con una sola firma en tu wallet.",
  compraModeSteps: (n: number) => `Confirmarás ${n} pasos en tu wallet, uno por uno.`,
  compraMaxCta: "MÁX",
  compraUsdEstimate: (v: string) => `≈ ${v} USD`,
  compraQuoteValidFor: (sec: number) => `Precio garantizado ${sec} s`,
  compraDoneViewPortfolio: "Ver en cartera",
  compraDoneBuyMore: "Comprar más OPEN",
  walletConnectedAs: "Wallet conectada",
  walletChangeCta: "Cambiar",
  bridgeExactAmountWarning:
    "Envía EXACTAMENTE el importe indicado en una sola transacción. Un importe distinto puede retrasar la operación o acabar en reembolso.",
  bridgeSubtitle:
    "Envía fondos desde otra red y los convertimos en USDC en tu wallet de Base. Después compras OPEN con normalidad.",
  bridgeOriginLabel: "Red de origen",
  bridgeTokenLabel: "Token a enviar",
  bridgeAmountLabel: "Importe a enviar",
  bridgeEstimatedUsdc: "USDC que recibirás en Base",
  bridgeFeesLabel: "Coste total estimado",
  bridgeTimeLabel: "Tiempo estimado",
  bridgeQuoteExpired: "La cotización del puente ha caducado. Vuelve a calcularla antes de enviar.",
  bridgeExpiresIn: (sec: number) => `La cotización caduca en ${sec} s`,
  bridgeSendCta: (network: string) => `Enviar desde ${network}`,
  bridgeGetDepositCta: "Generar dirección de depósito",
  bridgeDepositAddressLabel: "Dirección de depósito",
  bridgeDepositInstructions: (amount: string, symbol: string) =>
    `Envía exactamente ${amount} ${symbol} a esta dirección desde cualquier wallet o exchange. Un importe distinto puede retrasar la operación o generar un reembolso.`,
  bridgeBtcMinHint: "Con Bitcoin, las comisiones de red hacen inviables los importes pequeños.",
  bridgeSwitching: "Cambiando a la red de origen…",
  bridgeAwaitingWallet: "Confirma la transacción en tu wallet…",
  bridgeConfirmingOrigin: "Confirmando en la red de origen…",
  bridgeAwaitingDeposit: "Esperando tu depósito… Puedes dejar esta página abierta; se actualizará sola.",
  bridgeInProgress: "Puente en curso… El USDC llegará a tu wallet en Base en breve.",
  bridgeDelivered: "USDC recibido en Base. Ya puedes comprar OPEN.",
  bridgeRefunded: "La operación no se completó y los fondos se reembolsaron a la dirección de origen.",
  bridgeFailed: "El puente no se completó. Si enviaste fondos, se reembolsarán a la dirección de origen.",
  bridgeRetryCta: "Volver a intentar",
  bridgeNewCta: "Iniciar otro envío",
  bridgeGoBuyCta: "Comprar OPEN con mis USDC",
  bridgeViewDestTx: "Ver entrega en Basescan",
} as const;

/** Decimales del token OPEN (ajustable si el contrato usa otro valor). */
export const OPEN_TOKEN_DECIMALS = Number(process.env.NEXT_PUBLIC_OPEN_DECIMALS ?? "18");

export function formatUsdcBalance(amount: number): string {
  return `${amount.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
}

/** @deprecated Usar formatUsdcBalance para saldos on-chain. */
export function formatUserBalance(amount: number): string {
  return formatUsdcBalance(amount);
}
