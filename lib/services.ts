/** Landing-page content per service. Only facts the company gave us; no prices, no invented claims. */
export type Service = {
  slug: string;
  short: string;        // label in lists
  title: string;        // <title>
  description: string;  // meta description
  h1: string;
  lead: string;
  image: string;
  includes: string[];
  time?: string;
  priceFactors: string;
  tools: ("planer" | "wizualizator")[];
  faq: [string, string][];
};

const TERRAIN = "Teren przygotowujemy my, Ty nie musisz nic robić.";
const FREE = "Wycena po obejrzeniu terenu, bez zobowiązań.";
const PAVING_INCLUDES = [
  "Oględziny i pomiar: grunt, spadki, dojazd dla sprzętu",
  "Wykop i podbudowa z kruszywa, zagęszczana warstwami",
  "Obrzeża i podsypka wyrównana do spadku",
  "Układanie kostki we wzorze, cięcie przy krawędziach, fugowanie",
  "Sprzątanie i odbiór razem z Tobą",
];
const PAVING_PRICE = "Cena zależy od powierzchni, gruntu, grubości podbudowy, wybranej kostki, odwodnienia i dojazdu dla sprzętu. Dokładną kwotę podajemy po obejrzeniu terenu.";
const FAQ_PAVING = (what: string): [string, string][] => [
  ["Ile trwa realizacja?", `Zależy od rodzaju robót i wielkości zlecenia. ${what}`],
  ["Czy można układać kostkę zimą?", "Zimą staramy się nie układać kostki. Decyduje pogoda, więc termin ustalamy, kiedy widać, jakie są warunki."],
  ["Czy potrzebuję pozwolenia?", "Nie, na samo położenie kostki pozwolenie nie jest potrzebne."],
  ["Czy muszę coś przygotować?", TERRAIN],
  ["Jaką kostkę układacie?", "Każdą: betonową, granitową, klinkierową, kamienną, w każdym kolorze i wzorze."],
  ["Czy jest gwarancja?", "Tak. Jeśli po pracach coś jest nie tak, wracamy i poprawiamy."],
];

