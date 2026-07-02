"use client";

import { css } from "@/lib/css";
import { brandLegal } from "@/lib/brand-legal";

type Props = {
  children?: string;
};

export function LegalMicro({ children }: Props) {
  return (
    <p style={css("font:400 12px/1.45 var(--font-mono);color:#A8A8AE;margin:10px 0 0")}>
      {children ?? brandLegal.microDisclaimer}
    </p>
  );
}
