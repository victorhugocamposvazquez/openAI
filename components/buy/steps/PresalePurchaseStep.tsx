"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatUnits, parseUnits } from "viem";
import { QRCodeSVG } from "qrcode.react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { LegalConsent } from "@/components/LegalConsent";
import { useApp } from "@/lib/store";
import { BUY_FLOW_COPY, OPEN_TOKEN_DECIMALS, USDC_BASE } from "@/lib/onramp/constants";
import { usePresalePurchase } from "@/hooks/usePresalePurchase";
import { usePresaleOpenQuote } from "@/hooks/usePresaleReads";
import { usePaymentTokenBalances } from "@/hooks/usePaymentTokenBalances";
import { PAYMENT_TOKEN_LIST, type PaymentTokenId } from "@/lib/onramp/payment-tokens";
import { CopyAddressButton, InfoBanner, StepCard, StepTitle } from "../ui/CopyAddressButton";
import { BaseChainGuard } from "../ui/BaseChainGuard";
import { CrossChainFundingStep } from "./CrossChainFundingStep";

type Props = {
  onBack?: () => void;
};

type FundingMode = "base" | "bridge" | "receive";

/** Importes rápidos por token (los estables en unidades ~USD). */
const QUICK_AMOUNTS: Record<PaymentTokenId, number[]> = {
  USDC: [100, 500, 1000, 5000, 10000, 20000],
  ETH: [0.05, 0.1, 0.5, 1, 2, 5],
  WETH: [0.05, 0.1, 0.5, 1, 2, 5],
  CBBTC: [0.001, 0.005, 0.01, 0.05, 0.1, 0.25],
};

/** Margen de gas al usar MÁX con ETH nativo. */
const NATIVE_GAS_MARGIN = parseUnits("0.0015", 18);

