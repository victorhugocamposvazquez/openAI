"use client";

import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";
import { StepCard, StepTitle } from "../ui/CopyAddressButton";

type Props = {
  onRetry: () => void;
};

export function EsperandoFondosStep({ onRetry }: Props) {
  return (
    <StepCard>
      <StepTitle title={BUY_FLOW_COPY.esperandoTitle} subtitle={BUY_FLOW_COPY.esperandoSubtitle} />
      <div style={css("display:flex;justify-content:center;padding:24px 0 32px")}>
        <div
          style={css(
            "width:40px;height:40px;border:3px solid #ECECEC;border-top-color:#0D0D0D;border-radius:50%;animation:buy-spin 0.9s linear infinite"
          )}
        />
      </div>
      <Hov
        as="button"
        type="button"
        onClick={onRetry}
        style="appearance:none;cursor:pointer;width:100%;background:#fff;color:#0D0D0D;border:1px solid #E6E6E8;border-radius:12px;padding:14px;font:600 14px var(--font-hanken)"
        hover="border-color:#0D0D0D"
      >
        {BUY_FLOW_COPY.retryPaymentCta}
      </Hov>
      <style>{`@keyframes buy-spin { to { transform: rotate(360deg); } }`}</style>
    </StepCard>
  );
}
