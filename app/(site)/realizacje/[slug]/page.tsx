import Link from "next/link";
import { notFound } from "next/navigation";
import { Photo } from "@/components/marketing/Art";
import { PROJECTS, SERVICES } from "@/lib/content";

export function generateStaticParams() { return PROJECTS.map((p) => ({ slug: p.slug })); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = PROJECTS.find((x) => x.slug === slug);
  if (!p) notFound();
  const rel = SERVICES.filter((s) => p.services.includes(s.id));
  return (
    <article>
      <div className="relative h-[75svh] min-h-[480px]"><Photo kind={p.art} /><div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-charcoal/30" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-5 pb-12 text-white md:px-10"><p className="eyebrow text-sage">{p.cat} · projekt demonstracyjny</p><h1 className="font-serif text-6xl md:text-8xl">{p.title}</h1></div></div>
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-20 md:grid-cols-[1.3fr_1fr] md:px-10">
        <div><p className="font-serif text-3xl leading-snug md:text-4xl">{p.desc}</p>
          <div className="mt-10 grid grid-cols-2 gap-4">{(["terrace", "garden"] as const).map((k) => <div key={k} className="aspect-[4/3] overflow-hidden"><Photo kind={k === "terrace" ? p.art : "garden"} className={k === "garden" ? "" : "scale-125"} /></div>)}</div></div>
        <aside><h2 className="eyebrow mb-4 text-forest">Powiązane usługi</h2><ul className="space-y-3">{rel.map((s) => <li key={s.id}><Link href={`/uslugi#${s.id}`} className="block border-b border-charcoal/20 pb-3 font-serif text-2xl hover:text-forest">{s.title} →</Link></li>)}</ul>
          <div className="mt-10 bg-forest p-6 text-white"><p className="font-serif text-2xl">Podobna przestrzeń przy Twoim domu?</p><Link href="/planer" className="btn btn-sage mt-4">Zaprojektuj swoją posesję</Link></div></aside>
      </div>
    </article>
  );
}
