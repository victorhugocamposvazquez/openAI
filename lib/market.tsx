"use client";

import { useSyncExternalStore } from "react";

export type ActivityRow = { id: string; addr: string; action: string; amt: string; ts: number };

export type MarketState = {
  price: number;
  change: number;
  now: number;
  activity: ActivityRow[];
};

const START_PRICE = 4.2;
const BASE_REF = 4.068;

let market: MarketState = {
  price: START_PRICE,
  change: 3.24,
  now: typeof window !== "undefined" ? Date.now() : new Date("2026-06-29T00:00:00Z").getTime(),
  activity: [
    { id: "a1", addr: "0x7c…4f", action: "compró", amt: "1,250", ts: 8000 },
    { id: "a2", addr: "0x3a…e1", action: "intercambió", amt: "740", ts: 23000 },
    { id: "a3", addr: "0x9f…2a", action: "compró", amt: "3,100", ts: 41000 },
    { id: "a4", addr: "0xb2…7d", action: "compró", amt: "512", ts: 76000 },
    { id: "a5", addr: "0x18…c9", action: "intercambió", amt: "2,025", ts: 122000 },
  ],
};

const listeners = new Set<() => void>();
let started = false;

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return market;
}

export function getMarket() {
  return market;
}

export function useMarket(): MarketState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function genActivity(): ActivityRow {
  const hex = "0123456789abcdef";
  const r = (n: number) => Array.from({ length: n }, () => hex[Math.floor(Math.random() * 16)]).join("");
  const addr = "0x" + r(2) + "…" + r(2);
  const action = Math.random() < 0.68 ? "compró" : "intercambió";
  const amt = (Math.floor(Math.random() * 3900) + 180).toLocaleString("en-US");
  return { id: "a" + Date.now() + Math.floor(Math.random() * 99), addr, action, amt, ts: Date.now() };
}

/** Starts live price / countdown / activity timers once per session. */
export function startMarketTicker() {
  if (started || typeof window === "undefined") return;
  started = true;
  market = { ...market, now: Date.now() };

  setInterval(() => {
    market = { ...market, now: Date.now() };
    emit();
  }, 1000);

  setInterval(() => {
    const d = (Math.random() - 0.46) * 0.011;
    let np = market.price * (1 + d);
    np = Math.max(3.7, Math.min(4.85, np));
    np = +np.toFixed(3);
    market = { ...market, price: np, change: +((np / BASE_REF - 1) * 100).toFixed(2) };
    emit();
  }, 2000);

  setInterval(() => {
    market = { ...market, activity: [genActivity(), ...market.activity].slice(0, 6) };
    emit();
  }, 4600);
}
