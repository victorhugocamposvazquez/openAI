"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { css } from "@/lib/css";
import {
  BUY_FLOW_COPY,
  formatUserBalance,
  ONRAMP_FIAT,
  USDC_BASE,
} from "@/lib/onramp/constants";
import { openRampFallbackTab } from "@/lib/onramp/ramp-fallback";
import { openRampWidgetA } from "@/lib/onramp/ramp-open";
import { continueToPresale } from "@/lib/onramp/presale";
import { buyFlowReducer, INITIAL_BUY_FLOW } from "@/lib/onramp/types";
import { useUsdcBalance } from "@/hooks/useUsdcBalance";
import { SinWalletStep } from "./steps/SinWalletStep";
import { SinFondosStep } from "./steps/SinFondosStep";
import { EsperandoFondosStep } from "./steps/EsperandoFondosStep";
import { ListoStep } from "./steps/ListoStep";

export default function BuyFlow() {
  const [state, dispatch] = useReducer(buyFlowReducer, INITIAL_BUY_FLOW);
  const { address, isConnected } = useAccount();
  const { data: balanceData, isSuccess } = useUsdcBalance(address);
  const rampCleanupRef = useRef<(() => void) | null>(null);
  const openingRampRef = useRef(false);

  const syncBalance = useCallback(() => {
    if (!isConnected || !address) {
      dispatch({ type: "WALLET_DISCONNECTED" });
      return;
    }
    if (!isSuccess || balanceData === undefined) return;

    const amount = Number(formatUnits(balanceData.value, USDC_BASE.decimals));
    const balanceLabel = formatUserBalance(amount);

    if (amount > 0) {
      if (state.step !== "listo" || state.balanceLabel !== balanceLabel) {
        dispatch({ type: "BALANCE_POSITIVE", balanceLabel });
      }
      return;
    }

    if (state.step === "listo" || state.step === "sin_wallet") {
      dispatch({ type: "WALLET_CONNECTED_ZERO", fiatValue: ONRAMP_FIAT.defaultValue });
    }
  }, [isConnected, address, isSuccess, balanceData, state]);

  useEffect(() => {
    syncBalance();
  }, [syncBalance]);

  const cleanupRamp = useCallback(() => {
    rampCleanupRef.current?.();
    rampCleanupRef.current = null;
  }, []);

  useEffect(() => () => cleanupRamp(), [cleanupRamp]);

  const startViaB = useCallback(
    (fiatValue: string) => {
      if (!address) return;
      const proceed = window.confirm(BUY_FLOW_COPY.fallbackWarning);
      if (!proceed) {
        openingRampRef.current = false;
        return;
      }
      if (process.env.NODE_ENV === "development") {
        console.log("[ramp] vía B — pestaña externa");
      }
      openRampFallbackTab(address, fiatValue);
      dispatch({ type: "START_WAITING", fiatValue, rampVia: "B" });
      openingRampRef.current = false;
    },
    [address]
  );

  const openOnramp = useCallback(
    async (fiatValue: string) => {
      if (!address || openingRampRef.current) return;
      openingRampRef.current = true;
      cleanupRamp();

      const session = await openRampWidgetA(
        { userAddress: address, fiatValue },
        {
          onConfigDone: () => {
            if (process.env.NODE_ENV === "development") {
              console.log("[ramp] vía A — WIDGET_CONFIG_DONE");
            }
            dispatch({ type: "START_WAITING", fiatValue, rampVia: "A" });
            openingRampRef.current = false;
          },
          onPurchaseCreated: () => {
            if (process.env.NODE_ENV === "development") {
              console.log("[ramp] PURCHASE_CREATED");
            }
          },
          onWidgetClose: (hadPurchase) => {
            openingRampRef.current = false;
            if (!hadPurchase) {
              dispatch({ type: "PAYMENT_CANCELLED", message: BUY_FLOW_COPY.paymentCancelled });
            }
          },
          onError: (reason) => {
            if (process.env.NODE_ENV === "development") {
              console.warn("[ramp] fallback por", reason);
            }
            startViaB(fiatValue);
          },
        }
      );

      if (session) rampCleanupRef.current = session.cleanup;
    },
    [address, cleanupRamp, startViaB]
  );

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

      {state.step === "sin_fondos" && (
        <SinFondosStep
          fiatValue={state.fiatValue}
          infoMessage={state.infoMessage}
          onFiatChange={(value) => dispatch({ type: "UPDATE_FIAT", fiatValue: value })}
          onAddFunds={openOnramp}
          onClearInfo={() => dispatch({ type: "CLEAR_INFO" })}
        />
      )}

      {state.step === "esperando_fondos" && (
        <EsperandoFondosStep onRetry={() => openOnramp(state.fiatValue)} />
      )}

      {state.step === "listo" && (
        <ListoStep balanceLabel={state.balanceLabel} onContinue={handleContinue} />
      )}
    </main>
  );
}
