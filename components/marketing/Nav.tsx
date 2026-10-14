"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [["/uslugi", "Co układamy"], ["/realizacje", "Realizacje"], ["/wizualizator", "Wizualizator"], ["/o-nas", "O nas"], ["/kontakt", "Kontakt"]] as const;
export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  return (
    <header className="sticky top-0 z-40 border-b-[1.5px] border-ink bg-paper">
      <div className="mx-auto flex max-w-[1500px] items-stretch justify-between">
        <Link href="/" className="flex items-center gap-3 px-5 py-4 md:px-8" aria-label="NAZWA MARKI — strona główna">
          <span className="grid h-9 w-9 place-items-center border-[1.5px] border-rust font-serif text-xl text-rust">N</span>
          <span className="leading-none"><span className="block font-serif text-xl">NAZWA MARKI</span><span className="eyebrow mt-1 block text-ink/60">kostka brukowa · [miasto]</span></span>
        </Link>
        <nav className="hidden items-stretch lg:flex" aria-label="Główna nawigacja">
          {LINKS.map(([h, n]) => <Link key={h} href={h} className={`eyebrow flex items-center border-l-[1.5px] border-ink px-5 transition hover:bg-ink hover:text-paper ${path.startsWith(h) ? "bg-concrete" : ""}`}>{n}</Link>)}
          <a href="tel:+48000000000" className="eyebrow flex items-center border-l-[1.5px] border-ink bg-rust px-6 text-white transition hover:bg-ink">Zadzwoń [telefon]</a>
        </nav>
        <button className="border-l-[1.5px] border-ink px-5 lg:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">{open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 7h18M3 12h18M3 17h18" />}</svg>
        </button>
      </div>
      {open && (
        <div className="border-t-[1.5px] border-ink lg:hidden">
          {LINKS.map(([h, n]) => <Link key={h} href={h} className="block border-b border-ink/20 px-5 py-4 font-serif text-3xl">{n}</Link>)}
          <a href="tel:+48000000000" className="eyebrow block bg-rust px-5 py-5 text-white">Zadzwoń [telefon]</a>
        </div>
      )}
    </header>
  );
}
