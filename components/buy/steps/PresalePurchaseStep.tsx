"use client";

import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";
import { usePresalePurchase } from "@/hooks/usePresalePurchase";
import { InfoBanner, StepCard, StepTitle } from "../ui/CopyAddressButton";

export function PresalePurchaseStep() {
  const {
    route,
    setRoute,
    amountInput,
    setAmountInput,
    state,
    stepLabels,
    supportsBatch,
    capsLoading,
    isWalletConnect,
    startPurchase,
    retry,
    canPurchase,
  } = usePresalePurchase();

  const isRunning = state.phase === "awaiting_wallet" || state.phase === "confirming";

  return (
    <StepCard>
      <StepTitle title={BUY_FLOW_COPY.compraTitle} subtitle={BUY_FLOW_COPY.compraSubtitle} />

      <div style={css("display:flex;gap:8px;margin-bottom:16px")}>
        <RouteChip active={route === "usdc"} onClick={() => setRoute("usdc")} label={BUY_FLOW_COPY.compraRouteUsdc} />
        <RouteChip active={route === "swap"} onClick={() => setRoute("swap")} label={BUY_FLOW_COPY.compraRouteSwap} />
      </div>

      <label style={css("display:block;font:600 13px var(--font-hanken);color:#5C5C66;margin-bottom:8px")}>
        {BUY_FLOW_COPY.compraAmountLabel}
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={amountInput}
        onChange={(e) => setAmountInput(e.target.value)}
        disabled={isRunning}
        style={css(
          "width:100%;box-sizing:border-box;padding:12px 14px;border:1px solid #E6E6E8;border-radius:12px;font:500 15px var(--font-mono);margin-bottom:16px"
        )}
      />

      <div style={css("margin-bottom:16px")}>
        <p style={css("font:600 12px var(--font-hanken);color:#8A8A94;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.04em")}>
          Modo de ejecución
        </p>
        <p style={css("font:400 13px var(--font-hanken);color:#5C5C66;margin:0")}>
          {capsLoading
            ? "Consultando capacidades de la wallet…"
            : supportsBatch
              ? "Batching atómico detectado — una sola firma."
              : "Sin batching — pasos secuenciales con confirmación entre cada uno."}
        </p>
      </div>

      {stepLabels.length > 0 ? (
        <ol style={css("margin:0 0 16px;padding:0;list-style:none")}>
          {stepLabels.map((label, index) => {
            const active = state.phase !== "idle" && index === state.stepIndex;
            const done = state.phase === "done" || (state.phase !== "idle" && index < state.stepIndex);
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

      {state.phase === "awaiting_wallet" && isWalletConnect ? (
        <div style={css("margin-bottom:16px")}>
          <InfoBanner message={BUY_FLOW_COPY.confirmInWalletApp} />
          <p style={css("font:400 12px var(--font-hanken);color:#8A8A94;margin:8px 0 0")}>
            {BUY_FLOW_COPY.confirmInWalletAppHint}
          </p>
        </div>
      ) : null}

      {state.phase === "confirming" ? (
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

      {state.phase === "done" ? (
        <InfoBanner message={`${BUY_FLOW_COPY.compraDoneTitle}. ${BUY_FLOW_COPY.compraDoneSubtitle}`} />
      ) : null}

      {state.error ? (
        <p style={css("font:500 13px var(--font-hanken);color:#D14343;margin:0 0 12px")}>{state.error}</p>
      ) : null}

      {state.phase === "error" ? (
        <Hov
          as="button"
          type="button"
          onClick={retry}
          style="appearance:none;cursor:pointer;width:100%;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:15px;font:600 15px var(--font-hanken)"
          hover="background:#000"
        >
          {BUY_FLOW_COPY.compraRetryCta}
        </Hov>
      ) : (
        <Hov
          as="button"
          type="button"
          disabled={!canPurchase || isRunning}
          onClick={startPurchase}
          style="appearance:none;cursor:pointer;width:100%;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:15px;font:600 15px var(--font-hanken)"
          hover="background:#000"
        >
          {isRunning ? state.currentLabel : BUY_FLOW_COPY.compraStartCta}
        </Hov>
      )}

      <style>{`@keyframes buy-spin { to { transform: rotate(360deg); } }`}</style>
    </StepCard>
  );
}

function RouteChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <Hov
      as="button"
      type="button"
      onClick={onClick}
      style={
        active
          ? "appearance:none;cursor:pointer;padding:8px 12px;border-radius:999px;border:1px solid #0D0D0D;background:#0D0D0D;color:#fff;font:600 12px var(--font-hanken)"
          : "appearance:none;cursor:pointer;padding:8px 12px;border-radius:999px;border:1px solid #E6E6E8;background:#fff;color:#5C5C66;font:600 12px var(--font-hanken)"
      }
      hover={active ? undefined : "border-color:#0D0D0D"}
    >
      {label}
    </Hov>
  );
}
