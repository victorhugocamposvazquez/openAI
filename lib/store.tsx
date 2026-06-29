"use client";

import React, { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PRICES_USD } from "./format";

/* ──────────────────────────────────────────────────────────
   apenAI demo store. All trading logic is simulated client-side
   and persisted to localStorage so the app runs with zero backend.
   See lib/supabase/* and the README for the production wiring
   (Supabase Auth + RLS + execute_trade RPC).
   ────────────────────────────────────────────────────────── */

export type Balances = Record<string, number>;
export type Tx = {
  type: string;
  main: string;
  sub: string;
  time: string;
  id: string;
  date: string;
  apenStr: string;
  payLabel: string;
  rate: string;
  fee: string;
  isSell?: boolean;
  recvLabel?: string;
};
type ActivityRow = { id: string; addr: string; action: string; amt: string; ts: number };

const START_PRICE = 4.2;
const BASE_REF = 4.068;
const STORAGE_KEY = "apenai_demo_v1";

export function prices(apen: number): Record<string, number> {
  return { APEN: apen, ...PRICES_USD };
}

function fmtN(n: number, d: number) {
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtUSD(n: number) {
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
  if (n >= 1000) return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export interface AppState {
  // live market
  price: number;
  change: number;
  now: number;
  // wallet / account
  connected: boolean;
  address: string;
  balances: Balances;
  apenAvg: number;
  txs: Tx[];
  activity: ActivityRow[];
  // buy form
  buyMethod: "card" | "crypto";
  payAsset: string;
  payAmount: string;
  cardCur: string;
  cardNumber: string;
  cardExp: string;
  cardCvc: string;
  cardName: string;
  provider: string;
  // swap form
  fromAsset: string;
  fromAmount: string;
  slippage: number;
  swapSide: "toApen" | "fromApen";
  // ui
  tf: string;
  processing: boolean;
  walletOpen: boolean;
  providerOpen: boolean;
  successOpen: boolean;
  successTx: Tx | null;
  toast: string | null;
}

export interface AppApi extends AppState {
  set: <K extends keyof AppState>(patch: Partial<AppState>) => void;
  // wallet
  openWallet: () => void;
  closeWallet: () => void;
  connect: (name: string) => void;
  disconnect: () => void;
  // buy
  setBuyMethod: (k: "card" | "crypto") => void;
  setPay: (k: string) => void;
  setPayAmount: (v: string) => void;
  setQuick: (v: number) => void;
  maxPay: () => void;
  setCardCur: (k: string) => void;
  onCardNumber: (v: string) => void;
  onCardExp: (v: string) => void;
  onCardCvc: (v: string) => void;
  onCardName: (v: string) => void;
  setProvider: (k: string) => void;
  closeProvider: () => void;
  buy: () => void;
  confirmProvider: () => void;
  // swap
  setFrom: (k: string) => void;
  setFromAmount: (v: string) => void;
  flipSwap: () => void;
  setSlip: (v: number) => void;
  maxFrom: () => void;
  swap: () => void;
  // success
  closeSuccess: () => void;
  downloadReceipt: () => void;
  // misc
  toastMsg: (m: string) => void;
}

const Ctx = createContext<AppApi | null>(null);
export const useApp = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within <AppProvider>");
  return v;
};

const INITIAL: AppState = {
  price: START_PRICE,
  change: 3.24,
  now: new Date("2026-06-29T00:00:00Z").getTime(),
  connected: false,
  address: "0x7A3f…9E2b",
  balances: { USDC: 0, ETH: 0, BTC: 0, APEN: 0 },
  apenAvg: 0,
  txs: [],
  activity: [
    { id: "a1", addr: "0x7c…4f", action: "compró", amt: "1,250", ts: 8000 },
    { id: "a2", addr: "0x3a…e1", action: "intercambió", amt: "740", ts: 23000 },
    { id: "a3", addr: "0x9f…2a", action: "compró", amt: "3,100", ts: 41000 },
    { id: "a4", addr: "0xb2…7d", action: "compró", amt: "512", ts: 76000 },
    { id: "a5", addr: "0x18…c9", action: "intercambió", amt: "2,025", ts: 122000 },
  ],
  buyMethod: "card",
  payAsset: "USDC",
  payAmount: "500",
  cardCur: "EUR",
  cardNumber: "",
  cardExp: "",
  cardCvc: "",
  cardName: "",
  provider: "transak",
  fromAsset: "ETH",
  fromAmount: "1",
  slippage: 0.5,
  swapSide: "toApen",
  tf: "1M",
  processing: false,
  walletOpen: false,
  providerOpen: false,
  successOpen: false,
  successTx: null,
  toast: null,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<AppState>(INITIAL);
  const sref = useRef(s);
  sref.current = s;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const procTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = useCallback((patch: Partial<AppState>) => setS((p) => ({ ...p, ...patch })), []);

  // ── hydrate from localStorage ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && typeof d === "object") {
          setS((p) => ({
            ...p,
            connected: !!d.connected,
            address: d.address || p.address,
            balances: d.balances || p.balances,
            apenAvg: d.apenAvg || 0,
            txs: Array.isArray(d.txs) ? d.txs : [],
          }));
        }
      }
    } catch {}
    setS((p) => ({ ...p, now: Date.now() }));
  }, []);

  const persist = useCallback((next: AppState) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          connected: next.connected,
          address: next.address,
          balances: next.balances,
          apenAvg: next.apenAvg,
          txs: next.txs,
        })
      );
    } catch {}
  }, []);

  // ── live price + countdown + activity feed ──
  useEffect(() => {
    const t1 = setInterval(() => setS((p) => ({ ...p, now: Date.now() })), 1000);
    const t2 = setInterval(() => {
      setS((p) => {
        const d = (Math.random() - 0.46) * 0.011;
        let np = p.price * (1 + d);
        np = Math.max(3.7, Math.min(4.85, np));
        np = +np.toFixed(3);
        return { ...p, price: np, change: +((np / BASE_REF - 1) * 100).toFixed(2) };
      });
    }, 2000);
    const t3 = setInterval(() => {
      setS((p) => ({ ...p, activity: [genActivity(), ...p.activity].slice(0, 6) }));
    }, 4600);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
      clearInterval(t3);
    };
  }, []);

  const toastMsg = useCallback((m: string) => {
    setS((p) => ({ ...p, toast: m }));
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setS((p) => ({ ...p, toast: null })), 2600);
  }, []);

  // ── wallet ──
  const openWallet = useCallback(() => set({ walletOpen: true }), [set]);
  const closeWallet = useCallback(() => set({ walletOpen: false }), [set]);
  const connect = useCallback(
    (name: string) => {
      setS((p) => {
        const next = {
          ...p,
          connected: true,
          walletOpen: false,
          balances: { USDC: 12500, ETH: 4.2, BTC: 0.35, APEN: p.balances.APEN || 0 },
        };
        persist(next);
        return next;
      });
      toastMsg("Wallet conectada · " + name);
    },
    [persist, toastMsg]
  );
  const disconnect = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    set({ connected: false, apenAvg: 0, balances: { USDC: 0, ETH: 0, BTC: 0, APEN: 0 }, txs: [] });
    toastMsg("Wallet desconectada");
  }, [set, toastMsg]);

  // ── buy form setters ──
  const setBuyMethod = useCallback((k: "card" | "crypto") => set({ buyMethod: k }), [set]);
  const setPay = useCallback((k: string) => set({ payAsset: k }), [set]);
  const setPayAmount = useCallback((v: string) => set({ payAmount: v }), [set]);
  const setQuick = useCallback((v: number) => set({ payAmount: String(v) }), [set]);
  const maxPay = useCallback(() => set({ payAmount: String(sref.current.balances[sref.current.payAsset] || 0) }), [set]);
  const setCardCur = useCallback((k: string) => set({ cardCur: k }), [set]);
  const onCardNumber = useCallback((v: string) => {
    const f = v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    set({ cardNumber: f });
  }, [set]);
  const onCardExp = useCallback((v: string) => {
    let f = v.replace(/\D/g, "").slice(0, 4);
    if (f.length >= 3) f = f.slice(0, 2) + "/" + f.slice(2);
    set({ cardExp: f });
  }, [set]);
  const onCardCvc = useCallback((v: string) => set({ cardCvc: v.replace(/\D/g, "").slice(0, 4) }), [set]);
  const onCardName = useCallback((v: string) => set({ cardName: v }), [set]);
  const setProvider = useCallback((k: string) => set({ provider: k }), [set]);
  const closeProvider = useCallback(() => set({ providerOpen: false }), [set]);

  // ── swap form setters ──
  const setFrom = useCallback((k: string) => set({ fromAsset: k }), [set]);
  const setFromAmount = useCallback((v: string) => set({ fromAmount: v }), [set]);
  const flipSwap = useCallback(
    () => setS((p) => ({ ...p, swapSide: p.swapSide === "toApen" ? "fromApen" : "toApen", fromAmount: "" })),
    []
  );
  const setSlip = useCallback((v: number) => set({ slippage: v }), [set]);
  const maxFrom = useCallback(() => {
    const p = sref.current;
    const pt = p.swapSide === "toApen" ? p.fromAsset : "APEN";
    set({ fromAmount: String(p.balances[pt] || 0) });
  }, [set]);

  // ── transaction completion ──
  const runProcessing = useCallback((fn: () => void) => {
    if (sref.current.processing) return;
    set({ processing: true });
    if (procTimer.current) clearTimeout(procTimer.current);
    procTimer.current = setTimeout(() => {
      set({ processing: false });
      fn();
    }, 950);
  }, [set]);

  const dateStr = () => {
    try {
      return new Date().toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return new Date().toLocaleString();
    }
  };

  const finishBuy = useCallback(
    (apenAdded: number, usdGross: number, feeUsd: number, payLabel: string, kind: string, debit: { asset: string; amount: number } | null) => {
      const P = prices(sref.current.price);
      const tx: Tx = {
        type: kind,
        main: "+" + fmtN(apenAdded, 2) + " APEN",
        sub: payLabel,
        time: "ahora",
        id: "APN-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
        date: dateStr(),
        apenStr: fmtN(apenAdded, 2),
        payLabel,
        rate: "1 APEN = " + fmtUSD(P.APEN),
        fee: fmtUSD(feeUsd),
      };
      setS((p) => {
        const b = { ...p.balances };
        if (debit) b[debit.asset] = +(b[debit.asset] - debit.amount).toFixed(6);
        const oldQty = b.APEN,
          oldAvg = p.apenAvg;
        b.APEN = +(b.APEN + apenAdded).toFixed(2);
        const newAvg = oldQty + apenAdded > 0 ? (oldQty * oldAvg + usdGross) / (oldQty + apenAdded) : 0;
        const next = { ...p, balances: b, apenAvg: newAvg, txs: [tx, ...p.txs], successTx: tx, successOpen: true, providerOpen: false };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const finishSwapOut = useCallback(
    (apenSpent: number, tokenAsset: string, tokenAmt: number, feeUsd: number) => {
      const P = prices(sref.current.price);
      const tx: Tx = {
        type: "Venta",
        main: "+" + fmtN(tokenAmt, tokenAsset === "BTC" ? 5 : 4) + " " + tokenAsset,
        sub: fmtN(apenSpent, 2) + " APEN → " + tokenAsset,
        time: "ahora",
        id: "APN-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
        date: dateStr(),
        apenStr: fmtN(apenSpent, 2),
        payLabel: fmtN(apenSpent, 2) + " APEN",
        rate: "1 APEN = " + fmtUSD(P.APEN),
        fee: fmtUSD(feeUsd),
        isSell: true,
        recvLabel: fmtN(tokenAmt, tokenAsset === "BTC" ? 5 : 4) + " " + tokenAsset,
      };
      setS((p) => {
        const b = { ...p.balances };
        b.APEN = +(b.APEN - apenSpent).toFixed(2);
        b[tokenAsset] = +((b[tokenAsset] || 0) + tokenAmt).toFixed(6);
        const next = { ...p, balances: b, txs: [tx, ...p.txs], successTx: tx, successOpen: true };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const payCard = useCallback(() => {
    const p = sref.current;
    const amt = parseFloat(p.payAmount) || 0;
    if (amt <= 0) return toastMsg("Introduce un importe válido");
    if (!p.connected) {
      set({ walletOpen: true });
      return toastMsg("Conecta una wallet para recibir tus APEN");
    }
    set({ providerOpen: true });
  }, [set, toastMsg]);

  const confirmProvider = useCallback(() => {
    const p = sref.current;
    if (p.cardNumber.replace(/\D/g, "").length < 15) return toastMsg("Número de tarjeta incompleto");
    if (!/^\d{2}\/\d{2}$/.test(p.cardExp)) return toastMsg("Caducidad inválida (MM/AA)");
    if (p.cardCvc.length < 3) return toastMsg("CVC inválido");
    if (!p.cardName.trim()) return toastMsg("Añade el titular de la tarjeta");
    runProcessing(() => {
      const cur = sref.current;
      const amt = parseFloat(cur.payAmount) || 0;
      const P = prices(cur.price);
      const rate = cur.provider === "moonpay" ? 0.019 : 0.015;
      const usd = amt * P[cur.cardCur];
      const apen = (usd * (1 - rate)) / P.APEN;
      const prov = cur.provider === "moonpay" ? "MoonPay" : "Transak";
      finishBuy(apen, usd, usd * rate, fmtN(amt, 2) + " " + cur.cardCur + " · " + prov, "Compra con tarjeta", null);
    });
  }, [runProcessing, finishBuy, toastMsg]);

  const buy = useCallback(() => {
    const p = sref.current;
    if (p.buyMethod === "card") return payCard();
    const amt = parseFloat(p.payAmount) || 0;
    if (amt <= 0) return toastMsg("Introduce un importe válido");
    if (!p.connected) return set({ walletOpen: true });
    const P = prices(p.price);
    const a = p.payAsset;
    const isCrypto = a === "USDC" || a === "ETH" || a === "BTC";
    if (isCrypto && (p.balances[a] || 0) < amt) return toastMsg("Saldo insuficiente de " + a);
    runProcessing(() => {
      const cur = sref.current;
      const usd = amt * P[a];
      const apen = (usd * 0.99) / P.APEN;
      finishBuy(apen, usd, usd * 0.01, "con " + fmtN(amt, a === "BTC" ? 4 : 2) + " " + a, "Compra", isCrypto ? { asset: a, amount: amt } : null);
    });
  }, [payCard, runProcessing, finishBuy, set, toastMsg]);

  const swap = useCallback(() => {
    const p = sref.current;
    const amt = parseFloat(p.fromAmount) || 0;
    if (amt <= 0) return toastMsg("Introduce un importe válido");
    if (!p.connected) return set({ walletOpen: true });
    const P = prices(p.price);
    const side = p.swapSide,
      token = p.fromAsset;
    const payToken = side === "toApen" ? token : "APEN";
    if ((p.balances[payToken] || 0) < amt) return toastMsg("Saldo insuficiente de " + payToken);
    runProcessing(() => {
      const usd = amt * P[payToken];
      if (side === "toApen") {
        const apen = (usd * 0.997) / P.APEN;
        finishBuy(apen, usd, usd * 0.003, fmtN(amt, 4) + " " + token + " → APEN", "Intercambio", { asset: token, amount: amt });
      } else {
        const recv = (usd * 0.997) / P[token];
        finishSwapOut(amt, token, recv, usd * 0.003);
      }
    });
  }, [runProcessing, finishBuy, finishSwapOut, set, toastMsg]);

  const closeSuccess = useCallback(() => set({ successOpen: false }), [set]);
  const downloadReceipt = useCallback(() => {
    const t = sref.current.successTx;
    if (!t) return;
    const lines = [
      "apenAI — Recibo de operación",
      "(concepto de diseño ficticio · sin valor real)",
      "----------------------------------------",
      "ID            " + t.id,
      "Tipo          " + t.type,
      "Fecha         " + t.date,
      "Pagado        " + t.payLabel,
      "Recibido      " + t.apenStr + " APEN",
      "Precio        " + t.rate,
      "Comisión      " + t.fee,
      "Wallet        " + sref.current.address,
      "----------------------------------------",
      "Gracias por invertir en APEN.",
    ].join("\n");
    try {
      const blob = new Blob([lines], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "apenAI-recibo-" + t.id + ".txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toastMsg("Recibo descargado");
    } catch {
      toastMsg("No se pudo descargar el recibo");
    }
  }, [toastMsg]);

  const api: AppApi = useMemo(
    () => ({
      ...s,
      set,
      openWallet,
      closeWallet,
      connect,
      disconnect,
      setBuyMethod,
      setPay,
      setPayAmount,
      setQuick,
      maxPay,
      setCardCur,
      onCardNumber,
      onCardExp,
      onCardCvc,
      onCardName,
      setProvider,
      closeProvider,
      buy,
      confirmProvider,
      setFrom,
      setFromAmount,
      flipSwap,
      setSlip,
      maxFrom,
      swap,
      closeSuccess,
      downloadReceipt,
      toastMsg,
    }),
    [s, set, openWallet, closeWallet, connect, disconnect, setBuyMethod, setPay, setPayAmount, setQuick, maxPay, setCardCur, onCardNumber, onCardExp, onCardCvc, onCardName, setProvider, closeProvider, buy, confirmProvider, setFrom, setFromAmount, flipSwap, setSlip, maxFrom, swap, closeSuccess, downloadReceipt, toastMsg]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

function genActivity(): ActivityRow {
  const hex = "0123456789abcdef";
  const r = (n: number) => Array.from({ length: n }, () => hex[Math.floor(Math.random() * 16)]).join("");
  const addr = "0x" + r(2) + "…" + r(2);
  const action = Math.random() < 0.68 ? "compró" : "intercambió";
  const amt = (Math.floor(Math.random() * 3900) + 180).toLocaleString("en-US");
  return { id: "a" + Date.now() + Math.floor(Math.random() * 99), addr, action, amt, ts: Date.now() };
}
