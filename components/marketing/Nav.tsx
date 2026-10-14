"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [["/o-nas", "O nas"], ["/uslugi", "Usługi"], ["/realizacje", "Realizacje"], ["/wizualizator", "Wizualizator"], ["/kontakt", "Kontakt"]] as const;
export function Nav() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const overHero = path === "/" || path.startsWith("/realizacje/");
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);
  const solid = scrolled || !overHero || open;
  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${solid ? "bg-forest/95 py-3 shadow-lg backdrop-blur" : "bg-transparent py-6"}`}>
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 md:px-10">
        <Link href="/" className="flex items-center gap-3 text-white" aria-label="NAZWA MARKI — strona główna">
          <span className="grid h-9 w-9 place-items-center border border-sage font-serif text-xl text-sage">N</span>
          <span className="font-serif text-2xl leading-none tracking-wide">NAZWA MARKI</span>
        </Link>
        <nav className="hidden items-center gap-6 xl:gap-8 lg:flex" aria-label="Główna nawigacja">
          {LINKS.map(([h, n]) => <Link key={h} href={h} className={`whitespace-nowrap text-[13px] tracking-wide transition hover:text-sage ${path.startsWith(h) ? "text-sage" : "text-white/90"}`}>{n}</Link>)}
          <Link href="/wizualizator" className="btn btn-sage whitespace-nowrap !px-4 !py-2.5 !text-[11px]">Przymierz kostkę</Link>
        </nav>
        <button className="text-white lg:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 7h18M3 12h18M3 17h18" />}</svg>
        </button>
      </div>
      {open && (
        <div className="border-t border-white/10 px-5 pb-6 pt-4 lg:hidden">
          {LINKS.map(([h, n]) => <Link key={h} href={h} className="block py-3 font-serif text-2xl text-white">{n}</Link>)}
          <Link href="/wizualizator" className="btn btn-sage mt-4 w-full justify-center">Przymierz kostkę</Link>
        </div>
      )}
    </header>
  );
}
