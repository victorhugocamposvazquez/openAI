import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import Header from "@/components/Header";
import Marquee from "@/components/Marquee";
import Footer from "@/components/Footer";
import { MobileNav, MobileCta } from "@/components/MobileNav";
import { WalletModal, ProviderModal, SuccessModal, Toast } from "@/components/Modals";
import { brandLegal } from "@/lib/brand-legal";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-hanken", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "openAI Protocol — Token OPEN",
  description: brandLegal.suggestedTagline + " " + brandLegal.affiliationNoticeSoft,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${hanken.variable} ${mono.variable}`}>
      <body>
        <AppProvider>
          <div data-pad style={{ minHeight: "100vh", background: "#fff" }}>
            <Header />
            <Marquee />
            {children}
            <Footer />
            <MobileCta />
            <MobileNav />
          </div>
          <WalletModal />
          <ProviderModal />
          <SuccessModal />
          <Toast />
        </AppProvider>
      </body>
    </html>
  );
}
