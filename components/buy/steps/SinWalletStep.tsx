"use client";

import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { useConnect } from "wagmi";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";
import { StepCard, StepTitle } from "../ui/CopyAddressButton";

export function SinWalletStep() {
  const { connect, connectors, isPending } = useConnect();

  const smart = connectors.find((c) => c.id === "coinbaseWalletSDK" || c.name.toLowerCase().includes("coinbase"));
  const injected = connectors.find((c) => c.id === "injected");

  const connectWith = (connector: (typeof connectors)[number] | undefined) => {
    if (!connector || isPending) return;
    connect({ connector, chainId: 8453 });
  };

  return (
    <StepCard>
      <StepTitle title={BUY_FLOW_COPY.sinWalletTitle} subtitle={BUY_FLOW_COPY.sinWalletSubtitle} />
      <div style={css("display:flex;flex-direction:column;gap:10px")}>
        <Hov
          as="button"
          type="button"
          disabled={!smart || isPending}
          onClick={() => connectWith(smart)}
          style="appearance:none;cursor:pointer;width:100%;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:15px;font:600 15px var(--font-hanken)"
          hover="background:#000"
        >
          {isPending ? "Conectando…" : BUY_FLOW_COPY.connectSmartWallet}
        </Hov>
        <Hov
          as="button"
          type="button"
          disabled={!injected || isPending}
          onClick={() => connectWith(injected)}
          style="appearance:none;cursor:pointer;width:100%;background:#fff;color:#0D0D0D;border:1px solid #E6E6E8;border-radius:12px;padding:15px;font:600 15px var(--font-hanken)"
          hover="border-color:#0D0D0D"
        >
          {BUY_FLOW_COPY.connectInjected}
        </Hov>
      </div>
    </StepCard>
  );
}
