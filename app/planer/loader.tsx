"use client";
import dynamic from "next/dynamic";

const Planner = dynamic(() => import("@/components/planner/Planner"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 grid place-items-center bg-[#141816] text-sm text-[#8b918a]">Ładowanie planera…</div>,
});
export default function PlannerLoader() {
  return <Planner />;
}
