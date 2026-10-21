import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { COMPANY, SITE_URL } from "@/lib/site";
import { Tracking } from "@/components/marketing/Tracking";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" as const };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Układanie kostki brukowej Białystok | Gryczewski", template: "%s" },
  description: "Układanie kostki brukowej w Białymstoku i okolicach. Wycena po obejrzeniu terenu, bez zobowiązań. Podjazdy, tarasy, ścieżki, ogrody, prace ziemne.",
  alternates: { canonical: "./" },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon-48.png", sizes: "48x48", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  openGraph: { type: "website", locale: "pl_PL", siteName: "Gryczewski: kostka brukowa i ogrody", url: "./", images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Układanie kostki brukowej i ogrody, Białystok i okolice" }] },
  twitter: { card: "summary_large_image", images: ["/og-image.png"] },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": `${SITE_URL}/#firma`,
  name: COMPANY.legalName,
  alternateName: "Gryczewski: kostka brukowa i ogrody",
  url: SITE_URL,
  image: `${SITE_URL}/og-image.png`,
  logo: `${SITE_URL}/apple-touch-icon.png`,
  telephone: "+48 885 879 108",
  email: COMPANY.email,
  taxID: COMPANY.nip,
  description: "Układanie kostki brukowej (podjazdy, tarasy, ścieżki, place) oraz zakładanie ogrodów (trawniki, rabaty, nasadzenia) w Białymstoku i okolicach.",
  address: { "@type": "PostalAddress", streetAddress: COMPANY.street, postalCode: COMPANY.postalCode, addressLocality: COMPANY.city, addressCountry: "PL" },
  areaServed: { "@type": "City", name: "Białystok" },
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "07:00", closes: "18:00" }],
  makesOffer: ["Układanie kostki brukowej", "Podjazdy i wjazdy", "Tarasy", "Ścieżki i chodniki", "Zakładanie trawników", "Projekt i zakładanie ogrodów", "Prace ziemne i korytowanie"].map((n) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n } })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={archivo.variable}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Tracking />
        {children}
      </body>
    </html>
  );
}
