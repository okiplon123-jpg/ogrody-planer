"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { PlanLayer } from "@/components/planner/PlanLayer";
import { sampleProject } from "@/lib/sample";

const Scene3D = dynamic(() => import("@/components/planner/Scene3D"), { ssr: false });

/** Both views render the SAME project object (the planner's sample project). */
export function PlannerShowcase() {
  const project = useMemo(() => sampleProject(), []);
  const ref = useRef<HTMLDivElement>(null);
  const [show3d, setShow3d] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setShow3d(true), io.disconnect()), { rootMargin: "200px" });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="grid gap-px overflow-hidden border border-white/15 bg-white/15 shadow-2xl md:grid-cols-2">
      <div className="relative bg-[#1a211d] p-3">
        <span className="eyebrow absolute left-5 top-5 z-10 bg-charcoal/80 px-2 py-1 text-sage">2D plan</span>
        <svg viewBox={`-2 -2 ${project.plot.w + 4} ${project.plot.l + 10}`} className="mx-auto block h-[420px] w-full md:h-[560px]" aria-label="Plan 2D projektu przykładowego"><PlanLayer project={project} /></svg>
      </div>
      <div className="relative min-h-[420px] bg-[#cfe2ec] md:min-h-[560px]">
        <span className="eyebrow absolute left-5 top-5 z-10 bg-charcoal/80 px-2 py-1 text-sage">Wizualizacja 3D</span>
        {show3d ? <Scene3D project={{ ...project, lighting: "golden" }} view="perspective" nonce={0} quality="low" autoRotate lockZoom /> : <div className="grid h-full place-items-center text-sm text-charcoal/50">Ładowanie sceny 3D…</div>}
        <span className="absolute bottom-3 right-4 z-10 text-[10px] text-charcoal/70">Przeciągnij, aby obrócić</span>
      </div>
    </div>
  );
}
