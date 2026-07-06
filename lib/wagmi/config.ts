import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { baseAccount, coinbaseWallet } from "wagmi/connectors";
import { brandLegal } from "@/lib/brand-legal";

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    baseAccount({
      appName: brandLegal.productBrand,
    }),
    coinbaseWallet({
      appName: brandLegal.productBrand,
      preference: "smartWalletOnly",
    }),
  ],
  transports: {
    [base.id]: http(),
  },
  ssr: true,
});
