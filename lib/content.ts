import type { ArtKind } from "@/components/marketing/Art";

export const SERVICES: { id: string; title: string; text: string; art: ArtKind; long: string }[] = [
  { id: "kostka", title: "Kostka brukowa i podjazdy", text: "Trwałe nawierzchnie wokół domu, dopasowane do stylu architektury.", art: "driveway", long: "Podjazdy, wjazdy i place z kostki betonowej oraz szlachetnej. Dbamy o prawidłową podbudowę, spadki i precyzyjne wykończenie krawędzi." },
  { id: "tarasy", title: "Tarasy i ścieżki", text: "Płyty, kamień i żwir ułożone tak, by dom płynnie łączył się z ogrodem.", art: "terrace", long: "Tarasy z płyt wielkoformatowych i kamienia naturalnego oraz ścieżki prowadzące przez ogród — od eleganckich płyt po miękkie nawierzchnie żwirowe." },
  { id: "trawniki", title: "Zakładanie trawników", text: "Trawnik z rolki lub siany, przygotowany na solidnym podłożu.", art: "lawn", long: "Niwelacja, przygotowanie gleby, nawadnianie i założenie trawnika z rolki lub z siewu — tak, aby zielona powierzchnia wyglądała dobrze przez lata." },
  { id: "ogrody", title: "Projektowanie ogrodów", text: "Spójna koncepcja przestrzeni — od układu stref po dobór roślin.", art: "garden", long: "Projekt ogrodu uwzględnia sposób, w jaki korzystasz z przestrzeni, nasłonecznienie, glebę i styl domu. Możesz zacząć od własnego szkicu w naszym planerze." },
  { id: "nasadzenia", title: "Nasadzenia i rabaty", text: "Drzewa, krzewy i byliny dobrane do miejsca i Twojego czasu na pielęgnację.", art: "path", long: "Rabaty z trawami ozdobnymi, hortensjami i bylinami, żywopłoty oraz drzewa. Dobieramy rośliny do warunków, a nie tylko do katalogowego zdjęcia." },
  { id: "kompleks", title: "Kompleksowe zagospodarowanie posesji", text: "Jeden zespół odpowiedzialny za całość: od przygotowania terenu po oświetlenie.", art: "house", long: "Prace ziemne, odwodnienie, nawierzchnie, ogrodzenie, ogród i oświetlenie w jednym, skoordynowanym procesie, z jedną osobą odpowiedzialną za całość." },
];

export const CATEGORIES = ["Wszystkie", "Podjazdy", "Tarasy", "Ogrody", "Ścieżki", "Kompleksowe realizacje"] as const;
export const PROJECTS: { slug: string; title: string; cat: (typeof CATEGORIES)[number]; art: ArtKind; span: string; desc: string; services: string[] }[] = [
  { slug: "dom-nad-laka", title: "Dom nad łąką", cat: "Kompleksowe realizacje", art: "house", span: "md:col-span-7 md:row-span-2", desc: "Nowoczesny dom z podjazdem z grafitowej kostki, trawami ozdobnymi i oświetleniem akcentowym. Projekt demonstracyjny.", services: ["kompleks", "kostka", "nasadzenia"] },
  { slug: "podjazd-grafit", title: "Podjazd w grafitowej jodełce", cat: "Podjazdy", art: "driveway", span: "md:col-span-5", desc: "Szeroki podjazd z jasnym obrzeżem i wyraźnie zaznaczoną ścieżką wejściową. Projekt demonstracyjny.", services: ["kostka"] },
  { slug: "taras-plyty", title: "Taras z dużych płyt", cat: "Tarasy", art: "terrace", span: "md:col-span-5", desc: "Taras z płyt wielkoformatowych otoczony rabatami i trawnikiem. Projekt demonstracyjny.", services: ["tarasy", "nasadzenia"] },
  { slug: "ogrod-traw", title: "Ogród traw i hortensji", cat: "Ogrody", art: "garden", span: "md:col-span-4", desc: "Rabaty o stonowanej palecie z trawami ozdobnymi. Projekt demonstracyjny.", services: ["ogrody", "nasadzenia"] },
  { slug: "sciezka-kamienna", title: "Ścieżka z płyt kamiennych", cat: "Ścieżki", art: "path", span: "md:col-span-3", desc: "Swobodna ścieżka z płyt wśród żwiru i traw. Projekt demonstracyjny.", services: ["tarasy"] },
  { slug: "trawnik-rodzinny", title: "Trawnik i drzewa", cat: "Ogrody", art: "lawn", span: "md:col-span-5", desc: "Duży trawnik z rolki, tło zieleni wysokiej. Projekt demonstracyjny.", services: ["trawniki", "ogrody"] },
];
