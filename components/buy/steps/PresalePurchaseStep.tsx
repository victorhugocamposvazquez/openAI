"use client";

import { formatUnits } from "viem";
import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { BUY_FLOW_COPY, OPEN_TOKEN_DECIMALS } from "@/lib/onramp/constants";
import { usePresalePurchase } from "@/hooks/usePresalePurchase";
import { usePresaleOpenQuote } from "@/hooks/usePresaleReads";
import { usePaymentTokenBalances } from "@/hooks/usePaymentTokenBalances";
import { PAYMENT_TOKEN_LIST } from "@/lib/onramp/payment-tokens";
import { InfoBanner, StepCard, StepTitle } from "../ui/CopyAddressButton";

type Props = {
  onBack?: () => void;
};

export function PresalePurchaseStep({ onBack }: Props) {
  const purchase = usePresalePurchase();
  const balances = usePaymentTokenBalances();
  const { data: openAmount } = usePresaleOpenQuote(purchase.openQuoteAmount);

  const isRunning = purchase.state.phase === "awaiting_wallet" || purchase.state.phase === "confirming";

  const openEstimate =
    openAmount !== undefined
      ? `${Number(formatUnits(openAmount, OPEN_TOKEN_DECIMALS)).toLocaleString("es-ES", { maximumFractionDigits: 4 })} OPEN`
      : purchase.quoteLoading
        ? "Calculando…"
        : "—";

  const showQuoteFallback = purchase.quoteFailed || purchase.quoteFallback;

  // Durante la ejecución usamos las etiquetas reales (con allowances frescas);
  // en reposo, la estimación previa.
  const stepperLabels =
    purchase.state.phase !== "idle" && purchase.state.stepLabels.length > 0
      ? purchase.state.stepLabels
      : purchase.stepLabels;

  return (
    <StepCard>
      <StepTitle title={BUY_FLOW_COPY.compraTitle} subtitle={BUY_FLOW_COPY.compraSubtitle} />

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

      <label style={css("display:block;font:600 13px var(--font-hanken);color:#5C5C66;margin-bottom:8px")}>
        {BUY_FLOW_COPY.compraAmountLabel} ({purchase.paymentToken.symbol})
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={purchase.amountInput}
        onChange={(e) => purchase.setAmountInput(e.target.value)}
        disabled={isRunning}
        style={css(
          "width:100%;box-sizing:border-box;padding:12px 14px;border:1px solid #E6E6E8;border-radius:12px;font:500 15px var(--font-mono);margin-bottom:12px"
        )}
      />

      <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px")}>
        <Stat label={BUY_FLOW_COPY.compraBalance} value={balances[purchase.paymentTokenId].formatted} />
        <Stat label={BUY_FLOW_COPY.compraEstimatedOpen} value={openEstimate} />
      </div>

      {purchase.paymentTokenId !== "USDC" && !showQuoteFallback ? (
        <p style={css("font:400 12px var(--font-hanken);color:#8A8A94;margin:0 0 16px")}>
          {BUY_FLOW_COPY.compraQuoteRefreshing}
          {purchase.quote?.minBuyAmount
            ? ` · Mín. USDC: ${(Number(purchase.quote.minBuyAmount) / 1e6).toLocaleString("es-ES", { maximumFractionDigits: 2 })}`
            : ""}
        </p>
      ) : null}

      {purchase.isExpired && !isRunning ? (
        <div style={css("margin-bottom:16px")}>
          <InfoBanner message={BUY_FLOW_COPY.compraQuoteExpired} />
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

      <div style={css("margin-bottom:16px")}>
        <p style={css("font:600 12px var(--font-hanken);color:#8A8A94;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.04em")}>
          Modo de ejecución
        </p>
        <p style={css("font:400 13px var(--font-hanken);color:#5C5C66;margin:0")}>
          {purchase.capsLoading
            ? "Consultando capacidades de la wallet…"
            : purchase.paymentTokenId !== "USDC" && purchase.supportsBatch
              ? "Smart Wallet — conversión y compra en una sola firma."
              : purchase.paymentTokenId !== "USDC" && purchase.flowPhase === "convert"
                ? "Primero convierte a USDC (2 confirmaciones), luego compra OPEN."
                : purchase.supportsBatch
                  ? "Batching atómico — una sola firma."
                  : "Pasos secuenciales con confirmación entre cada uno."}
        </p>
      </div>

      {stepperLabels.length > 0 ? (
        <ol style={css("margin:0 0 16px;padding:0;list-style:none")}>
          {stepperLabels.map((label, index) => {
            const active = purchase.state.phase !== "idle" && index === purchase.state.stepIndex;
            const done =
              purchase.state.phase === "done" ||
              (purchase.state.phase !== "idle" && index < purchase.state.stepIndex);
            return (
              <li
                key={label}
                style={css(
                  `display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #F0F0F2;font:500 14px var(--font-hanken);color:${done ? "#8A8A94" : active ? "#0D0D0D" : "#5C5C66"}`
                )}
              >
                <span
                  style={css(
                    `width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font:600 11px var(--font-hanken);background:${done ? "#0D0D0D" : active ? "#0D0D0D" : "#F2F2F3"};color:${done || active ? "#fff" : "#8A8A94"}`
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

      {purchase.state.phase === "done" ? (
        <div style={css("margin-bottom:16px")}>
          <InfoBanner message={`${BUY_FLOW_COPY.compraDoneTitle}. ${BUY_FLOW_COPY.compraDoneSubtitle}`} />
          {purchase.state.txHash ? (
            <a
              href={`https://basescan.org/tx/${purchase.state.txHash}`}
              target="_blank"
              rel="noreferrer"
              style={css("display:inline-block;margin-top:10px;font:600 13px var(--font-hanken);color:#0D0D0D;text-decoration:underline")}
            >
              {BUY_FLOW_COPY.compraViewTx}
            </a>
          ) : null}
        </div>
      ) : null}

      {purchase.state.error ? (
        <p style={css("font:500 13px var(--font-hanken);color:#D14343;margin:0 0 12px")}>{purchase.state.error}</p>
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
      ) : (
        <Hov
          as="button"
          type="button"
          disabled={!purchase.canPurchase || isRunning || (purchase.isExpired && purchase.paymentTokenId !== "USDC")}
          onClick={() => purchase.startPurchase()}
          style="appearance:none;cursor:pointer;width:100%;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:15px;font:600 15px var(--font-hanken)"
          hover="background:#000"
        >
          {isRunning ? purchase.state.currentLabel : purchase.primaryCta}
        </Hov>
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
