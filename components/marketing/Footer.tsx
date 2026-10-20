import Link from "next/link";
import { SERVICES } from "@/lib/services";

/* Ft4 dense colophon: contact and sitemap in one ruled block. */
export function Footer() {
  return (
    <footer className="colophon" data-nosnippet>
      <div className="shell">
        <div className="grid grid-cols-6 gap-y-8 pad py-12 md:grid-cols-12">
          <div className="col-span-6 md:col-span-5">
            <p className="wordmark">gryczewski<span className="period" aria-hidden /></p>
            <p className="label mt-3">kostka brukowa i ogrody · Białystok i okolice</p>
            <p className="mt-2 text-sm">Roboty budowlano-drogowe Patryk Gryczewski</p>
          </div>
          <address className="col-span-6 not-italic md:col-span-4">
            <p className="label">kontakt</p>
            <p className="mt-2">Patryk Gryczewski</p>
            <p><a href="tel:+48885879108" className="tnum font-bold">+48 885 879 108</a></p>
            <p>gryczewski.bud@gmail.com</p>
            <p>ul. Tysiąclecia P.P, 15-111 Białystok</p>
            <p>pn–pt 7:00–18:00</p>
            <p>NIP 5423470508</p>
          </address>
          <nav className="col-span-6 md:col-span-3" aria-label="Mapa strony">
            <p className="label">strona</p>
            <ul className="mt-2 space-y-1">
              <li><Link href="/uslugi">usługi</Link></li>
              {SERVICES.map((x) => <li key={x.slug}><Link href={`/${x.slug}`}>{x.short}</Link></li>)}
              <li><Link href="/wizualizator">wizualizator kostki</Link></li>
              <li><Link href="/planer">planer ogrodu</Link></li>
              <li><Link href="/o-nas">o nas</Link></li>
              <li><Link href="/kontakt">kontakt</Link></li>
              <li><Link href="/polityka-prywatnosci">polityka prywatności</Link></li>
              <li><Link href="/polityka-prywatnosci#cookies">ustawienia cookies</Link></li>
            </ul>
          </nav>
        </div>
        <p className="label pad border-t border-[var(--color-rule)] py-4">© ROBOTY BUDOWLANO-DROGOWE PATRYK GRYCZEWSKI · NIP 5423470508</p>
      </div>
    </footer>
  );
}
