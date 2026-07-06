"use client";

import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { useConnect } from "wagmi";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";
import { BASE_ACCOUNT_CONNECTOR_ID } from "@/lib/wagmi/wallet-kind";
import { StepCard, StepTitle } from "../ui/CopyAddressButton";

export function SinWalletStep() {
  const { connect, connectors, isPending } = useConnect();

  const baseAccount = connectors.find((c) => c.id === BASE_ACCOUNT_CONNECTOR_ID);

  const connectBaseAccount = () => {
    if (!baseAccount || isPending) return;
    connect({ connector: baseAccount, chainId: 8453 });
  };

  return (
    <StepCard>
      <StepTitle title={BUY_FLOW_COPY.sinWalletTitle} subtitle={BUY_FLOW_COPY.sinWalletSubtitle} />
      <p style={css("font:400 13px/1.5 var(--font-hanken);color:#8A8A94;margin:0 0 16px")}>
        {BUY_FLOW_COPY.connectExtensionHint}
      </p>
      <div style={css("display:flex;flex-direction:column;gap:10px")}>
        <Hov
          as="button"
          type="button"
          disabled={!baseAccount || isPending}
          onClick={connectBaseAccount}
          style="appearance:none;cursor:pointer;width:100%;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:15px;font:600 15px var(--font-hanken)"
          hover="background:#000"
        >
          {isPending ? "Conectando…" : BUY_FLOW_COPY.connectSmartWallet}
        </Hov>
      </div>
    </StepCard>
  );
}
