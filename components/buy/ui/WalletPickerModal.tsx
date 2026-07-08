"use client";

import { useEffect } from "react";
import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";
import { WalletOptions } from "@/components/wallet/WalletOptions";

type Props = {
  onClose: () => void;
};

export function WalletPickerModal({ onClose }: Props) {
  // Cerrar con Escape y bloquear el scroll de fondo mientras está abierto.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={css(
        "position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,0.45)"
      )}
      onClick={onClose}
    >
      <div
        style={css(
          "width:100%;max-width:400px;padding:24px;border-radius:20px;background:#fff;border:1px solid #ECECEC;box-shadow:0 20px 60px rgba(0,0,0,0.15)"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={css("font:700 20px/1.25 var(--font-hanken);color:#0D0D0D;margin:0 0 8px")}>
          {BUY_FLOW_COPY.walletModalTitle}
        </h3>
        <p style={css("font:400 14px/1.5 var(--font-hanken);color:#8A8A94;margin:0 0 20px")}>
          {BUY_FLOW_COPY.walletModalSubtitle}
        </p>

        <WalletOptions onSuccess={onClose} />

        <Hov
          as="button"
          type="button"
          onClick={onClose}
          style="appearance:none;cursor:pointer;width:100%;background:#F7F7F8;color:#0D0D0D;border:1px solid #E6E6E8;border-radius:12px;padding:14px;font:600 14px var(--font-hanken);margin-top:10px"
          hover="border-color:#0D0D0D"
        >
          Cancelar
        </Hov>
      </div>
    </div>
  );
}
