import { http, createConfig } from "wagmi";
import { arbitrum, base, bsc, mainnet, optimism, polygon } from "wagmi/chains";
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

// Base es la cadena principal (compra). El resto son orígenes del puente cross-chain.
export const wagmiConfig = createConfig({
  chains: [base, mainnet, arbitrum, optimism, polygon, bsc],
  connectors,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
  },
  ssr: true,
});

export const hasWalletConnect = Boolean(walletConnectProjectId);
