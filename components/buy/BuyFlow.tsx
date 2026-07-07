"use client";

import { useCallback, useEffect, useReducer } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { css } from "@/lib/css";
import { BUY_FLOW_COPY, formatUsdcBalance, USDC_BASE } from "@/lib/onramp/constants";
import { continueToPresale } from "@/lib/onramp/presale";
import { buyFlowReducer, INITIAL_BUY_FLOW } from "@/lib/onramp/types";
import { useUsdcBalance } from "@/hooks/useUsdcBalance";
import { SinWalletStep } from "./steps/SinWalletStep";
import { SinFondosStep } from "./steps/SinFondosStep";
import { ListoStep } from "./steps/ListoStep";

export default function BuyFlow() {
  const [state, dispatch] = useReducer(buyFlowReducer, INITIAL_BUY_FLOW);
  const { address, isConnected } = useAccount();
  const { data: balanceData, isSuccess } = useUsdcBalance(address);

  const syncBalance = useCallback(() => {
    if (!isConnected || !address) {
      dispatch({ type: "WALLET_DISCONNECTED" });
      return;
    }
    if (!isSuccess || balanceData === undefined) return;

    const amount = Number(formatUnits(balanceData.value, USDC_BASE.decimals));
    const balanceLabel = formatUsdcBalance(amount);

    if (amount > 0) {
      if (state.step !== "listo" || state.balanceLabel !== balanceLabel) {
        dispatch({ type: "BALANCE_POSITIVE", balanceLabel });
      }
      return;
    }

    if (state.step === "listo" || state.step === "sin_wallet" || state.step === "esperando_fondos") {
      dispatch({ type: "WALLET_CONNECTED_ZERO", fiatValue: "" });
    }
  }, [isConnected, address, isSuccess, balanceData, state]);

  useEffect(() => {
    syncBalance();
  }, [syncBalance]);

  const handleContinue = () => {
    if (!address || state.step !== "listo") return;
    continueToPresale({ address, balanceLabel: state.balanceLabel });
  };

  return (
    <main style={css("max-width:1200px;margin:0 auto;padding:48px 24px 120px")}>
      <div style={css("text-align:center;margin-bottom:32px")}>
        <h2 style={css("font:700 34px/1.1 var(--font-hanken);letter-spacing:-0.04em;color:#0D0D0D;margin:0 0 10px")}>
          {BUY_FLOW_COPY.pageTitle}
        </h2>
        <p style={css("font:400 15px/1.5 var(--font-hanken);color:#8A8A94;margin:0")}>{BUY_FLOW_COPY.pageSubtitle}</p>
      </div>

      {state.step === "sin_wallet" && <SinWalletStep />}

      {state.step === "sin_fondos" && <SinFondosStep address={address} />}

      {state.step === "esperando_fondos" && <SinFondosStep address={address} />}

      {state.step === "listo" && (
        <ListoStep balanceLabel={state.balanceLabel} onContinue={handleContinue} />
      )}
    </main>
  );
}
