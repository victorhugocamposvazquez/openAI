"use client";

import { useMemo, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { QRCodeSVG } from "qrcode.react";
import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useBridgeQuote } from "@/hooks/useBridgeQuote";
import { useBridgeExecution } from "@/hooks/useBridgeExecution";
import {
  BRIDGE_ORIGINS,
  RELAY_BITCOIN_CHAIN_ID,
  type BridgeOrigin,
  type BridgeQuoteResponse,
} from "@/lib/bridge/relay";
import { CopyAddressButton, InfoBanner } from "../ui/CopyAddressButton";

type Props = {
  /** Dirección del usuario en Base que recibirá el USDC. */
  recipient?: `0x${string}`;
  /** Se invoca cuando el USDC llega a Base. */
  onDelivered?: () => void;
};

export function CrossChainFundingStep({ recipient, onDelivered }: Props) {
  const [originId, setOriginId] = useState(BRIDGE_ORIGINS[0]!.id);
  const origin = BRIDGE_ORIGINS.find((o) => o.id === originId)!;

  const [tokenCurrency, setTokenCurrency] = useState(origin.tokens[0]!.currency);
  const token =
    origin.tokens.find((t) => t.currency === tokenCurrency) ?? origin.tokens[0]!;

  const [amountInput, setAmountInput] = useState("");
  const debouncedInput = useDebouncedValue(amountInput, 500);

  const amount = useMemo(() => {
    const normalized = debouncedInput.trim().replace(",", ".");
    const n = Number(normalized);
    if (!normalized || Number.isNaN(n) || n <= 0) return undefined;
    try {
      return parseUnits(normalized, token.decimals);
    } catch {
      return undefined;
    }
  }, [debouncedInput, token.decimals]);

  const isDeposit = origin.kind === "deposit";

  const {
    quote,
    isLoading: quoteLoading,
    isExpired,
    expiresInSec,
    error: quoteError,
    refetch: refetchQuote,
  } = useBridgeQuote({
    origin,
    token,
    amount,
    recipient,
    userAddress: recipient,
    auto: !isDeposit,
  });

  // En el flujo de depósito, la quote activa se congela al generar la dirección.
  const [depositQuote, setDepositQuote] = useState<BridgeQuoteResponse | undefined>(undefined);

  const bridge = useBridgeExecution({ onDelivered });
  const phase = bridge.state.phase;
  const isRunning = phase !== "idle" && phase !== "delivered" && phase !== "refunded" && phase !== "error";

  const selectOrigin = (o: BridgeOrigin) => {
    if (isRunning) return;
    setOriginId(o.id);
    setTokenCurrency(o.tokens[0]!.currency);
    setDepositQuote(undefined);
    bridge.reset();
  };

  const handleEvmSend = () => {
    if (!quote) return;
    void bridge.executeEvmBridge(quote, origin.chainId);
  };

  const handleGenerateDeposit = async () => {
    const r = await refetchQuote();
    if (!r.data) return;
    setDepositQuote(r.data);
    bridge.watchDeposit(r.data);
  };

  const handleReset = () => {
    setDepositQuote(undefined);
    bridge.reset();
  };

  const depositUri = depositQuote?.depositAddress
    ? origin.chainId === RELAY_BITCOIN_CHAIN_ID
      ? `bitcoin:${depositQuote.depositAddress}?amount=${formatUnits(amount ?? 0n, 8)}`
      : `solana:${depositQuote.depositAddress}?amount=${formatUnits(amount ?? 0n, 9)}`
    : undefined;

  const statusMessage =
    phase === "switching_chain"
      ? BUY_FLOW_COPY.bridgeSwitching
      : phase === "awaiting_wallet"
        ? BUY_FLOW_COPY.bridgeAwaitingWallet
        : phase === "confirming_origin"
          ? BUY_FLOW_COPY.bridgeConfirmingOrigin
          : phase === "awaiting_deposit"
            ? BUY_FLOW_COPY.bridgeAwaitingDeposit
            : phase === "bridging"
              ? BUY_FLOW_COPY.bridgeInProgress
              : undefined;

  return (
    <div>
      <p style={css("font:400 14px/1.5 var(--font-hanken);color:#8A8A94;margin:0 0 16px")}>
        {BUY_FLOW_COPY.bridgeSubtitle}
      </p>

      <p style={sectionLabel}>{BUY_FLOW_COPY.bridgeOriginLabel}</p>
      <div style={css("display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px")}>
        {BRIDGE_ORIGINS.map((o) => (
          <Chip key={o.id} active={o.id === origin.id} label={o.label} onClick={() => selectOrigin(o)} />
        ))}
      </div>

      {origin.tokens.length > 1 ? (
        <>
          <p style={sectionLabel}>{BUY_FLOW_COPY.bridgeTokenLabel}</p>
          <div style={css("display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px")}>
            {origin.tokens.map((t) => (
              <Chip
                key={t.currency}
                active={t.currency === token.currency}
                label={t.symbol}
                onClick={() => {
                  if (!isRunning) setTokenCurrency(t.currency);
                }}
              />
            ))}
          </div>
        </>
      ) : null}

      <label style={css("display:block;font:600 13px var(--font-hanken);color:#5C5C66;margin-bottom:8px")}>
        {BUY_FLOW_COPY.bridgeAmountLabel} ({token.symbol})
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={amountInput}
        onChange={(e) => setAmountInput(e.target.value)}
        disabled={isRunning}
        style={css(
          "width:100%;box-sizing:border-box;padding:12px 14px;border:1px solid #E6E6E8;border-radius:12px;font:500 15px var(--font-mono);margin-bottom:12px"
        )}
      />

      {origin.chainId === RELAY_BITCOIN_CHAIN_ID ? (
        <p style={css("font:400 12px var(--font-hanken);color:#8A8A94;margin:0 0 12px")}>
          {BUY_FLOW_COPY.bridgeBtcMinHint}
        </p>
      ) : null}

      {quote && !isRunning && phase !== "delivered" ? (
        <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px")}>
          <Stat
            label={BUY_FLOW_COPY.bridgeEstimatedUsdc}
            value={`${Number(formatUnits(BigInt(quote.amountOut), 6)).toLocaleString("es-ES", { maximumFractionDigits: 2 })} USDC`}
          />
          <Stat
            label={BUY_FLOW_COPY.bridgeTimeLabel}
            value={quote.timeEstimate ? `~${quote.timeEstimate} s` : "—"}
          />
        </div>
      ) : null}

      {quote?.totalImpactUsd && !isRunning && phase !== "delivered" ? (
        <p style={css("font:400 12px var(--font-hanken);color:#8A8A94;margin:0 0 12px")}>
          {BUY_FLOW_COPY.bridgeFeesLabel}:{" "}
          {Number(quote.totalImpactUsd).toLocaleString("es-ES", { maximumFractionDigits: 2 })} USD
        </p>
      ) : null}

      {!isDeposit && quote && !isRunning && phase !== "delivered" ? (
        <p style={css("font:400 12px var(--font-hanken);color:#8A8A94;margin:0 0 12px")}>
          {isExpired ? BUY_FLOW_COPY.bridgeQuoteExpired : BUY_FLOW_COPY.bridgeExpiresIn(expiresInSec)}
        </p>
      ) : null}

      {quoteError && phase === "idle" ? (
        <p style={errorStyle}>{quoteError}</p>
      ) : null}

      {depositQuote?.depositAddress && (phase === "awaiting_deposit" || phase === "bridging") ? (
        <div style={css("margin-bottom:16px;padding:16px;border:1px solid #ECECEC;border-radius:14px;background:#FAFAFA;text-align:center")}>
          <p style={css("font:400 13px/1.5 var(--font-hanken);color:#5C5C66;margin:0 0 12px")}>
            {BUY_FLOW_COPY.bridgeDepositInstructions(
              amountInput.trim().replace(",", "."),
              token.symbol
            )}
          </p>
          {depositUri ? (
            <div style={css("display:flex;justify-content:center;margin-bottom:12px")}>
              <QRCodeSVG value={depositUri} size={168} />
            </div>
          ) : null}
          <p style={css("font:600 11px var(--font-hanken);color:#8A8A94;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.04em")}>
            {BUY_FLOW_COPY.bridgeDepositAddressLabel}
          </p>
          <p style={css("font:500 13px var(--font-mono);color:#0D0D0D;margin:0 0 12px;word-break:break-all")}>
            {depositQuote.depositAddress}
          </p>
          <CopyAddressButton value={depositQuote.depositAddress} />
        </div>
      ) : null}

      {statusMessage ? (
        <div style={css("display:flex;align-items:center;gap:10px;margin-bottom:16px")}>
          <div
            style={css(
              "width:20px;height:20px;border:2px solid #ECECEC;border-top-color:#0D0D0D;border-radius:50%;animation:bridge-spin 0.9s linear infinite;flex-shrink:0"
            )}
          />
          <span style={css("font:400 13px var(--font-hanken);color:#5C5C66")}>{statusMessage}</span>
        </div>
      ) : null}

      {phase === "delivered" ? (
        <div style={css("margin-bottom:16px")}>
          <InfoBanner message={BUY_FLOW_COPY.bridgeDelivered} />
          {bridge.state.destinationTxHash?.startsWith("0x") ? (
            <a
              href={`https://basescan.org/tx/${bridge.state.destinationTxHash}`}
              target="_blank"
              rel="noreferrer"
              style={css("display:inline-block;margin-top:10px;font:600 13px var(--font-hanken);color:#0D0D0D;text-decoration:underline")}
            >
              {BUY_FLOW_COPY.bridgeViewDestTx}
            </a>
          ) : null}
        </div>
      ) : null}

      {phase === "refunded" ? (
        <div style={css("margin-bottom:16px")}>
          <InfoBanner message={BUY_FLOW_COPY.bridgeRefunded} />
        </div>
      ) : null}

      {bridge.state.error ? <p style={errorStyle}>{bridge.state.error}</p> : null}

      {phase === "delivered" ? (
        <PrimaryButton onClick={() => onDelivered?.()} label={BUY_FLOW_COPY.bridgeGoBuyCta} />
      ) : phase === "error" || phase === "refunded" ? (
        <PrimaryButton onClick={handleReset} label={BUY_FLOW_COPY.bridgeRetryCta} />
      ) : isDeposit ? (
        phase === "awaiting_deposit" || phase === "bridging" ? (
          <SecondaryButton onClick={handleReset} label={BUY_FLOW_COPY.bridgeNewCta} />
        ) : (
          <PrimaryButton
            onClick={handleGenerateDeposit}
            disabled={!amount || !recipient || quoteLoading}
            label={quoteLoading ? "Calculando…" : BUY_FLOW_COPY.bridgeGetDepositCta}
          />
        )
      ) : (
        <PrimaryButton
          onClick={handleEvmSend}
          disabled={!quote || isExpired || isRunning || quoteLoading}
          label={quoteLoading ? "Calculando…" : BUY_FLOW_COPY.bridgeSendCta(origin.label)}
        />
      )}

      <style>{`@keyframes bridge-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const sectionLabel = css(
  "font:600 12px var(--font-hanken);color:#8A8A94;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.04em"
);

const errorStyle = css("font:500 13px var(--font-hanken);color:#D14343;margin:0 0 12px");

function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <Hov
      as="button"
      type="button"
      onClick={onClick}
      style={
        active
          ? "appearance:none;cursor:pointer;padding:10px 14px;border-radius:12px;border:1px solid #0D0D0D;background:#0D0D0D;color:#fff;font:600 12px var(--font-hanken)"
          : "appearance:none;cursor:pointer;padding:10px 14px;border-radius:12px;border:1px solid #E6E6E8;background:#fff;color:#5C5C66;font:600 12px var(--font-hanken)"
      }
      hover={active ? undefined : "border-color:#0D0D0D"}
    >
      {label}
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

function PrimaryButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Hov
      as="button"
      type="button"
      disabled={disabled}
      onClick={onClick}
      style="appearance:none;cursor:pointer;width:100%;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:15px;font:600 15px var(--font-hanken)"
      hover="background:#000"
    >
      {label}
    </Hov>
  );
}

function SecondaryButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Hov
      as="button"
      type="button"
      onClick={onClick}
      style="appearance:none;cursor:pointer;width:100%;background:transparent;color:#5C5C66;border:1px solid #E6E6E8;border-radius:12px;padding:13px;font:600 14px var(--font-hanken)"
      hover="border-color:#0D0D0D;color:#0D0D0D"
    >
      {label}
    </Hov>
  );
}
