"use client";

import Link from "next/link";
import { css } from "@/lib/css";
import { legalUrls } from "@/lib/legal.config";
import { brandLegal } from "@/lib/brand-legal";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function LegalConsent({ checked, onChange }: Props) {
  return (
    <label
      style={css(
        "display:flex;align-items:flex-start;gap:10px;margin-top:16px;padding:14px;background:#F7F7F8;border-radius:12px;cursor:pointer;font:400 13px/1.5 var(--font-hanken);color:#5C5C66"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: 3, accentColor: "#0D0D0D", flex: "none" }}
      />
      <span>
        He leído y acepto los{" "}
        <Link href={legalUrls.terms} prefetch style={css("color:#0D0D0D;font-weight:600")}>
          Términos
        </Link>
        , la{" "}
        <Link href={legalUrls.privacy} prefetch style={css("color:#0D0D0D;font-weight:600")}>
          Política de privacidad
        </Link>{" "}
        y la{" "}
        <Link href={legalUrls.risks} prefetch style={css("color:#0D0D0D;font-weight:600")}>
          {brandLegal.risksDocTitle}
        </Link>
        .
      </span>
    </label>
  );
}
