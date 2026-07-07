"use client";

import { useAccount } from "wagmi";
import { css } from "@/lib/css";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";
import { formatAddress } from "@/lib/wagmi/format-address";
import { useWalletDisconnect } from "@/hooks/useWalletDisconnect";
import { SinWalletStep } from "./steps/SinWalletStep";
import { PresalePurchaseStep } from "./steps/PresalePurchaseStep";

export default function BuyFlow() {
  const { address, isConnected } = useAccount();
  const disconnectWallet = useWalletDisconnect();

  return (
    <main style={css("max-width:1200px;margin:0 auto;padding:48px 24px 120px")}>
      <div style={css("text-align:center;margin-bottom:24px")}>
        <h2 style={css("font:700 34px/1.1 var(--font-hanken);letter-spacing:-0.04em;color:#0D0D0D;margin:0 0 10px")}>
          {BUY_FLOW_COPY.pageTitle}
        </h2>
        <p style={css("font:400 15px/1.5 var(--font-hanken);color:#8A8A94;margin:0")}>{BUY_FLOW_COPY.pageSubtitle}</p>
      </div>

      {isConnected && address ? (
        <>
          <div style={css("display:flex;justify-content:center;margin-bottom:20px")}>
            <div
              style={css(
                "display:inline-flex;align-items:center;gap:10px;padding:7px 8px 7px 14px;border:1px solid #ECECEC;background:#fff;border-radius:999px"
              )}
            >
              <span style={css("width:7px;height:7px;border-radius:50%;background:var(--accent,#0E8C6A)")} />
              <span style={css("font:500 13px var(--font-mono);color:#0D0D0D")}>{formatAddress(address)}</span>
              <button
                type="button"
                onClick={disconnectWallet}
                style={css(
                  "appearance:none;cursor:pointer;border:none;background:#F4F4F5;border-radius:999px;padding:5px 10px;font:600 12px var(--font-hanken);color:#5C5C66"
                )}
              >
                {BUY_FLOW_COPY.walletChangeCta}
              </button>
            </div>
          </div>
          <PresalePurchaseStep />
        </>
      ) : (
        <SinWalletStep />
      )}
    </main>
  );
}
