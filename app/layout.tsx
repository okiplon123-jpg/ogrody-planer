import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { COMPANY, SITE_URL } from "@/lib/site";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" as const };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Kostka brukowa i ogrody Białystok | Gryczewski", template: "%s" },
  description: "Układamy kostkę brukową i zakładamy ogrody w Białymstoku i okolicach: podjazdy, tarasy, ścieżki, trawniki, rabaty. Przymierz kostkę lub trawnik na zdjęciu swojego domu.",
  alternates: { canonical: "./" },
  openGraph: { type: "website", locale: "pl_PL", siteName: "Gryczewski: kostka brukowa i ogrody", url: "./" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": `${SITE_URL}/#firma`,
  name: COMPANY.legalName,
  alternateName: "Gryczewski: kostka brukowa i ogrody",
  url: SITE_URL,
  telephone: "+48 885 879 108",
  email: COMPANY.email,
  taxID: COMPANY.nip,
  description: "Układanie kostki brukowej (podjazdy, tarasy, ścieżki, place) oraz zakładanie ogrodów (trawniki, rabaty, nasadzenia) w Białymstoku i okolicach.",
  address: { "@type": "PostalAddress", streetAddress: COMPANY.street, postalCode: COMPANY.postalCode, addressLocality: COMPANY.city, addressCountry: "PL" },
  areaServed: { "@type": "City", name: "Białystok" },
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "07:00", closes: "18:00" }],
  makesOffer: ["Układanie kostki brukowej", "Podjazdy i wjazdy", "Tarasy", "Ścieżki i chodniki", "Zakładanie trawników", "Projekt i zakładanie ogrodów"].map((n) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n } })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={archivo.variable}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