export function PresalePurchaseStep({ onBack }: Props) {
  const { address } = useAccount();
  const router = useRouter();
  const app = useApp();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<FundingMode>("base");
  const [legalAccepted, setLegalAccepted] = useState(false);
  const purchase = usePresalePurchase();
  const balances = usePaymentTokenBalances();
  const { data: openAmount } = usePresaleOpenQuote(purchase.openQuoteAmount);

  const handleBridgeDelivered = () => {
    // El USDC ya está en Base: refrescamos saldos y volvemos a la pestaña
    // de compra con USDC preseleccionado.
    void queryClient.invalidateQueries();
    purchase.setPaymentToken("USDC");
    setMode("base");
    app.toastMsg(BUY_FLOW_COPY.bridgeDelivered);
  };

  const isRunning = purchase.state.phase === "awaiting_wallet" || purchase.state.phase === "confirming";
  const isDone = purchase.state.phase === "done";

  const openEstimate =
    openAmount !== undefined
      ? `${Number(formatUnits(openAmount, OPEN_TOKEN_DECIMALS)).toLocaleString("es-ES", { maximumFractionDigits: 4 })} OPEN`
      : purchase.quoteLoading
        ? "Calculando…"
        : "—";

  // Equivalencia en USD del importe introducido (USDC ≈ USD; resto vía quote).
  const usdEstimate = (() => {
    if (purchase.paymentTokenId === "USDC") return undefined;
    const min = purchase.minBuyAmount;
    if (min === undefined) return undefined;
    return Number(formatUnits(min, USDC_BASE.decimals)).toLocaleString("es-ES", {
      maximumFractionDigits: 2,
    });
  })();

  const showQuoteFallback = purchase.quoteFailed || purchase.quoteFallback;
  const usesQuote = purchase.paymentTokenId !== "USDC" && !showQuoteFallback;

  const handleMax = () => {
    const raw = purchase.sellBalance;
    if (raw === undefined) return;
    const token = purchase.paymentToken;
    const usable = token.isNative ? (raw > NATIVE_GAS_MARGIN ? raw - NATIVE_GAS_MARGIN : 0n) : raw;
    purchase.setAmountInput(formatUnits(usable, token.decimals));
  };

  // Durante la ejecución usamos las etiquetas reales (con allowances frescas);
  // en reposo, la estimación previa.
  const stepperLabels =
    purchase.state.phase !== "idle" && purchase.state.stepLabels.length > 0
      ? purchase.state.stepLabels
      : purchase.stepLabels;

  return (
    <StepCard>
      <StepTitle title={BUY_FLOW_COPY.compraTitle} subtitle={BUY_FLOW_COPY.compraSubtitle} />

      <div style={css("display:flex;gap:8px;margin-bottom:20px")}>
        <ModeTab active={mode === "base"} label={BUY_FLOW_COPY.bridgeTabBase} onClick={() => setMode("base")} />
        <ModeTab active={mode === "bridge"} label={BUY_FLOW_COPY.bridgeTabOther} onClick={() => setMode("bridge")} />
        <ModeTab active={mode === "receive"} label={BUY_FLOW_COPY.bridgeTabReceive} onClick={() => setMode("receive")} />
      </div>

      {mode === "bridge" ? (
        <CrossChainFundingStep recipient={address} onDelivered={handleBridgeDelivered} />
      ) : mode === "receive" ? (
        <ReceiveUsdcPanel address={address} usdcBalance={balances.USDC.formatted} />
      ) : (
      <BaseChainGuard inline>
      <div>
      <p style={css("font:600 12px var(--font-hanken);color:#8A8A94;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.04em")}>
        {BUY_FLOW_COPY.compraPayWith}
      </p>
      <div style={css("display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px")}>
        {PAYMENT_TOKEN_LIST.map((token) => (
          <TokenChip
            key={token.id}
            active={purchase.paymentTokenId === token.id}
            label={token.symbol}
            balance={balances[token.id].formatted}
            onClick={() => purchase.setPaymentToken(token.id)}
          />
        ))}
      </div>

      <div style={css("display:flex;justify-content:space-between;align-items:center;margin-bottom:8px")}>
        <label style={css("font:600 13px var(--font-hanken);color:#5C5C66")}>
          {BUY_FLOW_COPY.compraAmountLabel} ({purchase.paymentToken.symbol})
        </label>
        <button
          type="button"
          onClick={handleMax}
          disabled={isRunning || purchase.sellBalance === undefined}
          style={css(
            "appearance:none;cursor:pointer;border:none;background:none;font:700 12px var(--font-mono);color:var(--accent,#0E8C6A);padding:2px 4px"
          )}
        >
          {BUY_FLOW_COPY.compraMaxCta}
        </button>
      </div>
      <input
        type="text"
        inputMode="decimal"
        value={purchase.amountInput}
        onChange={(e) => purchase.setAmountInput(e.target.value)}
        disabled={isRunning}
        style={css(
          "width:100%;box-sizing:border-box;padding:12px 14px;border:1px solid #E6E6E8;border-radius:12px;font:500 15px var(--font-mono);margin-bottom:8px"
        )}
      />
      {usdEstimate ? (
        <p style={css("font:400 12px var(--font-mono);color:#8A8A94;margin:0 0 10px")}>
          {BUY_FLOW_COPY.compraUsdEstimate(usdEstimate)}
        </p>
      ) : (
        <div style={css("height:10px")} />
      )}

      <div style={css("display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px")}>
        {QUICK_AMOUNTS[purchase.paymentTokenId].map((v) => (
          <Hov
            key={v}
            as="button"
            type="button"
            disabled={isRunning}
            onClick={() => purchase.setAmountInput(String(v))}
            style="appearance:none;cursor:pointer;background:#fff;border:1px solid #E6E6E8;border-radius:999px;padding:7px 12px;font:500 12px var(--font-mono);color:#5C5C66"
            hover="border-color:#0D0D0D;color:#0D0D0D"
          >
            {v.toLocaleString("es-ES")}
          </Hov>
        ))}
      </div>

      <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px")}>
        <Stat label={BUY_FLOW_COPY.compraBalance} value={balances[purchase.paymentTokenId].formatted} />
        <Stat label={BUY_FLOW_COPY.compraEstimatedOpen} value={openEstimate} />
      </div>

      {usesQuote && purchase.quote && !isRunning && !isDone ? (
        <div style={css("display:flex;align-items:center;gap:10px;margin:0 0 16px")}>
          <span style={css("font:400 12px var(--font-mono);color:#8A8A94")}>
            {purchase.isExpired
              ? BUY_FLOW_COPY.compraQuoteExpired
              : BUY_FLOW_COPY.compraQuoteValidFor(purchase.expiresInSec)}
          </span>
          {purchase.isExpired ? (
            <button
              type="button"
              onClick={() => void purchase.refetchQuote()}
              style={css(
                "appearance:none;cursor:pointer;border:none;background:none;font:600 12px var(--font-hanken);color:#0D0D0D;text-decoration:underline;padding:0"
              )}
            >
              {BUY_FLOW_COPY.compraQuoteRefreshCta}
            </button>
          ) : null}
        </div>
      ) : null}

      {showQuoteFallback && purchase.paymentTokenId !== "USDC" ? (
        <div style={css("margin-bottom:16px")}>
          <InfoBanner message={BUY_FLOW_COPY.compraQuoteFallback} />
        </div>
      ) : null}

      {purchase.flowPhase === "purchase_after_convert" ? (
        <div style={css("margin-bottom:16px")}>
          <InfoBanner message={BUY_FLOW_COPY.compraConvertDone} />
        </div>
      ) : null}

      {!isDone ? (
        <p style={css("font:400 13px var(--font-hanken);color:#5C5C66;margin:0 0 16px")}>
          {purchase.capsLoading
            ? BUY_FLOW_COPY.compraModeChecking
            : stepperLabels.length <= 1
              ? BUY_FLOW_COPY.compraModeOneSignature
              : BUY_FLOW_COPY.compraModeSteps(stepperLabels.length)}
        </p>
      ) : null}

      {!isDone && stepperLabels.length > 1 ? (
        <ol style={css("margin:0 0 16px;padding:0;list-style:none")}>
          {stepperLabels.map((label, index) => {
            const active = purchase.state.phase !== "idle" && index === purchase.state.stepIndex;
            const done = purchase.state.phase !== "idle" && index < purchase.state.stepIndex;
            return (
              <li
                key={`${index}-${label}`}
                style={css(
                  `display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #F0F0F2;font:500 14px var(--font-hanken);color:${done ? "#8A8A94" : active ? "#0D0D0D" : "#5C5C66"}`
                )}
              >
                <span
                  style={css(
                    `width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font:600 11px var(--font-hanken);background:${done || active ? "#0D0D0D" : "#F2F2F3"};color:${done || active ? "#fff" : "#8A8A94"}`
                  )}
                >
                  {done ? "✓" : index + 1}
                </span>
                {label}
              </li>
            );
          })}
        </ol>
      ) : null}

      {purchase.state.phase === "awaiting_wallet" && purchase.isWalletConnect ? (
        <div style={css("margin-bottom:16px")}>
          <InfoBanner message={BUY_FLOW_COPY.confirmInWalletApp} />
          <p style={css("font:400 12px var(--font-hanken);color:#8A8A94;margin:8px 0 0")}>
            {BUY_FLOW_COPY.confirmInWalletAppHint}
          </p>
        </div>
      ) : null}

      {purchase.state.phase === "confirming" ? (
        <div style={css("display:flex;align-items:center;gap:10px;margin-bottom:16px")}>
          <div
            style={css(
              "width:20px;height:20px;border:2px solid #ECECEC;border-top-color:#0D0D0D;border-radius:50%;animation:buy-spin 0.9s linear infinite"
            )}
          />
          <span style={css("font:400 13px var(--font-hanken);color:#5C5C66")}>
            {BUY_FLOW_COPY.compraWaitingConfirm}
          </span>
        </div>
      ) : null}

      {isDone ? (
        <div style={css("text-align:center;padding:8px 0 4px")}>
          <span
            style={css(
              "width:56px;height:56px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:14px;background:color-mix(in srgb, var(--accent, #0E8C6A) 13%, #fff);color:var(--accent,#0E8C6A)"
            )}
          >
            ✓
          </span>
          <h3 style={css("font:700 20px var(--font-hanken);color:#0D0D0D;margin:0 0 6px")}>
            {BUY_FLOW_COPY.compraDoneTitle}
          </h3>
          <p style={css("font:400 14px/1.5 var(--font-hanken);color:#5C5C66;margin:0 0 4px")}>
            {BUY_FLOW_COPY.compraDoneSubtitle}
          </p>
          {purchase.state.txHash ? (
            <a
              href={`https://basescan.org/tx/${purchase.state.txHash}`}
              target="_blank"
              rel="noreferrer"
              style={css("display:inline-block;margin:6px 0 16px;font:600 13px var(--font-hanken);color:#0D0D0D;text-decoration:underline")}
            >
              {BUY_FLOW_COPY.compraViewTx}
            </a>
          ) : (
            <div style={css("height:16px")} />
          )}
          <div style={css("display:flex;gap:10px")}>
            <Hov
              as="button"
              type="button"
              onClick={() => router.push("/cartera")}
              style="appearance:none;cursor:pointer;flex:1;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:14px;font:600 14px var(--font-hanken)"
              hover="background:#000"
            >
              {BUY_FLOW_COPY.compraDoneViewPortfolio}
            </Hov>
            <Hov
              as="button"
              type="button"
              onClick={purchase.reset}
              style="appearance:none;cursor:pointer;flex:1;background:#fff;color:#0D0D0D;border:1px solid #E6E6E8;border-radius:12px;padding:14px;font:600 14px var(--font-hanken)"
              hover="border-color:#0D0D0D"
            >
              {BUY_FLOW_COPY.compraDoneBuyMore}
            </Hov>
          </div>
        </div>
      ) : null}

      {purchase.state.error ? (
        <p style={css("font:500 13px var(--font-hanken);color:#D14343;margin:0 0 12px")}>{purchase.state.error}</p>
      ) : null}

      {!isDone && purchase.state.phase !== "error" && !isRunning ? (
        <div style={css("margin-bottom:14px")}>
          <LegalConsent checked={legalAccepted} onChange={setLegalAccepted} />
        </div>
      ) : null}

      {purchase.state.phase === "error" ? (
        <Hov
          as="button"
          type="button"
          onClick={purchase.retry}
          style="appearance:none;cursor:pointer;width:100%;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:15px;font:600 15px var(--font-hanken)"
          hover="background:#000"
        >
          {BUY_FLOW_COPY.compraRetryCta}
        </Hov>
      ) : !isDone ? (
        <Hov
          as="button"
          type="button"
          disabled={!legalAccepted || !purchase.canPurchase || isRunning || (purchase.isExpired && purchase.paymentTokenId !== "USDC")}
          onClick={() => purchase.startPurchase()}
          style="appearance:none;cursor:pointer;width:100%;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:15px;font:600 15px var(--font-hanken)"
          hover="background:#000"
        >
          {isRunning ? purchase.state.currentLabel : purchase.primaryCta}
        </Hov>
      ) : null}
      </div>
      </BaseChainGuard>
      )}

      {onBack ? (
        <Hov
          as="button"
          type="button"
          disabled={isRunning}
          onClick={onBack}
          style="appearance:none;cursor:pointer;width:100%;margin-top:10px;background:transparent;color:#5C5C66;border:1px solid #E6E6E8;border-radius:12px;padding:13px;font:600 14px var(--font-hanken)"
          hover="border-color:#0D0D0D;color:#0D0D0D"
        >
          {BUY_FLOW_COPY.compraBackCta}
        </Hov>
      ) : null}

      <style>{`@keyframes buy-spin { to { transform: rotate(360deg); } }`}</style>
    </StepCard>
  );
}

