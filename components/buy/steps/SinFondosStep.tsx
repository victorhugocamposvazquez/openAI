"use client";

import { useState } from "react";
import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { LegalConsent } from "@/components/LegalConsent";
import { formatAddress } from "@/lib/wagmi/format-address";
import {
  BUY_FLOW_COPY,
  FUNDING_MODE,
} from "@/lib/onramp/constants";
import type { WalletFundingProfile } from "@/lib/wagmi/wallet-kind";
import { CopyAddressButton, InfoBanner, StepCard, StepTitle } from "../ui/CopyAddressButton";

type Props = {
  fiatValue: string;
  address?: string;
  walletProfile: WalletFundingProfile;
  infoMessage?: string;
  onFiatChange: (value: string) => void;
  onRampManual: () => void;
  onSmartWalletFunding: () => void;
  onClearInfo: () => void;
};

function RampManualVariant({
  address,
  infoMessage,
  onRampManual,
}: {
  address?: string;
  infoMessage?: string;
  onRampManual: () => void;
}) {
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const handleOpen = () => {
    if (!consent) {
      setError(BUY_FLOW_COPY.consentRequired);
      return;
    }
    if (!address) {
      setError("Conecta tu wallet antes de continuar.");
      return;
    }
    setError(null);
    setShowSteps(true);
  };

  const handleConfirmOpen = () => {
    onRampManual();
  };

  return (
    <>
      <StepTitle title={BUY_FLOW_COPY.sinFondosTitle} subtitle={BUY_FLOW_COPY.sinFondosSubtitle} />
      {infoMessage ? (
        <div style={css("margin-bottom:16px")}>
          <InfoBanner message={infoMessage} />
        </div>
      ) : null}

      {!showSteps ? (
        <>
          <div style={css("margin-bottom:20px")}>
            <LegalConsent checked={consent} onChange={setConsent} />
          </div>
          {error ? (
            <p style={css("font:500 13px var(--font-hanken);color:#D14343;margin:0 0 12px")}>{error}</p>
          ) : null}
          <Hov
            as="button"
            type="button"
            onClick={handleOpen}
            style="appearance:none;cursor:pointer;width:100%;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:15px;font:600 15px var(--font-hanken)"
            hover="background:#000"
          >
            {BUY_FLOW_COPY.rampManualOpenCta}
          </Hov>
        </>
      ) : (
        <div style={css("display:flex;flex-direction:column;gap:16px")}>
          <InfoBanner message={BUY_FLOW_COPY.rampManualBeforeOpen} />

          <ol style={css("margin:0;padding:0 0 0 20px;font:400 14px/1.6 var(--font-hanken);color:#5C5C66")}>
            {BUY_FLOW_COPY.rampManualSteps.map((step) => (
              <li key={step} style={css("margin-bottom:6px")}>
                {step}
              </li>
            ))}
          </ol>

          {address ? (
            <div style={css("padding:16px;border:1px solid #E6E6E8;border-radius:14px;background:#FAFAFA")}>
              <p style={css("font:600 12px var(--font-hanken);color:#8A8A94;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.04em")}>
                {BUY_FLOW_COPY.rampManualAddressLabel}
              </p>
              <p style={css("font:600 15px var(--font-mono);color:#0D0D0D;margin:0 0 12px;word-break:break-all")}>
                {formatAddress(address, 6)}
              </p>
              <CopyAddressButton value={address} />
            </div>
          ) : null}

          <InfoBanner message={BUY_FLOW_COPY.rampManualNetworkWarning} />

          <Hov
            as="button"
            type="button"
            onClick={handleConfirmOpen}
            style="appearance:none;cursor:pointer;width:100%;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:15px;font:600 15px var(--font-hanken)"
            hover="background:#000"
          >
            {BUY_FLOW_COPY.rampManualOpenCta}
          </Hov>
        </div>
      )}
    </>
  );
}

function SmartWalletVariant({
  walletProfile,
  infoMessage,
  onSmartWalletFunding,
}: {
  walletProfile: WalletFundingProfile;
  infoMessage?: string;
  onSmartWalletFunding: () => void;
}) {
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async () => {
    if (!consent) {
      setError(BUY_FLOW_COPY.consentRequired);
      return;
    }
    setError(null);
    setPending(true);
    try {
      await onSmartWalletFunding();
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <StepTitle title={BUY_FLOW_COPY.sinFondosTitle} subtitle={BUY_FLOW_COPY.sinFondosSmartSubtitle} />
      {infoMessage ? (
        <div style={css("margin-bottom:16px")}>
          <InfoBanner message={infoMessage} />
        </div>
      ) : null}

      {!walletProfile.supportsIntegratedFunding && walletProfile.hint ? (
        <div style={css("margin-bottom:16px")}>
          <InfoBanner message={walletProfile.hint} />
        </div>
      ) : null}

      <p style={css("font:400 13px var(--font-hanken);color:#8A8A94;margin:0 0 16px")}>
        Conectado: <strong>{walletProfile.label}</strong>
      </p>

      <div style={css("margin-bottom:20px")}>
        <LegalConsent checked={consent} onChange={setConsent} />
      </div>

      {error ? (
        <p style={css("font:500 13px var(--font-hanken);color:#D14343;margin:0 0 12px")}>{error}</p>
      ) : null}

      <Hov
        as="button"
        type="button"
        disabled={pending || !walletProfile.supportsIntegratedFunding}
        onClick={handleSubmit}
        style="appearance:none;cursor:pointer;width:100%;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:15px;font:600 15px var(--font-hanken)"
        hover="background:#000"
      >
        {pending ? "Solicitando…" : BUY_FLOW_COPY.smartWalletFundsCta}
      </Hov>
    </>
  );
}

export function SinFondosStep({
  fiatValue,
  address,
  walletProfile,
  infoMessage,
  onFiatChange,
  onRampManual,
  onSmartWalletFunding,
  onClearInfo,
}: Props) {
  void fiatValue;
  void onFiatChange;
  void onClearInfo;

  return (
    <StepCard>
      {FUNDING_MODE === "ramp_manual" ? (
        <RampManualVariant address={address} infoMessage={infoMessage} onRampManual={onRampManual} />
      ) : (
        <SmartWalletVariant
          walletProfile={walletProfile}
          infoMessage={infoMessage}
          onSmartWalletFunding={onSmartWalletFunding}
        />
      )}
    </StepCard>
  );
}
