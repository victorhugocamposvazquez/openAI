"use client";

import { useState } from "react";
import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";
import { WalletPickerModal } from "../ui/WalletPickerModal";
import { StepCard, StepTitle } from "../ui/CopyAddressButton";

/**
 * Paso previo a la compra sin wallet conectada: un único CTA que abre el
 * selector unificado (extensiones, wallet del móvil o crear una nueva).
 */
export function SinWalletStep() {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      {showPicker ? <WalletPickerModal onClose={() => setShowPicker(false)} /> : null}

      <StepCard>
        <StepTitle title={BUY_FLOW_COPY.sinWalletTitle} subtitle={BUY_FLOW_COPY.sinWalletSubtitle} />

        <Hov
          as="button"
          type="button"
          onClick={() => setShowPicker(true)}
          style="appearance:none;cursor:pointer;width:100%;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:15px;font:600 15px var(--font-hanken)"
          hover="background:#000"
        >
          {BUY_FLOW_COPY.connectWallet}
        </Hov>

        <p style={css("font:400 13px/1.5 var(--font-hanken);color:#8A8A94;margin:14px 0 0;text-align:center")}>
          {BUY_FLOW_COPY.connectDesktopHint}
        </p>
      </StepCard>
    </>
  );
}
