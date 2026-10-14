import type { Metadata } from "next";
import PlannerLoader from "./loader";

export const metadata: Metadata = { title: "Planer ogrodu 2D/3D — NAZWA MARKI" };
export default function Page() {
  return <PlannerLoader />;
}
