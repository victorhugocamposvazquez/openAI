"use client";

import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";
import { StepCard, StepTitle } from "../ui/CopyAddressButton";

type Props = {
  balanceLabel: string;
  onContinue: () => void;
};

export function ListoStep({ balanceLabel, onContinue }: Props) {
  return (
    <StepCard>
      <StepTitle title={BUY_FLOW_COPY.listoTitle} subtitle={BUY_FLOW_COPY.listoSubtitle(balanceLabel)} />
      <Hov
        as="button"
        type="button"
        onClick={onContinue}
        style="appearance:none;cursor:pointer;width:100%;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:15px;font:600 15px var(--font-hanken)"
        hover="background:#000"
      >
        {BUY_FLOW_COPY.continueCta}
      </Hov>
    </StepCard>
  );
}
