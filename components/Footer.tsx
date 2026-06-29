"use client";

import { memo } from "react";
import Link from "next/link";
import { css } from "@/lib/css";
import { ACCENT } from "@/lib/format";

const COLS: { title: string; links: [string, string][] }[] = [
  { title: "Token", links: [["/comprar", "Comprar APEN"], ["/docs/whitepaper", "Whitepaper"], ["/docs/tokenomics", "Tokenomics"]] },
  { title: "Recursos", links: [["/docs/docs", "Documentación"], ["/docs/audit", "Auditoría"], ["/docs/support", "Soporte"]] },
  { title: "Legal", links: [["/docs/terms", "Términos"], ["/docs/privacy", "Privacidad"], ["/docs/risks", "Riesgos"]] },
];

function Footer() {
  return (
    <footer style={css("border-top:1px solid #ECECEC;margin-top:40px")}>
      <div style={css("max-width:1200px;margin:0 auto;padding:48px 24px 40px")}>
        <div style={css("display:flex;justify-content:space-between;gap:32px;flex-wrap:wrap;margin-bottom:36px")}>
          <div style={css("max-width:300px")}>
            <Link href="/" prefetch style={css("text-decoration:none;font:700 20px var(--font-hanken);letter-spacing:-0.04em;color:#0D0D0D")}>
              apen<span style={{ color: ACCENT }}>AI</span>
            </Link>
            <p style={css("font:400 14px/1.5 var(--font-hanken);color:#8A8A94;margin:12px 0 0")}>
              La capa de inversión del ecosistema apenAI. Compra, intercambia y custodia APEN.
            </p>
          </div>
          <div style={css("display:flex;gap:56px;flex-wrap:wrap")}>
            {COLS.map((col) => (
              <div key={col.title}>
                <div style={css("font:600 13px var(--font-hanken);margin-bottom:12px;color:#0D0D0D")}>{col.title}</div>
                <div style={css("display:flex;flex-direction:column;align-items:flex-start;gap:8px")}>
                  {col.links.map(([href, label]) => (
                    <Link key={href} href={href} prefetch className="footer-link" style={css("text-decoration:none;font:400 14px var(--font-hanken);color:#8A8A94")}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={css("border-top:1px solid #ECECEC;padding-top:20px;font:400 12px/1.5 var(--font-mono);color:#A8A8AE")}>
          apenAI es un concepto de diseño ficticio, sin valor real y sin afiliación con OpenAI. No constituye una oferta de inversión. Invertir conlleva riesgos.
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
