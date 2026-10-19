import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

export const metadata: Metadata = {
  title: "Kostka brukowa — podjazdy, tarasy, ścieżki | NAZWA MARKI [miasto]",
  description: "Układamy kostkę brukową: podjazdy, tarasy, ścieżki i place. Przymierz kostkę na zdjęciu swojego domu w wizualizatorze.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={archivo.variable}>
      <body>{children}</body>
    </html>
  );
}
