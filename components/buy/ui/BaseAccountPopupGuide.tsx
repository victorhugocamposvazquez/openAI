"use client";

import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
};

export function BaseAccountPopupGuide({ onConfirm, onCancel }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={css(
        "position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,0.45)"
      )}
    >
      <div
        style={css(
          "width:100%;max-width:400px;padding:24px;border-radius:20px;background:#fff;border:1px solid #ECECEC;box-shadow:0 20px 60px rgba(0,0,0,0.15)"
        )}
      >
        <p style={css("font:600 11px var(--font-hanken);color:#8A8A94;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.06em")}>
          Cuenta Base
        </p>
        <h3 style={css("font:700 20px/1.25 var(--font-hanken);color:#0D0D0D;margin:0 0 12px")}>
          {BUY_FLOW_COPY.baseAccountPopupTitle}
        </h3>
        <p style={css("font:400 14px/1.55 var(--font-hanken);color:#5C5C66;margin:0 0 20px")}>
          {BUY_FLOW_COPY.baseAccountPopupMessage}
        </p>
        <div style={css("display:flex;flex-direction:column;gap:10px")}>
          <Hov
            as="button"
            type="button"
            onClick={onConfirm}
            style="appearance:none;cursor:pointer;width:100%;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:14px;font:600 15px var(--font-hanken)"
            hover="background:#000"
          >
            {BUY_FLOW_COPY.baseAccountPopupConfirm}
          </Hov>
          <Hov
            as="button"
            type="button"
            onClick={onCancel}
            style="appearance:none;cursor:pointer;width:100%;background:#F7F7F8;color:#0D0D0D;border:1px solid #E6E6E8;border-radius:12px;padding:14px;font:600 15px var(--font-hanken)"
            hover="border-color:#0D0D0D"
          >
            {BUY_FLOW_COPY.baseAccountPopupCancel}
          </Hov>
        </div>
      </div>
    </div>
  );
}
