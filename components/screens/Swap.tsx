"use client";

import { useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { ACCENT } from "@/lib/format";
import { Hov } from "../ui";

/**
 * El intercambio OPEN ⇄ tokens requiere liquidez on-chain, disponible
 * tras el TGE. Hasta entonces esta pantalla informa y redirige a la
 * preventa real en /comprar — nada de swaps simulados.
 */
export default function Swap() {
  const router = useRouter();

  return (
    <main style={css("padding:48px 24px;display:flex;justify-content:center")}>
      <div style={css("width:460px;max-width:100%")}>
        <h2 style={css("font:600 30px var(--font-hanken);letter-spacing:-0.03em;margin:0 0 6px")}>Intercambiar</h2>
        <p style={css("font:400 15px var(--font-hanken);color:#6B6B76;margin:0 0 24px")}>
          El swap de OPEN estará disponible cuando el token cotice con liquidez on-chain.
        </p>

        <div style={css("background:#fff;border:1px solid #ECECEC;border-radius:20px;padding:32px 26px;box-shadow:0 20px 50px -30px rgba(13,13,13,0.18);text-align:center")}>
          <span
            style={{
              ...css("width:56px;height:56px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:18px"),
              background: "color-mix(in srgb, var(--accent) 12%, #fff)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 7h11l-2-2M17 17H6l2 2" />
            </svg>
          </span>
          <h3 style={css("font:700 20px var(--font-hanken);letter-spacing:-0.02em;margin:0 0 8px")}>Disponible tras el TGE</h3>
          <p style={css("font:400 14px/1.6 var(--font-hanken);color:#6B6B76;margin:0 0 22px")}>
            Cuando OPEN se liste con liquidez, aquí podrás intercambiarlo por ETH, USDC y otros tokens
            directamente desde tu wallet. Mientras tanto puedes adquirir OPEN en la preventa.
          </p>
          <Hov
            as="button"
            type="button"
            onClick={() => router.push("/comprar")}
            style="appearance:none;cursor:pointer;width:100%;background:#0D0D0D;color:#fff;border:none;border-radius:12px;padding:15px;font:600 15px var(--font-hanken)"
            hover="background:#000"
          >
            Adquirir OPEN en preventa
          </Hov>
          <p style={css("font:400 12px/1.5 var(--font-hanken);color:#A8A8AE;margin:16px 0 0")}>
            Puedes pagar con USDC, ETH o cbBTC en Base — o traer fondos desde otras redes.
          </p>
        </div>
      </div>
    </main>
  );
}
