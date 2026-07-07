"use client";

import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";
import { useAccount, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";
import { StepCard, StepTitle } from "./CopyAddressButton";

type Props = {
  children: React.ReactNode;
};

export function BaseChainGuard({ children }: Props) {
  // chainId de useAccount() es la red real de la wallet; useChainId() devolvería
  // siempre la de la config (solo Base) y la guardia nunca saltaría.
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending, error } = useSwitchChain();

  if (!isConnected) return <>{children}</>;

  if (chainId === base.id) return <>{children}</>;

  return (
    <StepCard>
      <StepTitle title={BUY_FLOW_COPY.switchChainTitle} subtitle={BUY_FLOW_COPY.switchChainSubtitle} />
      <Hov
        as="button"
        type="button"
        disabled={isPending}
        onClick={() => switchChain({ chainId: base.id })}
        style="appearance:none;cursor:pointer;width:100%;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:15px;font:600 15px var(--font-hanken)"
        hover="background:#000"
      >
        {isPending ? "Cambiando red…" : BUY_FLOW_COPY.switchChainCta}
      </Hov>
      {error ? (
        <p style={css("font:400 13px var(--font-hanken);color:#D14343;margin:12px 0 0")}>
          {BUY_FLOW_COPY.switchChainRejected}
        </p>
      ) : null}
    </StepCard>
  );
}
