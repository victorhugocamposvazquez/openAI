"use client";

import React, { useState } from "react";
import { merge } from "@/lib/css";

type HovProps = {
  as?: any;
  style?: string | React.CSSProperties;
  hover?: string | React.CSSProperties;
  focus?: string | React.CSSProperties;
  children?: React.ReactNode;
} & Record<string, any>;

/**
 * Renders an element whose `style` string is parsed via css(), and applies
 * `hover` / `focus` overlays on the matching pointer/focus state — the
 * Next.js equivalent of the design's style-hover / style-focus attributes.
 */
export function Hov({ as = "div", style, hover, focus, children, ...rest }: HovProps) {
  const [h, setH] = useState(false);
  const [f, setF] = useState(false);
  const El: any = as;
  return (
    <El
      {...rest}
      onMouseEnter={(e: any) => { setH(true); rest.onMouseEnter?.(e); }}
      onMouseLeave={(e: any) => { setH(false); rest.onMouseLeave?.(e); }}
      onFocus={(e: any) => { setF(true); rest.onFocus?.(e); }}
      onBlur={(e: any) => { setF(false); rest.onBlur?.(e); }}
      style={merge(style, h && hover, f && focus)}
    >
      {children}
    </El>
  );
}

/** apenAI mark — black rounded square with a white triangle. */
export function Logo({ size = 28 }: { size?: number }) {
  const inner = Math.round(size * 0.46);
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        background: "#0D0D0D",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={inner} height={inner} viewBox="0 0 12 12">
        <path d="M6 1.6 L10.4 10.4 L1.6 10.4 Z" fill="#fff" />
      </svg>
    </span>
  );
}
