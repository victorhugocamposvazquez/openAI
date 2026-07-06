"use client";

import { useCallback, useEffect, useReducer } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { formatUnits } from "viem";
import { css } from "@/lib/css";
import {
  BUY_FLOW_COPY,
  formatUserBalance,
  FUNDING_MODE,
  ONRAMP_FIAT,
  USDC_BASE,
} from "@/lib/onramp/constants";
import { openRampManualTab } from "@/lib/onramp/ramp-fallback";
import { continueToPresale } from "@/lib/onramp/presale";
import {
  fetchWalletCapabilities,
  runSmartWalletFundingProbe,
} from "@/lib/onramp/smart-wallet-funding";
import { buyFlowReducer, INITIAL_BUY_FLOW } from "@/lib/onramp/types";
import { useUsdcBalance } from "@/hooks/useUsdcBalance";
import { getWalletFundingProfile } from "@/lib/wagmi/wallet-kind";
import { SinWalletStep } from "./steps/SinWalletStep";
import { SinFondosStep } from "./steps/SinFondosStep";
import { EsperandoFondosStep } from "./steps/EsperandoFondosStep";
import { ListoStep } from "./steps/ListoStep";

export default function BuyFlow() {
  const [state, dispatch] = useReducer(buyFlowReducer, INITIAL_BUY_FLOW);
  const { address, isConnected, connector } = useAccount();
  const { data: balanceData, isSuccess } = useUsdcBalance(address);
  const walletProfile = getWalletFundingProfile(connector?.id);

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

  const goToWaiting = useCallback((fiatValue: string) => {
    dispatch({ type: "START_WAITING", fiatValue, rampVia: "B" });
  }, []);

  const handleRampManual = useCallback(() => {
    openRampManualTab();
    goToWaiting(ONRAMP_FIAT.defaultValue);
  }, [goToWaiting]);

  const handleSmartWalletFunding = useCallback(async () => {
    if (!address) return;

    if (!walletProfile.supportsIntegratedFunding) {
      dispatch({
        type: "PAYMENT_CANCELLED",
        message: walletProfile.hint ?? BUY_FLOW_COPY.wrongWalletForFunding,
      });
      return;
    }

    const provider = (await connector?.getProvider()) as
      | { request: (args: { method: string; params?: unknown }) => Promise<unknown> }
      | undefined;

    const capabilities = provider ? await fetchWalletCapabilities(provider, address) : null;

    const result = await runSmartWalletFundingProbe({
      address,
      useSendCalls: true,
      provider,
      capabilities,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[funding] probe", result);
    }

    if (result.outcome === "rejected") {
      dispatch({ type: "PAYMENT_CANCELLED", message: BUY_FLOW_COPY.paymentCancelled });
      return;
    }

    goToWaiting(ONRAMP_FIAT.defaultValue);
  }, [address, connector, walletProfile, goToWaiting]);

  const handleAddFunds = useCallback(async () => {
    if (FUNDING_MODE === "smart_wallet") {
      await handleSmartWalletFunding();
    } else {
      handleRampManual();
    }
  }, [handleSmartWalletFunding, handleRampManual]);

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
          address={address}
          walletProfile={walletProfile}
          infoMessage={state.infoMessage}
          onFiatChange={(value) => dispatch({ type: "UPDATE_FIAT", fiatValue: value })}
          onRampManual={handleRampManual}
          onSmartWalletFunding={handleSmartWalletFunding}
          onClearInfo={() => dispatch({ type: "CLEAR_INFO" })}
        />
      )}

      {state.step === "esperando_fondos" && (
        <EsperandoFondosStep onRetry={handleAddFunds} />
      )}

      {state.step === "listo" && (
        <ListoStep balanceLabel={state.balanceLabel} onContinue={handleContinue} />
      )}
    </main>
  );
}
