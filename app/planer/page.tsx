import type { Metadata } from "next";
import PlannerLoader from "./loader";

export const metadata: Metadata = {
  title: "Planer ogrodu 2D/3D: policz kostkę i trawnik | Gryczewski",
  description: "Zaplanuj podjazd, taras, ścieżki, trawnik i rabaty w 2D i 3D. Planer policzy, ile kostki i trawnika potrzeba, a gotowy projekt wyślesz do firmy Gryczewski z Białegostoku.",
  alternates: { canonical: "/planer" },
};

export default function Page() {
  return (
    <>
      {/* the editor is a client-side app, so crawlers get this text */}
      <div className="sr-only">
        <h1>Planer ogrodu 2D/3D</h1>
        <p>Narysuj działkę, podjazd, taras, ścieżki, trawnik i rabaty. Planer pokaże projekt w 2D i w 3D, policzy, ile kostki brukowej i trawnika potrzeba, a gotowy projekt możesz wysłać do firmy Gryczewski z Białegostoku. Wycena po obejrzeniu terenu, bez zobowiązań. Telefon: 885 879 108.</p>
      </div>
      <PlannerLoader />
    </>
  );
}
