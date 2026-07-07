"use client";

import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { useConnect } from "wagmi";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";
import { StepCard, StepTitle } from "../ui/CopyAddressButton";

export function SinWalletStep() {
  const { connect, connectors, isPending, error } = useConnect();

  const injectedConnector = connectors.find((c) => c.id === "injected" || c.type === "injected");

  const connectWallet = () => {
    if (!injectedConnector || isPending) return;
    connect({ connector: injectedConnector, chainId: 8453 });
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
          disabled={!injectedConnector || isPending}
          onClick={connectWallet}
          style="appearance:none;cursor:pointer;width:100%;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:15px;font:600 15px var(--font-hanken)"
          hover="background:#000"
        >
          {isPending ? "Conectando…" : BUY_FLOW_COPY.connectWallet}
        </Hov>
        {!injectedConnector ? (
          <p style={css("font:400 13px var(--font-hanken);color:#D14343;margin:0")}>
            {BUY_FLOW_COPY.noWalletExtension}
          </p>
        ) : null}
        {error ? (
          <p style={css("font:400 13px var(--font-hanken);color:#D14343;margin:0")}>{error.message}</p>
        ) : null}
      </div>
    </StepCard>
  );
}
