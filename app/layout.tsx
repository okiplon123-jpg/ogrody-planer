import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin", "latin-ext"], axes: ["opsz"] });
const mono = IBM_Plex_Mono({ variable: "--font-plexmono", subsets: ["latin", "latin-ext"], weight: ["400", "500"] });
const body = Instrument_Sans({ variable: "--font-body", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "Kostka brukowa — podjazdy, tarasy, ścieżki | NAZWA MARKI [miasto]",
  description: "Układamy kostkę brukową: podjazdy, tarasy, ścieżki i place. Przymierz kostkę na zdjęciu swojego domu w wizualizatorze.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${display.variable} ${mono.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
