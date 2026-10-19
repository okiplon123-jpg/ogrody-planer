import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { StickyCall } from "@/components/marketing/StickyCall";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky-pad">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-[var(--color-accent)] focus:p-3">przejdź do treści</a>
      <Nav />
      <main id="main" className="shell">
        <div className="rails" aria-hidden />
        {children}
      </main>
      <Footer />
      <StickyCall />
    </div>
  );
}
