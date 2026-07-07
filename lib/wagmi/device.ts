export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

/** Navegador interno de wallet en móvil (Trust, MetaMask app, etc.). */
export function isInAppWalletBrowser(): boolean {
  if (typeof window === "undefined" || !isMobileDevice()) return false;
  return Boolean((window as Window & { ethereum?: unknown }).ethereum);
}
