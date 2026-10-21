/* A full-width ink band per service group: title on the left, real material textures on the right. */
export function GroupHead({ title, imgs, compact = false, level = 3 }: { title: string; imgs: string[]; compact?: boolean; level?: 2 | 3 }) {
  const H = level === 2 ? "h2" : "h3";
  return (
    <div className="grid grid-cols-6 border-y border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)] md:grid-cols-12">
      <H className={`h2 col-span-6 flex items-center pad md:h-20 ${imgs.length ? "md:col-span-7" : "md:col-span-12"}`} style={{ fontSize: compact ? "clamp(1.6rem, 2.6vw, 2.2rem)" : "clamp(2rem, 4.6vw, 3.5rem)", lineHeight: 0.95 }}>{title}</H>
      {imgs.length > 0 && <div className={`col-span-6 grid h-16 overflow-hidden md:col-span-5 md:h-20 ${imgs.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {imgs.map((src, i) => (
          <span key={src} className={`cell-photo h-full bg-cover bg-center ${i ? "border-l border-[var(--color-paper)]" : ""}`} style={{ backgroundImage: `url(${src})` }} aria-hidden />
        ))}
      </div>}
    </div>
  );
}
export const PAVER_IMGS = ["/zdjecia/kostka-jodelka-szara-sm.webp", "/zdjecia/kostka-geometryczna-sm.webp", "/zdjecia/kostka-jodelka-brazowa-sm.webp"];
export const GRASS_IMGS = ["/textures/grass_roll/grass_roll_diff_512.webp", "/textures/grass_natural/grass_natural_diff_512.webp"];
