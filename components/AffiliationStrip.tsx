"use client";

import Link from "next/link";
import { css } from "@/lib/css";
import { brandLegal } from "@/lib/brand-legal";

export default function AffiliationStrip() {
  return (
    <div
      style={css(
        "border-bottom:1px solid #F2F2F3;background:#FAFAFA;padding:6px 24px;text-align:center;font:400 11px/1.4 var(--font-mono);color:#9A9AA0"
      )}
    >
      {brandLegal.shortDisclaimer}{" "}
      <Link href="/docs/terms#openai-inc" prefetch style={css("color:#6B6B76;text-decoration:underline")}>
        Más información
      </Link>
    </div>
  );
}
