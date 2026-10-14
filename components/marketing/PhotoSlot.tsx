/** Honest placeholder for a real photo. Replace by passing `src`. */
export function PhotoSlot({ brief, src, className = "", alt = "", stock = false }: { brief: string; src?: string; className?: string; alt?: string; stock?: boolean }) {
  if (src) return (
    <div className="relative h-full w-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" className={`h-full w-full object-cover ${className}`} />
      {stock && <span className="eyebrow absolute bottom-2 left-2 bg-paper/90 px-2 py-1 text-[10px] text-ink/70">zdjęcie poglądowe</span>}
    </div>
  );
  return (
    <div className={`hatch relative flex h-full w-full flex-col justify-between border-[1.5px] border-dashed border-ink/50 bg-concrete/50 p-4 ${className}`} role="img" aria-label={`Miejsce na zdjęcie: ${brief}`}>
      <span className="eyebrow text-rust">[ZDJĘCIE]</span>
      <span className="eyebrow max-w-[30ch] text-ink/70">{brief}</span>
    </div>
  );
}
