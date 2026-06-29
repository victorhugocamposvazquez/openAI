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

/** OpenAI mark used in the header. */
export function Logo({ height = 28 }: { height?: number }) {
  return (
    <img
      src="/openai-logo.png"
      alt="OpenAI"
      height={height}
      style={{ height, width: "auto", display: "block" }}
    />
  );
}
