"use client";
import { useEffect, useState } from "react";
import type { LibItem } from "@/lib/catalog";
import { matById } from "@/lib/catalog";
import { textureUrl } from "@/lib/textures";
import { Glyph } from "./PlanLayer";
import type { Pattern } from "@/lib/types";

export function NumField({ label, value, onCommit, min = 0, max = 999, step = 0.1, suffix = "m", scale = 1 }: { label?: string; value: number; onCommit: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string; scale?: number }) {
  const show = (v: number) => String(Math.round(v * scale * 100) / 100);
  const [t, setT] = useState(show(value));
  useEffect(() => setT(show(value)), [value, scale]); // eslint-disable-line react-hooks/exhaustive-deps
  const commit = () => {
    const n = parseFloat(t.replace(",", "."));
    if (Number.isFinite(n)) onCommit(Math.max(min, Math.min(max, n / scale)));
    else setT(show(value));
  };
  return (
    <label className="block min-w-[64px]">
      {label && <span className="pl-label mb-1 block">{label}</span>}
      <span className="relative block">
        <input className="pl-input pr-6" inputMode="decimal" value={t} step={step} onChange={(e) => setT(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-muted)]">{suffix}</span>
      </span>
    </label>
  );
}

export function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; name: string }[]; onChange: (v: T) => void; label?: string }) {
  return (
    <div>
      {label && <div className="pl-label mb-1">{label}</div>}
      <div className="flex border border-[var(--color-rule)]" role="radiogroup">
        {options.map((o) => (
          <button key={o.id} role="radio" aria-checked={value === o.id} onClick={() => onChange(o.id)} className={`flex-1 px-2 py-1.5 text-[11px] transition ${value === o.id ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)] font-semibold" : "text-[var(--color-ink-2)] hover:bg-[var(--color-paper-2)]"}`}>{o.name}</button>
        ))}
      </div>
    </div>
  );
}

export function MatSwatch({ id, pattern, size = 56 }: { id: string; pattern?: Pattern; size?: number }) {
  const m = matById(id);
  return <span className="block shrink-0" style={{ width: size, height: size, backgroundImage: m.photo ? `url(/textures/${m.photo.dir}/${m.photo.dir}_diff_512.jpg)` : `url(${textureUrl(id, pattern ?? m.pattern)})`, backgroundSize: `${size * 1.4}px` }} />;
}

export function ItemThumb({ item }: { item: LibItem }) {
  if (item.material) return <MatSwatch id={item.material} size={52} />;
  const k = 1.7 / Math.max(item.w, item.h);
  const o = { id: "t", kind: item.kind, x: 0, y: 0, w: item.w * k, h: item.h * k, rot: 0, species: item.species };
  return (
    <svg viewBox="-1 -1 2 2" width={52} height={52} aria-hidden="true" className="shrink-0 bg-[var(--color-sample-ground)]"><Glyph o={o} lit={false} /></svg>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="pl-label mb-1">{label}</div>{children}</div>;
}
export function Select<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { id: T; name: string }[] }) {
  return (
    <select className="pl-input" value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
    </select>
  );
}