function ReceiveUsdcPanel({ address, usdcBalance }: { address?: `0x${string}`; usdcBalance: string }) {
  if (!address) return null;
  return (
    <div>
      <p style={css("font:400 14px/1.5 var(--font-hanken);color:#8A8A94;margin:0 0 16px")}>
        {BUY_FLOW_COPY.receiveSubtitle}
      </p>

      <div style={css("margin-bottom:16px")}>
        <InfoBanner message={BUY_FLOW_COPY.rampManualNetworkWarning} />
      </div>

      <div style={css("padding:18px;border:1px solid #ECECEC;border-radius:14px;background:#FAFAFA;text-align:center;margin-bottom:16px")}>
        <div style={css("display:flex;justify-content:center;margin-bottom:14px")}>
          <QRCodeSVG value={address} size={148} />
        </div>
        <p style={css("font:600 11px var(--font-hanken);color:#8A8A94;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.04em")}>
          {BUY_FLOW_COPY.walletAddressLabel}
        </p>
        <p style={css("font:500 13px var(--font-mono);color:#0D0D0D;margin:0 0 12px;word-break:break-all")}>{address}</p>
        <CopyAddressButton value={address} />
      </div>

      <div style={css("display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border:1px solid #ECECEC;border-radius:12px;background:#fff")}>
        <span style={css("font:600 12px var(--font-hanken);color:#8A8A94")}>{BUY_FLOW_COPY.receiveCurrentBalance}</span>
        <span style={css("font:600 14px var(--font-mono);color:#0D0D0D")}>{usdcBalance}</span>
      </div>
      <p style={css("font:400 12px/1.5 var(--font-hanken);color:#8A8A94;margin:10px 0 0")}>
        {BUY_FLOW_COPY.sinFondosPollingHint}
      </p>
    </div>
  );
}

function ModeTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <Hov
      as="button"
      type="button"
      onClick={onClick}
      style={
        active
          ? "appearance:none;cursor:pointer;flex:1;padding:11px 8px;border-radius:12px;border:1px solid #0D0D0D;background:#0D0D0D;color:#fff;font:600 13px var(--font-hanken)"
          : "appearance:none;cursor:pointer;flex:1;padding:11px 8px;border-radius:12px;border:1px solid #E6E6E8;background:#fff;color:#5C5C66;font:600 13px var(--font-hanken)"
      }
      hover={active ? undefined : "border-color:#0D0D0D"}
    >
      {label}
    </Hov>
  );
}

function TokenChip({
  active,
  label,
  balance,
  onClick,
}: {
  active: boolean;
  label: string;
  balance: string;
  onClick: () => void;
}) {
  return (
    <Hov
      as="button"
      type="button"
      onClick={onClick}
      style={
        active
          ? "appearance:none;cursor:pointer;padding:10px 12px;border-radius:12px;border:1px solid #0D0D0D;background:#0D0D0D;color:#fff;font:600 12px var(--font-hanken);text-align:left;min-width:88px"
          : "appearance:none;cursor:pointer;padding:10px 12px;border-radius:12px;border:1px solid #E6E6E8;background:#fff;color:#5C5C66;font:600 12px var(--font-hanken);text-align:left;min-width:88px"
      }
      hover={active ? undefined : "border-color:#0D0D0D"}
    >
      <span style={css("display:block")}>{label}</span>
      <span style={css(`display:block;font:400 11px var(--font-mono);margin-top:4px;color:${active ? "#D8D8DC" : "#8A8A94"}`)}>
        {balance}
      </span>
    </Hov>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={css("padding:12px 14px;border:1px solid #ECECEC;border-radius:12px;background:#FAFAFA")}>
      <p style={css("font:600 11px var(--font-hanken);color:#8A8A94;margin:0 0 4px")}>{label}</p>
      <p style={css("font:600 14px var(--font-mono);color:#0D0D0D;margin:0")}>{value}</p>
    </div>
  );
}
