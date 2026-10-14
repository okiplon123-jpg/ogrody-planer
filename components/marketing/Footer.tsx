import Link from "next/link";
export function Footer() {
  return (
    <footer className="border-t-[1.5px] border-ink bg-ink text-paper">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-serif text-5xl leading-none md:text-7xl">Zadzwoń:<br /><a href="tel:+48000000000" className="text-rust">[telefon]</a></p>
          <p className="eyebrow mt-6 text-paper/60">[adres e-mail] · [adres firmy] · pn–pt [godziny]</p>
        </div>
        <ul className="eyebrow space-y-3">{[["/uslugi", "Co układamy"], ["/wizualizator", "Wizualizator kostki"], ["/planer", "Planer ogrodu (beta)"], ["/o-nas", "O nas"], ["/kontakt", "Kontakt"]].map(([h, n]) => <li key={h}><Link href={h} className="hover:text-rust">{n} →</Link></li>)}</ul>
        <div className="eyebrow space-y-3 text-paper/60"><p>Facebook [link]</p><p>Instagram [link]</p><Link href="/polityka-prywatnosci" className="block hover:text-rust">Polityka prywatności</Link><Link href="/polityka-prywatnosci#cookies" className="block hover:text-rust">Ustawienia cookies</Link></div>
      </div>
      <div className="eyebrow border-t border-paper/20 px-5 py-4 text-paper/50 md:px-8">© NAZWA MARKI · Wersja robocza: dane firmy w nawiasach [ ] do uzupełnienia.</div>
    </footer>
  );
}
