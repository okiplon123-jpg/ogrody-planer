"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { PlanLayer } from "@/components/planner/PlanLayer";
import { sampleProject } from "@/lib/sample";

const Scene3D = dynamic(() => import("@/components/planner/Scene3D"), { ssr: false });

/** The planner's own sample project, shown twice (2D and 3D) plus the live material take-off. Same data, same code as /planer. */
export function PlannerShowcase() {
  const project = useMemo(() => ({ ...sampleProject(), lighting: "golden" as const }), []);
  const ref = useRef<HTMLDivElement>(null);
  const [show3d, setShow3d] = useState(false);
  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    // the pre-rendered picture shows instantly; the live scene loads automatically when the section nears the viewport (phones get a lighter "mid" scene)
    setPhone(window.innerWidth < 768);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setShow3d(true), io.disconnect()), { rootMargin: "300px" });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);
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
          {show3d && <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}><Scene3D project={project} view="perspective" nonce={0} quality={phone ? "mid" : "high"} autoRotate lockZoom onReady={() => setReady(true)} /></div>}
          <figcaption className="label absolute left-3 top-3 bg-[var(--color-paper)] px-2 py-1">{show3d ? "model 3D — przeciągnij, aby obrócić" : "model 3D"}</figcaption>
        </figure>
      </div>

    </div>
  );
}
