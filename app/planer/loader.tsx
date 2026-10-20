"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const loading = () => <div className="fixed inset-0 grid place-items-center bg-[var(--color-paper)] text-sm text-[var(--color-muted)]">Ładowanie planera…</div>;
const Planner = dynamic(() => import("@/components/planner/Planner"), { ssr: false, loading });
const PlannerPhone = dynamic(() => import("@/components/planner/PlannerPhone"), { ssr: false, loading });

/** One planner, two shells: phones get the bottom-dock layout, tablets and computers the side-palette layout. */
export default function PlannerLoader() {
  const [mode, setMode] = useState<"wait" | "phone" | "desktop">("wait");
  useEffect(() => { setMode(window.matchMedia("(max-width: 767px)").matches ? "phone" : "desktop"); }, []);
  if (mode === "wait") return loading();
  return mode === "phone" ? <PlannerPhone /> : <Planner />;
}
