import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";
import { brandLegal } from "@/lib/brand-legal";

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: brandLegal.productBrand,
      preference: "smartWalletOnly",
    }),
    injected(),
  ],
  transports: {
    [base.id]: http(),
  },
  ssr: true,
});
