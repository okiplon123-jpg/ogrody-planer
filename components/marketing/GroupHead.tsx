/* A full-width ink band per service group: title on the left, real material textures on the right. */
export function GroupHead({ title, imgs }: { title: string; imgs: string[] }) {
  return (
    <div className="grid grid-cols-6 border-y border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)] md:grid-cols-12">
      <h3 className="h2 col-span-6 flex items-center pad md:col-span-7 md:h-20" style={{ fontSize: "clamp(2rem, 4.6vw, 3.5rem)", lineHeight: 0.95 }}>{title}</h3>
      <div className={`col-span-6 grid h-16 overflow-hidden md:col-span-5 md:h-20 ${imgs.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {imgs.map((src, i) => (
          <span key={src} className={`cell-photo h-full ${i ? "border-l border-[var(--color-paper)]" : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" />
          </span>
        ))}
      </div>
    </div>
  );
}
export const PAVER_IMGS = ["/zdjecia/kostka-jodelka-szara.jpg", "/zdjecia/kostka-geometryczna.jpg", "/zdjecia/kostka-jodelka-brazowa.jpg"];
export const GRASS_IMGS = ["/textures/grass_roll/grass_roll_diff_1k.jpg", "/textures/grass_natural/grass_natural_diff_1k.jpg"];
