"use client";
import dynamic from "next/dynamic";

const Visualizer = dynamic(() => import("./Visualizer").then((m) => m.Visualizer), {
  ssr: false,
  loading: () => <div className="grid min-h-[420px] place-items-center text-charcoal/60">Ładowanie wizualizatora…</div>,
});
export function VisualizerLoader() {
  return <Visualizer />;
}
