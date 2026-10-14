"use client";
import { useRef, useState } from "react";
import { Art } from "./Art";

export function BeforeAfter() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(50);
  const move = (x: number) => { const r = ref.current!.getBoundingClientRect(); setP(Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100))); };
  return (
    <div ref={ref} className="relative aspect-[16/10] w-full cursor-ew-resize touch-none select-none overflow-hidden"
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); move(e.clientX); }}
      onPointerMove={(e) => e.buttons && move(e.clientX)}>
      <div className="absolute inset-0"><Art kind="house" /></div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - p}% 0 0)` }}><Art kind="before" /></div>
      <span className="absolute left-4 top-4 bg-charcoal/80 px-3 py-1 text-[11px] font-medium tracking-[.2em] text-white">PRZED</span>
      <span className="absolute right-4 top-4 bg-sage px-3 py-1 text-[11px] font-medium tracking-[.2em] text-charcoal">PO</span>
      <div className="absolute inset-y-0 w-px bg-white shadow-[0_0_12px_rgba(0,0,0,.4)]" style={{ left: `${p}%` }}>
        <button role="slider" aria-label="Porównanie przed i po" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p)}
          onKeyDown={(e) => { if (e.key === "ArrowLeft") setP((v) => Math.max(0, v - 4)); if (e.key === "ArrowRight") setP((v) => Math.min(100, v + 4)); }}
          className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white bg-forest text-white shadow-xl">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  );
}
