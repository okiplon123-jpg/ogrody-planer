"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MATERIALS } from "@/lib/catalog";
import { textureUrl } from "@/lib/textures";

const PICK = ["kb-grafit", "kb-szara", "kb-melanz", "kb-piasek", "ks-czarna", "ks-jasna", "pt-wielko", "kn-granit"];
export function Swatches() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return (
    <div className="grid grid-cols-2 border-[1.5px] border-ink md:grid-cols-4">
      {PICK.map((id, i) => { const m = MATERIALS.find((x) => x.id === id)!; return (
        <Link href="/wizualizator" key={id} className={`group block border-ink ${i % 4 ? "md:border-l-[1.5px]" : ""} ${i % 2 ? "border-l-[1.5px] md:border-l-[1.5px]" : ""} ${i > 1 ? "border-t-[1.5px]" : ""} ${i > 3 ? "md:border-t-[1.5px]" : "md:border-t-0"}`}>
          <div className="aspect-[4/3] overflow-hidden" style={ok ? { backgroundImage: `url(${textureUrl(id, m.pattern)})`, backgroundSize: "260px" } : { background: m.color }} />
          <div className="flex items-baseline justify-between px-3 py-2"><span className="font-serif text-lg">{m.name}</span><span className="eyebrow text-rust opacity-0 transition group-hover:opacity-100">przymierz →</span></div>
        </Link>); })}
    </div>
  );
}
