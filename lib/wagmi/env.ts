export function getWalletConnectProjectId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_WC_PROJECT_ID?.trim();
  return id || undefined;
}
