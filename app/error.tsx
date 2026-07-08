"use client";

import { useEffect } from "react";
import { css } from "@/lib/css";

/**
 * Boundary global de errores de cliente. Sin él, cualquier excepción en una
 * pantalla desmonta la app entera y la navegación deja de responder.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] error no controlado:", error);
  }, [error]);

  return (
    <main style={css("max-width:1100px;margin:0 auto;padding:40px 24px")}>
      <div style={css("display:flex;flex-direction:column;align-items:center;text-align:center;padding:80px 24px")}>
        <span style={css("width:64px;height:64px;border-radius:18px;background:#FDF2F2;display:flex;align-items:center;justify-content:center;margin-bottom:22px")}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D14343" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </span>
        <h2 style={css("font:600 26px var(--font-hanken);letter-spacing:-0.03em;margin:0 0 8px;color:#0D0D0D")}>
          Algo ha fallado
        </h2>
        <p style={css("font:400 16px/1.5 var(--font-hanken);color:#6B6B76;margin:0 0 24px;max-width:420px")}>
          Se ha producido un error inesperado en esta pantalla. Tus fondos no se ven afectados: ninguna
          operación se firma sin tu confirmación en la wallet.
        </p>
        <div style={css("display:flex;gap:10px")}>
          <button
            onClick={reset}
            style={css("appearance:none;cursor:pointer;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:14px 28px;font:600 15px var(--font-hanken)")}
          >
            Reintentar
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            style={css("appearance:none;cursor:pointer;background:#fff;color:#0D0D0D;border:1px solid #DADADD;border-radius:12px;padding:14px 28px;font:600 15px var(--font-hanken)")}
          >
            Ir al inicio
          </button>
        </div>
      </div>
    </main>
  );
}
