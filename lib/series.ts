/** Price-series generation + SVG path math, ported from the design prototype. */

export type Series = Record<string, number[]>;

export function buildSeries(): Series {
  // Centrado en el precio de preventa: 0,0005 USDC por OPEN.
  const base = 0.0005;
  const gen = (n: number, start: number, end: number, vol: number) => {
    const a: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const trend = start + (end - start) * t;
      const noise =
        (Math.sin(i * 1.7) * 0.6 + Math.sin(i * 0.5 + 1) * 0.4 + Math.sin(i * 2.3) * 0.25) *
        vol *
        end;
      a.push(Math.max(base * 0.01, trend + noise));
    }
    a[a.length - 1] = end;
    return a;
  };
  return {
    "1D": gen(24, base * 0.962, base, 0.011),
    "1W": gen(28, base * 0.9, base, 0.018),
    "1M": gen(30, base * 0.726, base, 0.03),
    "1Y": gen(48, base * 0.305, base, 0.05),
    ALL: gen(40, base * 0.195, base, 0.065),
  };
}

export function path(arr: number[]): { line: string; area: string } {
  const W = 1000,
    H = 300,
    pad = 28;
  const min = Math.min(...arr),
    max = Math.max(...arr),
    range = max - min || 1;
  const pts = arr.map((v, i) => [
    (i / (arr.length - 1)) * W,
    pad + (1 - (v - min) / range) * (H - 2 * pad),
  ]);
  const line = "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L");
  return { line, area: line + " L" + W + " " + H + " L0 " + H + " Z" };
}
