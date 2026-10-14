"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Art } from "./Art";

const STRIP = ["Kostka brukowa", "Ogrody i trawniki", "Tarasy i ścieżki", "Kompleksowa realizacja"];
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".h-line", { yPercent: 110, opacity: 0, duration: 1.3, ease: "power4.out", stagger: 0.14, delay: 0.2 });
      gsap.from(".h-fade", { y: 24, opacity: 0, duration: 1.1, ease: "power3.out", stagger: 0.12, delay: 0.8 });
      gsap.fromTo(bg.current, { scale: 1.12 }, { scale: 1.02, duration: 2.6, ease: "power2.out" });
    }, root);
    const onScroll = () => { if (bg.current && window.scrollY < 1000) bg.current.style.transform = `translateY(${window.scrollY * 0.25}px) scale(1.02)`; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { ctx.revert(); window.removeEventListener("scroll", onScroll); };
  }, []);
  return (
    <section ref={root} className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-charcoal text-white">
      <div ref={bg} className="absolute inset-0 will-change-transform"><Art kind="house" /></div>
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-charcoal/50" />
      <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-40 pt-40 md:px-10">
        <p className="h-fade eyebrow mb-6 text-sage">Nawierzchnie · ogrody · zagospodarowanie posesji</p>
        <h1 className="font-serif text-[clamp(3.2rem,9vw,8.5rem)] font-medium leading-[0.95]">
          <span className="block overflow-hidden"><span className="h-line block">Przestrzeń,</span></span>
          <span className="block overflow-hidden"><span className="h-line block italic text-sage">która robi wrażenie.</span></span>
        </h1>
        <p className="h-fade mt-8 max-w-xl text-lg leading-relaxed text-white/80">Projektujemy i realizujemy nawierzchnie, ogrody oraz kompletne zagospodarowanie posesji. Od pierwszego pomysłu po gotową przestrzeń.</p>
        <div className="h-fade mt-10 flex flex-wrap gap-4">
          <Link href="/planer" className="btn btn-sage">Zaprojektuj swoją posesję</Link>
          <Link href="/realizacje" className="btn btn-ghost">Zobacz realizacje</Link>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 border-t border-white/20 bg-charcoal/55 backdrop-blur-sm">
        <ul className="mx-auto grid max-w-[1400px] grid-cols-2 md:grid-cols-4">
          {STRIP.map((t, i) => <li key={t} className="flex items-center gap-3 border-white/15 px-5 py-4 text-[13px] tracking-wide md:border-l md:px-10 first:md:border-l-0"><span className="font-serif text-sage">0{i + 1}</span>{t}</li>)}
        </ul>
      </div>
    </section>
  );
}
