/** Honest placeholder for a real photo. Replace by passing `src`. */
export function PhotoSlot({ brief, src, className = "", alt = "" }: { brief: string; src?: string; className?: string; alt?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (src) return <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} />;
  return (
    <div className={`hatch relative flex h-full w-full flex-col justify-between border-[1.5px] border-dashed border-ink/50 bg-concrete/50 p-4 ${className}`} role="img" aria-label={`Miejsce na zdjęcie: ${brief}`}>
      <span className="eyebrow text-rust">[ZDJĘCIE]</span>
      <span className="eyebrow max-w-[30ch] text-ink/70">{brief}</span>
    </div>
  );
}
