/** Máquina de estados del flujo de preventa (on-ramp). */

import { ONRAMP_FIAT } from "./constants";

export type BuyFlowStep = "sin_wallet" | "sin_fondos" | "esperando_fondos" | "listo" | "comprando";

export type RampVia = "A" | "B";

export type BuyFlowState =
  | { step: "sin_wallet" }
  | { step: "sin_fondos"; fiatValue: string; infoMessage?: string }
  | { step: "esperando_fondos"; fiatValue: string; rampVia: RampVia; infoMessage?: string }
  | { step: "listo"; balanceLabel: string }
  | { step: "comprando"; balanceLabel: string };

export type BuyFlowAction =
  | { type: "WALLET_DISCONNECTED" }
  | { type: "WALLET_CONNECTED_ZERO"; fiatValue: string }
  | { type: "BALANCE_POSITIVE"; balanceLabel: string }
  | { type: "START_PURCHASE" }
  | { type: "START_WAITING"; fiatValue: string; rampVia: RampVia }
  | { type: "PAYMENT_CANCELLED"; message: string }
  | { type: "UPDATE_FIAT"; fiatValue: string }
  | { type: "CLEAR_INFO" };

function currentFiat(state: BuyFlowState): string {
  if (state.step === "sin_fondos" || state.step === "esperando_fondos") return state.fiatValue;
  return ONRAMP_FIAT.defaultValue;
}

export function buyFlowReducer(state: BuyFlowState, action: BuyFlowAction): BuyFlowState {
  switch (action.type) {
    case "WALLET_DISCONNECTED":
      return { step: "sin_wallet" };
    case "WALLET_CONNECTED_ZERO":
      return { step: "sin_fondos", fiatValue: action.fiatValue };
    case "BALANCE_POSITIVE":
      return { step: "listo", balanceLabel: action.balanceLabel };
    case "START_PURCHASE":
      if (state.step === "listo") return { step: "comprando", balanceLabel: state.balanceLabel };
      return state;
    case "START_WAITING":
      return { step: "esperando_fondos", fiatValue: action.fiatValue, rampVia: action.rampVia };
    case "PAYMENT_CANCELLED":
      return { step: "sin_fondos", fiatValue: currentFiat(state), infoMessage: action.message };
    case "UPDATE_FIAT":
      if (state.step === "sin_fondos") return { ...state, fiatValue: action.fiatValue };
      return state;
    case "CLEAR_INFO":
      if (state.step === "sin_fondos") return { ...state, infoMessage: undefined };
      return state;
    default:
      return state;
  }
}

export const INITIAL_BUY_FLOW: BuyFlowState = { step: "sin_wallet" };
