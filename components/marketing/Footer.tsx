import Link from "next/link";
import { SERVICES } from "@/lib/content";
export function Footer() {
  return (
    <footer className="bg-charcoal text-white/80">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 md:grid-cols-4 md:px-10">
        <div>
          <div className="flex items-center gap-3 text-white"><span className="grid h-9 w-9 place-items-center border border-sage font-serif text-xl text-sage">N</span><span className="font-serif text-2xl">NAZWA MARKI</span></div>
          <p className="mt-4 text-sm leading-relaxed text-white/60">Miejsce na logo i opis firmy. Wszystkie dane kontaktowe na tej stronie to wartości zastępcze.</p>
        </div>
        <div><h4 className="eyebrow mb-4 text-sage">Nawigacja</h4><ul className="space-y-2 text-sm">{[["/o-nas", "O nas"], ["/uslugi", "Usługi"], ["/realizacje", "Realizacje"], ["/planer", "Planer ogrodu"], ["/kontakt", "Kontakt"]].map(([h, n]) => <li key={h}><Link href={h} className="hover:text-sage">{n}</Link></li>)}</ul></div>
        <div><h4 className="eyebrow mb-4 text-sage">Usługi</h4><ul className="space-y-2 text-sm">{SERVICES.map((s) => <li key={s.id}><Link href="/uslugi" className="hover:text-sage">{s.title}</Link></li>)}</ul></div>
        <div><h4 className="eyebrow mb-4 text-sage">Kontakt</h4>
          <ul className="space-y-2 text-sm text-white/60"><li>[adres e-mail]</li><li>[numer telefonu]</li><li>[adres firmy]</li></ul>
          <div className="mt-5 flex gap-3 text-xs text-white/50">{["Facebook", "Instagram", "YouTube"].map((n) => <span key={n} className="border border-white/20 px-2 py-1">{n} [link]</span>)}</div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-xs text-white/50 md:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-wrap justify-between gap-3"><span>© NAZWA MARKI. Strona demonstracyjna — ilustracje i projekty są przykładowe.</span>
          <span className="flex gap-5"><Link href="/polityka-prywatnosci" className="hover:text-sage">Polityka prywatności</Link><Link href="/polityka-prywatnosci#cookies" className="hover:text-sage">Ustawienia cookies</Link></span></div>
      </div>
    </footer>
  );
}
