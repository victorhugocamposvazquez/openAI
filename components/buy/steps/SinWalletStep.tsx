"use client";

import { useState } from "react";
import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { useConnect, type Connector } from "wagmi";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";
import { findCoinbaseWalletConnector, getConnectorId } from "@/lib/wagmi/connectors";
import { mapConnectError } from "@/lib/wagmi/connect-error";
import { WalletPickerModal } from "../ui/WalletPickerModal";
import { StepCard, StepTitle } from "../ui/CopyAddressButton";

const CHAIN_ID = 8453;

export function SinWalletStep() {
  const { connect, connectors, isPending, variables, error } = useConnect();
  const [showPicker, setShowPicker] = useState(false);

  const coinbaseConnector = findCoinbaseWalletConnector(connectors);
  const pendingId = isPending ? getConnectorId(variables?.connector as Connector | undefined) : null;

  const connectFaceId = () => {
    if (!coinbaseConnector || isPending) return;
    connect({ connector: coinbaseConnector, chainId: CHAIN_ID });
  };

  return (
    <>
      {showPicker ? <WalletPickerModal onClose={() => setShowPicker(false)} /> : null}

      <StepCard>
        <StepTitle title={BUY_FLOW_COPY.sinWalletTitle} subtitle={BUY_FLOW_COPY.sinWalletSubtitle} />
        <p style={css("font:400 13px/1.5 var(--font-hanken);color:#8A8A94;margin:0 0 16px")}>
          {BUY_FLOW_COPY.connectDesktopHint}
        </p>

        <div style={css("display:flex;flex-direction:column;gap:10px")}>
          <Hov
            as="button"
            type="button"
            disabled={!coinbaseConnector || isPending}
            onClick={connectFaceId}
            style="appearance:none;cursor:pointer;width:100%;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:15px;font:600 15px var(--font-hanken)"
            hover="background:#000"
          >
            {pendingId === coinbaseConnector?.id ? "Conectando…" : BUY_FLOW_COPY.connectFaceId}
          </Hov>

          <Hov
            as="button"
            type="button"
            disabled={isPending}
            onClick={() => setShowPicker(true)}
            style="appearance:none;cursor:pointer;width:100%;background:#fff;color:#0D0D0D;border:1px solid #E6E6E8;border-radius:12px;padding:14px;font:600 15px var(--font-hanken)"
            hover="border-color:#0D0D0D"
          >
            {BUY_FLOW_COPY.connectExistingWallet}
          </Hov>

          {error ? (
            <p style={css("font:400 13px var(--font-hanken);color:#D14343;margin:0")}>
              {mapConnectError(error)}
            </p>
          ) : null}
        </div>
      </StepCard>
    </>
  );
}
