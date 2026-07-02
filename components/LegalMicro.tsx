"use client";

import { css } from "@/lib/css";
import { brandLegal, getLegalZoneText } from "@/lib/brand-legal";

type Zone = keyof typeof brandLegal.legalChecklist.zones;

type Props = {
  children?: string;
  zone?: Zone;
};

export function LegalMicro({ children, zone }: Props) {
  const text = children ?? (zone ? getLegalZoneText(zone) : brandLegal.microDisclaimer);
  return (
    <p style={css("font:400 12px/1.45 var(--font-mono);color:#A8A8AE;margin:10px 0 0")}>{text}</p>
  );
}