export const SERVICES: Service[] = [
  {
    slug: "podjazdy-z-kostki-brukowej-bialystok",
    short: "podjazdy i wjazdy",
    title: "Podjazdy z kostki brukowej Białystok | Gryczewski",
    description: "Układanie podjazdów z kostki brukowej w Białymstoku i okolicach. Wycena po obejrzeniu terenu, bez zobowiązań. Zadzwoń: 885 879 108.",
    h1: "podjazdy z kostki brukowej w Białymstoku",
    lead: `Dobieramy szerokość pod samochody, spadek od domu i wzór, który nie męczy oka. ${FREE}`,
    image: "/zdjecia/kostka-jodelka-szara.jpg",
    includes: PAVING_INCLUDES,
    time: "Typowy podjazd to około 2 tygodnie. Zależy od rodzaju robót i wielkości zlecenia.",
    priceFactors: PAVING_PRICE,
    tools: ["wizualizator", "planer"],
    faq: FAQ_PAVING("Typowy podjazd zajmuje około 2 tygodni."),
  },
  {
    slug: "tarasy-z-kostki-i-plyt-bialystok",
    short: "tarasy",
    title: "Tarasy z kostki i płyt Białystok | Gryczewski",
    description: "Tarasy z płyt lub kostki brukowej w Białymstoku i okolicach. Najpierw spadek od ściany i odpływ wody. Wycena po obejrzeniu, bez zobowiązań.",
    h1: "tarasy z kostki i płyt w Białymstoku",
    lead: `Płyty lub kostka przy domu. Najpierw spadek od ściany i odpływ wody, dopiero potem wzór. ${FREE}`,
    image: "/zdjecia/kostka-geometryczna.jpg",
    includes: PAVING_INCLUDES,
    priceFactors: PAVING_PRICE,
    tools: ["wizualizator", "planer"],
    faq: FAQ_PAVING("Czas dla tarasu ustalamy po obejrzeniu terenu."),
  },
  {
    slug: "sciezki-i-chodniki-z-kostki-bialystok",
    short: "ścieżki i chodniki",
    title: "Ścieżki i chodniki z kostki Białystok | Gryczewski",
    description: "Ścieżki i chodniki z kostki brukowej w Białymstoku i okolicach: od furtki do drzwi i dookoła domu. Wycena po obejrzeniu, bez zobowiązań.",
    h1: "ścieżki i chodniki z kostki w Białymstoku",
    lead: `Od furtki do drzwi i dookoła domu. Równe, antypoślizgowe, z obrzeżem, które trzyma kształt. ${FREE}`,
    image: "/zdjecia/kostka-jodelka-brazowa.jpg",
    includes: PAVING_INCLUDES,
    priceFactors: PAVING_PRICE,
    tools: ["wizualizator", "planer"],
    faq: FAQ_PAVING("Czas dla ścieżek ustalamy po obejrzeniu terenu."),
  },
  {
    slug: "place-i-parkingi-z-kostki-bialystok",
    short: "place i parkingi",
    title: "Place i parkingi z kostki Białystok | Gryczewski",
    description: "Place i parkingi z kostki brukowej w Białymstoku i okolicach. Większe obciążenia wymagają grubszej podbudowy. Wycena po obejrzeniu terenu.",
    h1: "place i parkingi z kostki w Białymstoku",
    lead: `Większe obciążenia wymagają grubszej podbudowy i innej kostki. Mamy własny sprzęt: koparkę, miniładowarkę, walec i zagęszczarki. ${FREE}`,
    image: "/zdjecia/kostka-jodelka-szara.jpg",
    includes: PAVING_INCLUDES,
    priceFactors: PAVING_PRICE,
    tools: ["planer"],
    faq: FAQ_PAVING("Czas dla placu ustalamy po obejrzeniu terenu."),
  },
  {
    slug: "trawniki-i-ogrody-bialystok",
    short: "trawniki i ogrody",
    title: "Trawniki i ogrody Białystok | Gryczewski",
    description: "Zakładanie trawników z rolki i z siewu, rabaty, nasadzenia i całe ogrody od zera w Białymstoku i okolicach. Wycena po obejrzeniu, bez zobowiązań.",
    h1: "trawniki i ogrody w Białymstoku",
    lead: `Zakładamy ogrody od zera: od projektu i prac ziemnych po trawnik, rabaty i nasadzenia. ${FREE}`,
    image: "/textures/grass_roll/grass_roll_diff_1k.jpg",
    includes: [
      "Oględziny działki: nasłonecznienie, grunt, spadki",
      "Projekt: strefy, trawnik, rabaty, ścieżki, miejsce na taras",
      "Prace ziemne, niwelacja i odprowadzenie wody",
      "Trawnik z rolki albo z siewu, drzewa, krzewy i byliny",
      "Odbiór i wskazówki, jak dbać o ogród",
    ],
    priceFactors: "Cena zależy od powierzchni, gruntu, zakresu prac ziemnych, wybranych roślin i tego, czy trawnik ma być z rolki, czy z siewu. Dokładną kwotę podajemy po obejrzeniu terenu.",
    tools: ["planer"],
    faq: [
      ["Czy zakładacie ogród od zera?", "Tak, od projektu i prac ziemnych po trawnik, rabaty i nasadzenia."],
      ["Czy muszę coś przygotować?", TERRAIN],
      ["Trawnik z rolki czy z siewu?", "Zakładamy oba. Co lepsze, podpowiemy po obejrzeniu działki."],
      ["Czy jest gwarancja?", "Tak. Jeśli po pracach coś jest nie tak, wracamy i poprawiamy."],
    ],
  },
];

export const bySlug = (s: string) => SERVICES.find((x) => x.slug === s);
