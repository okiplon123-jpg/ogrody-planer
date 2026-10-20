"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const loading = () => <div className="fixed inset-0 grid place-items-center bg-[var(--color-paper)] text-sm text-[var(--color-muted)]">Ładowanie planera…</div>;
const Planner = dynamic(() => import("@/components/planner/Planner"), { ssr: false, loading });
const MobilePlanner = dynamic(() => import("@/components/planner/MobilePlanner"), { ssr: false, loading });

/** Phones get a short list-based planner; tablets and computers get the full drawing editor. */
export default function PlannerLoader() {
  const [mode, setMode] = useState<"wait" | "mobile" | "full">("wait");
  useEffect(() => {
    const forceFull = new URLSearchParams(location.search).get("pelny") === "1" || location.hash.startsWith("#p=");
    setMode(!forceFull && window.matchMedia("(max-width: 767px)").matches ? "mobile" : "full");
  }, []);
  if (mode === "wait") return loading();
  return mode === "mobile" ? <MobilePlanner /> : <Planner />;
}
