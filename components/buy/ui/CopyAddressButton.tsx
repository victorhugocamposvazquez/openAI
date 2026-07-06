"use client";

import { useState } from "react";
import { css } from "@/lib/css";
import { Hov } from "@/components/ui";
import { BUY_FLOW_COPY } from "@/lib/onramp/constants";

type Props = {
  value: string;
  onCopy?: () => void;
};

export function CopyAddressButton({ value, onCopy }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Hov
      as="button"
      type="button"
      onClick={handleCopy}
      style="appearance:none;cursor:pointer;border:1px solid #E6E6E8;background:#fff;color:#5C5C66;border-radius:10px;padding:10px 14px;font:600 13px var(--font-hanken)"
      hover="border-color:#0D0D0D;color:#0D0D0D"
    >
      {copied ? "Copiado" : "Copiar dirección"}
    </Hov>
  );
}

export function InfoBanner({ message }: { message: string }) {
  return (
    <div style={css("padding:12px 14px;border-radius:12px;background:#F7F7F8;border:1px solid #ECECEC;font:400 14px/1.45 var(--font-hanken);color:#5C5C66")}>
      {message}
    </div>
  );
}

export function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={css("max-width:520px;margin:0 auto;padding:28px 24px;border:1px solid #ECECEC;border-radius:20px;background:#fff")}>
      {children}
    </div>
  );
}

export function StepTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={css("margin-bottom:24px")}>
      <h1 style={css("font:700 28px/1.15 var(--font-hanken);letter-spacing:-0.03em;color:#0D0D0D;margin:0 0 8px")}>{title}</h1>
      {subtitle ? <p style={css("font:400 15px/1.5 var(--font-hanken);color:#8A8A94;margin:0")}>{subtitle}</p> : null}
    </div>
  );
}
