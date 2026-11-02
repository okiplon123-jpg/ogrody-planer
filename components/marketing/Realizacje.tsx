/* eslint-disable @next/next/no-img-element */
import { PHOTOS, BY_SERVICE, type Photo } from "@/lib/realizacje";

function Fig({ p, className = "", ratio = "aspect-square", fill = false }: { p: Photo; className?: string; ratio?: string; fill?: boolean }) {
  return (
    <figure className={`flex min-h-0 flex-col bg-[var(--color-paper)] ${className}`}>
      <span className={`cell-photo relative block ${fill ? "min-h-0 flex-1 aspect-square md:aspect-auto" : ratio}`}>
        <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async" className={fill ? "absolute inset-0" : ""} />
      </span>
      <figcaption className="label border-t border-[var(--color-rule)] px-2 py-2">{p.cap}</figcaption>
    </figure>
  );
}

/** Home page gallery: one asymmetric arrangement, real jobs only. */
export function Realizacje() {
  const P = PHOTOS;
  return (
    <section id="realizacje" className="band scroll-mt-20">
      <div className="grid grid-cols-6 gap-y-4 pad md:grid-cols-12">
        <h2 className="h2 col-span-6 md:col-span-7">realizacje.</h2>
        <p className="prose-m col-span-6 md:col-span-4 md:col-start-9">Zdjęcia z naszych robót, także w trakcie pracy. Tak wygląda podbudowa, zanim pojawi się kostka.</p>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-px border-y border-[var(--color-ink)] bg-[var(--color-ink)] md:grid-cols-12">
        <Fig p={P.kostkaZolta} className="col-span-2 md:col-span-7" ratio="aspect-[4/3]" />
        <Fig p={P.chodnikDonice} className="md:col-span-5" fill />
        <Fig p={P.placPlyty} className="md:col-span-4" />
        <Fig p={P.sciezkaZolta} className="md:col-span-4" />
        <Fig p={P.szaraJodelka} className="md:col-span-4" />
        <Fig p={P.rozeta} className="md:col-span-5" ratio="aspect-[4/3]" />
        <Fig p={P.plytyLuk} className="md:col-span-4" />
        <Fig p={P.bobcat} className="md:col-span-3" fill />
      </div>
    </section>
  );
}

/** Per-service strip of three photos; renders nothing when the service has no matching real photos. */
export function ServicePhotos({ slug, title }: { slug: string; title: string }) {
  const list = BY_SERVICE[slug];
  if (!list?.length) return null;
  return (
    <section className="band">
      <h2 className="h2 pad">{title}: nasze realizacje.</h2>
      <div className="mt-10 grid grid-cols-1 gap-px border-y border-[var(--color-ink)] bg-[var(--color-ink)] md:grid-cols-3">
        {list.map((p) => <Fig key={p.src} p={p} ratio="aspect-[4/3]" />)}
      </div>
    </section>
  );
}
