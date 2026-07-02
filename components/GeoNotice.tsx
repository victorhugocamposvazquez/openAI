"use client";

import Link from "next/link";
import { css } from "@/lib/css";
import { brandLegal } from "@/lib/brand-legal";

export function GeoNotice() {
  return (
    <p style={css("font:400 11px/1.45 var(--font-mono);color:#A8A8AE;margin:0")}>
      {brandLegal.geoNotice}{" "}
      <Link href="/docs/terms#elegibilidad" prefetch style={css("color:#6B6B76;text-decoration:underline")}>
        Ver elegibilidad
      </Link>
    </p>
  );
}
