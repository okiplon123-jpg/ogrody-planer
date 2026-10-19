import Link from "next/link";

/* Ft4 dense colophon: contact and sitemap in one ruled block. */
export function Footer() {
  return (
    <footer className="colophon">
      <div className="shell">
        <div className="grid grid-cols-6 gap-y-8 pad py-12 md:grid-cols-12">
          <div className="col-span-6 md:col-span-5">
            <p className="wordmark">nazwa marki<span className="period" aria-hidden /></p>
            <p className="label mt-3">kostka brukowa · [miasto i okolice]</p>
          </div>
          <address className="col-span-6 not-italic md:col-span-4">
            <p className="label">kontakt</p>
            <p className="mt-2"><a href="tel:+48000000000" className="tnum font-bold">[telefon]</a></p>
            <p>[adres e-mail]</p>
            <p>[adres firmy]</p>
            <p>pn–pt [godziny]</p>
          </address>
          <nav className="col-span-6 md:col-span-3" aria-label="Mapa strony">
            <p className="label">strona</p>
            <ul className="mt-2 space-y-1">
              <li><Link href="/uslugi">usługi</Link></li>
              <li><Link href="/wizualizator">wizualizator kostki</Link></li>
              <li><Link href="/planer">planer ogrodu (beta)</Link></li>
              <li><Link href="/o-nas">o nas</Link></li>
              <li><Link href="/kontakt">kontakt</Link></li>
              <li><Link href="/polityka-prywatnosci">polityka prywatności</Link></li>
              <li><Link href="/polityka-prywatnosci#cookies">ustawienia cookies</Link></li>
            </ul>
          </nav>
        </div>
        <p className="label pad border-t border-[var(--color-rule)] py-4">© nazwa marki · wersja robocza: dane w nawiasach [ ] do uzupełnienia</p>
      </div>
    </footer>
  );
}
