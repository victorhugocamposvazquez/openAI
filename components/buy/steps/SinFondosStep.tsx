"use client";

import { css } from "@/lib/css";
import { formatAddress } from "@/lib/wagmi/format-address";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";
import { CopyAddressButton, InfoBanner, StepCard, StepTitle } from "../ui/CopyAddressButton";

type Props = {
  address?: string;
};

export function SinFondosStep({ address }: Props) {
  return (
    <StepCard>
      <StepTitle title={BUY_FLOW_COPY.sinFondosTitle} subtitle={BUY_FLOW_COPY.sinFondosSubtitle} />

      <InfoBanner message={BUY_FLOW_COPY.sinFondosPollingHint} />

      {address ? (
        <div
          style={css(
            "margin:20px 0;padding:16px;border:1px solid #E6E6E8;border-radius:14px;background:#FAFAFA"
          )}
        >
          <p
            style={css(
              "font:600 12px var(--font-hanken);color:#8A8A94;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.04em"
            )}
          >
            {BUY_FLOW_COPY.walletAddressLabel}
          </p>
          <p style={css("font:600 15px var(--font-mono);color:#0D0D0D;margin:0 0 12px;word-break:break-all")}>
            {formatAddress(address, 6)}
          </p>
          <CopyAddressButton value={address} />
        </div>
      ) : null}

      <InfoBanner message={BUY_FLOW_COPY.rampManualNetworkWarning} />

      <div style={css("display:flex;justify-content:center;padding:24px 0 8px")}>
        <div
          style={css(
            "width:40px;height:40px;border:3px solid #ECECEC;border-top-color:#0D0D0D;border-radius:50%;animation:buy-spin 0.9s linear infinite"
          )}
        />
      </div>
      <p style={css("font:400 13px var(--font-hanken);color:#8A8A94;margin:0;text-align:center")}>
        {BUY_FLOW_COPY.checkingBalance}
      </p>
      <style>{`@keyframes buy-spin { to { transform: rotate(360deg); } }`}</style>
    </StepCard>
  );
}
