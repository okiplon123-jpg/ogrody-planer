import type { Metadata } from "next";
import Link from "next/link";
import PlannerLoader from "./loader";

export const metadata: Metadata = {
  title: "Planer ogrodu 2D/3D: policz kostkę i trawnik | Gryczewski",
  description: "Zaplanuj podjazd, taras, ścieżki i trawnik w 2D i 3D. Planer policzy, ile kostki i trawnika potrzeba, a projekt wyślesz do firmy z Białegostoku.",
  alternates: { canonical: "/planer" },
};

export default function Page() {
  return (
    <>
      {/* the editor is a client-side app, so crawlers and screen readers get this description of it */}
      <div className="sr-only">
        <h1>Planer ogrodu 2D/3D</h1>
        <p>Narysuj działkę, podjazd, taras, ścieżki, trawnik i rabaty. Planer pokaże projekt w 2D i w 3D, policzy, ile kostki brukowej i trawnika potrzeba, a gotowy projekt możesz wysłać do firmy Gryczewski z Białegostoku. Wycena po obejrzeniu terenu, bez zobowiązań. Telefon: 885 879 108.</p>
        <h2>Jak działa planer</h2>
        <p>Dodajesz elementy (dom, garaż, podjazd, taras, ścieżkę, trawnik, rabatę, drzewa, krzewy, lampy) albo rysujesz własne kształty z zaokrąglonymi krawędziami. Plan 2D i model 3D to ten sam projekt, więc zmiana w jednym od razu widać w drugim. Model 3D możesz oglądać w świetle dziennym, o zachodzie i wieczorem.</p>
        <h2>Co planer liczy</h2>
        <p>Powierzchnię kostki i nawierzchni (także z zapasem), trawnika i rabat, długość obrzeży, ogrodzenia i żywopłotu, liczbę drzew, krzewów i lamp. Wyniki są orientacyjne, a dokładną wycenę podajemy po obejrzeniu terenu.</p>
        <h2>Dla kogo jest planer</h2>
        <p>Dla właścicieli domów i działek w Białymstoku i okolicach, którzy chcą przed rozmową z wykonawcą zobaczyć, jak mogą wyglądać podjazd, taras, ścieżki, trawnik i rabaty, oraz mniej więcej policzyć potrzebny materiał. Projekt zapisuje się na Twoim urządzeniu. Możesz go wysłać do nas jednym przyciskiem, a my oddzwonimy i umówimy oględziny terenu.</p>
        <h2>Co dalej</h2>
        <nav aria-label="Strony serwisu">
          <ul>
            <li><Link href="/">Strona główna: układanie kostki brukowej w Białymstoku</Link></li>
            <li><Link href="/uslugi">Usługi i etapy prac</Link></li>
            <li><Link href="/wizualizator">Wizualizator kostki na zdjęciu</Link></li>
            <li><Link href="/prace-ziemne-i-korytowanie-bialystok">Prace ziemne i korytowanie</Link></li>
            <li><Link href="/kontakt">Kontakt i oględziny terenu</Link></li>
          </ul>
        </nav>
      </div>
      <PlannerLoader />
    </>
  );
}
