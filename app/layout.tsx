import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" as const };

export const metadata: Metadata = {
  title: "Kostka brukowa i ogrody | NAZWA MARKI Białystok",
  description: "Układamy kostkę brukową i zakładamy ogrody: podjazdy, tarasy, ścieżki, trawniki, rabaty. Przymierz kostkę lub trawnik na zdjęciu swojego domu.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={archivo.variable}>
      <body>{children}</body>
    </html>
  );
}
