"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PlanLayer } from "@/components/planner/PlanLayer";
import { sampleProject } from "@/lib/sample";
import { fmtM, fmtM2, summarize } from "@/lib/summary";

const Scene3D = dynamic(() => import("@/components/planner/Scene3D"), { ssr: false });

const FACTS: [string, string][] = [
  ["rysujesz", "Ścieżki, trawniki i rabaty z krzywymi krawędziami, także odręcznie."],
  ["wybierasz", "Rodzaj kostki, trawnik, rośliny. Ten sam projekt widać w 2D i w 3D."],
  ["oglądasz", "Model 3D przy świetle dziennym, o zachodzie i wieczorem."],
  ["liczysz", "Planer sam podaje, ile m² kostki i trawnika oraz ile metrów obrzeży i ogrodzenia."],
];

/** The planner's own sample project, shown twice (2D and 3D) plus the live material take-off. Same data, same code as /planer. */
export function PlannerShowcase() {
  const project = useMemo(() => ({ ...sampleProject(), lighting: "golden" as const }), []);
  const sum = useMemo(() => summarize(project, 8), [project]);
  const ref = useRef<HTMLDivElement>(null);
  const [show3d, setShow3d] = useState(false);
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    // phones get the pre-rendered picture and load the live 3D scene only on tap; desktops load it when the section nears the viewport
    const isPhone = window.innerWidth < 768;
    setPhone(isPhone);
    if (isPhone) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setShow3d(true), io.disconnect()), { rootMargin: "300px" });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);
  const rows: [string, string][] = [
    ["kostka i nawierzchnie", fmtM2(sum.paved)],
    ["trawnik", fmtM2(sum.lawn)],
    ["rabaty", fmtM2(sum.beds)],
    ["obrzeża", fmtM(sum.edging)],
    ["ogrodzenie", fmtM(sum.fence)],
  ];
  return (
    <div ref={ref}>
      <div className="grid border-y border-[var(--color-ink)] md:grid-cols-12">
        <figure className="relative bg-[var(--color-paper-3)] md:col-span-5">
          <svg viewBox={`-2 -2 ${project.plot.w + 4} ${project.plot.l + 8}`} role="img" aria-label="Plan 2D projektu przykładowego" className="mx-auto block h-[420px] w-full md:h-[560px]"><PlanLayer project={project} /></svg>
          <figcaption className="label absolute left-3 top-3 bg-[var(--color-paper)] px-2 py-1">plan 2D</figcaption>
        </figure>
        <figure className="relative min-h-[360px] border-t border-[var(--color-ink)] bg-[var(--color-paper-3)] md:col-span-7 md:min-h-[560px] md:border-l md:border-t-0">
          {/* pre-rendered frame of the same scene: instant, sharp, and the fallback while the live model loads */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/zdjecia/model-3d.jpg" srcSet="/zdjecia/model-3d-sm.jpg 900w, /zdjecia/model-3d.jpg 1748w" sizes="(min-width: 768px) 58vw, 100vw" alt="Model 3D przykładowego ogrodu: dom z garażem, trawnik, rabaty i ścieżka" className="absolute inset-0 h-full w-full object-cover" />
          {show3d && <div className="absolute inset-0"><Scene3D project={project} view="perspective" nonce={0} quality={phone ? "low" : "high"} autoRotate lockZoom /></div>}
          {phone && !show3d && <button type="button" className="btn btn-dark absolute bottom-4 left-1/2 -translate-x-1/2" onClick={() => setShow3d(true)}>obróć model w 3D</button>}
          <figcaption className="label absolute left-3 top-3 bg-[var(--color-paper)] px-2 py-1">{show3d ? "model 3D — przeciągnij, aby obrócić" : "model 3D"}</figcaption>
        </figure>
      </div>

      <ul className="cells grid grid-cols-2 border-b border-[var(--color-ink)] md:grid-cols-4">
        {FACTS.map(([k, d], i) => (
          <li key={k} className={`px-4 py-5 md:px-6 ${i > 1 ? "border-t border-[var(--color-rule)] md:border-t-0" : ""} ${i % 2 ? "border-l border-[var(--color-ink)]" : ""}`}>
            <p className="h3">{k}</p>
            <p className="mt-2 text-[var(--color-ink-2)]">{d}</p>
          </li>
        ))}
      </ul>

      <div className="pad pt-10">
        <p className="label">ile czego w tym projekcie</p>
      </div>
      <ul className="mt-4 grid grid-cols-2 border-y border-[var(--color-ink)] md:grid-cols-5">
        {rows.map(([k, v], i) => (
          <li key={k} className={`px-4 py-5 md:px-6 ${i % 2 ? "border-l border-[var(--color-ink)]" : ""} ${i > 1 ? "border-t border-[var(--color-rule)] md:border-t-0" : ""} ${i > 0 ? "md:border-l md:border-[var(--color-ink)]" : "md:border-l-0"}`}>
            <p className="label">{k}</p>
            <p className="h2 tnum mt-2 whitespace-nowrap" style={{ fontSize: "var(--text-xl)" }}>{v}</p>
          </li>
        ))}
      </ul>
      <p className="pad mt-3 text-[var(--text-xs)] text-[var(--color-muted)]">Projekt przykładowy, nie prawdziwa działka. Wartości liczone z narysowanego planu, kostka i nawierzchnie bez zapasu.</p>
      <div className="pad mt-8 flex flex-wrap items-center gap-3">
        <Link href="/planer" className="btn btn-dark">otwórz planer ogrodu</Link>
        <span className="text-[var(--color-ink-2)]">Zaczynasz od pustej działki albo od tego przykładu. Projekt zapisuje się w Twojej przeglądarce.</span>
      </div>
    </div>
  );
}
