"use client";

import { useState } from "react";
import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { LegalConsent } from "@/components/LegalConsent";
import { BUY_FLOW_COPY, ONRAMP_FIAT, validateFiatAmount } from "@/lib/onramp/constants";
import { InfoBanner, StepCard, StepTitle } from "../ui/CopyAddressButton";

type Props = {
  fiatValue: string;
  infoMessage?: string;
  onFiatChange: (value: string) => void;
  onAddFunds: (fiatValue: string) => void;
  onClearInfo: () => void;
};

export function SinFondosStep({ fiatValue, infoMessage, onFiatChange, onAddFunds, onClearInfo }: Props) {
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!consent) {
      setError(BUY_FLOW_COPY.consentRequired);
      return;
    }
    const validation = validateFiatAmount(fiatValue);
    if (!validation.ok) {
      setError(validation.message);
      return;
    }
    setError(null);
    onClearInfo();
    onAddFunds(validation.normalized);
  };

  return (
    <StepCard>
      <StepTitle title={BUY_FLOW_COPY.sinFondosTitle} subtitle={BUY_FLOW_COPY.sinFondosSubtitle} />

      {infoMessage ? <div style={css("margin-bottom:16px")}><InfoBanner message={infoMessage} /></div> : null}

      <label style={css("display:block;font:600 13px var(--font-hanken);color:#5C5C66;margin-bottom:8px")}>
        {BUY_FLOW_COPY.fiatLabel}
      </label>
      <div style={css("display:flex;align-items:center;border:1px solid #E6E6E8;border-radius:12px;padding:4px 14px;margin-bottom:6px")}>
        <input
          type="text"
          inputMode="decimal"
          value={fiatValue}
          onChange={(e) => {
            setError(null);
            onFiatChange(e.target.value);
          }}
          style={css("flex:1;border:none;outline:none;font:600 22px var(--font-mono);color:#0D0D0D;padding:10px 0;background:transparent")}
        />
        <span style={css("font:600 16px var(--font-hanken);color:#8A8A94")}>€</span>
      </div>
      <p style={css("font:400 13px var(--font-hanken);color:#B8B8BD;margin:0 0 20px")}>
        {BUY_FLOW_COPY.fiatHint(ONRAMP_FIAT.min, ONRAMP_FIAT.max)}
      </p>

      <div style={css("margin-bottom:20px")}>
        <LegalConsent checked={consent} onChange={setConsent} />
      </div>

      {error ? <p style={css("font:500 13px var(--font-hanken);color:#D14343;margin:0 0 12px")}>{error}</p> : null}

      <Hov
        as="button"
        type="button"
        onClick={handleSubmit}
        style="appearance:none;cursor:pointer;width:100%;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:15px;font:600 15px var(--font-hanken)"
        hover="background:#000"
      >
        {BUY_FLOW_COPY.addFundsCta}
      </Hov>
    </StepCard>
  );
}
