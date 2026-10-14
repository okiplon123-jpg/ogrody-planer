"use client";
import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, PROJECTS } from "@/lib/content";
import { Photo } from "./Art";

export function Portfolio({ limit }: { limit?: number }) {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("Wszystkie");
  const list = PROJECTS.filter((p) => cat === "Wszystkie" || p.cat === cat).slice(0, limit);
  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-2" role="tablist" aria-label="Kategorie realizacji">
        {CATEGORIES.map((c) => <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={`border px-4 py-2 text-[12px] tracking-wider transition ${cat === c ? "border-forest bg-forest text-white" : "border-charcoal/25 hover:border-forest"}`}>{c}</button>)}
      </div>
      {list.length === 0 ? <p className="py-20 text-center text-stone">W tej kategorii nie ma jeszcze przykładowych projektów.</p> : (
        <div className="grid auto-rows-[260px] gap-4 md:grid-cols-12 md:auto-rows-[300px]">
          {list.map((p) => (
            <Link key={p.slug} href={`/realizacje/${p.slug}`} className={`group relative block overflow-hidden ${p.span}`}>
              <div className="absolute inset-0 transition duration-[1400ms] ease-out group-hover:scale-105"><Photo kind={p.art} /></div>
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-80 transition group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="eyebrow text-sage">{p.cat} · projekt demonstracyjny</p>
                <h3 className="mt-1 font-serif text-3xl leading-tight">{p.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
