import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";
import { WALLET_CONNECT_METADATA } from "@/lib/onramp/constants";
import { brandLegal } from "@/lib/brand-legal";
import { getWalletConnectProjectId } from "./env";

const walletConnectProjectId = getWalletConnectProjectId();

const connectors = [
  coinbaseWallet({
    appName: brandLegal.productBrand,
    preference: "smartWalletOnly",
  }),
  injected({ shimDisconnect: true }),
  ...(walletConnectProjectId
    ? [
        walletConnect({
          projectId: walletConnectProjectId,
          metadata: {
            ...WALLET_CONNECT_METADATA,
            icons: [...WALLET_CONNECT_METADATA.icons],
          },
          showQrModal: true,
          qrModalOptions: {
            themeMode: "light",
            explorerRecommendedWalletIds: [
              "c57ca95a475eee778fec9758359a8f2c",
              "4622a2b2d6af1c9843938950e85218a3",
            ],
          },
        }),
      ]
    : []),
];

export const wagmiConfig = createConfig({
  chains: [base],
  connectors,
  transports: {
    [base.id]: http(),
  },
  ssr: true,
});

export const hasWalletConnect = Boolean(walletConnectProjectId);
