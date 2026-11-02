/** Real job photos supplied by the firm (public/zdjecia/realizacje). Captions say only what is visible in the photo. */
export type Photo = { src: string; alt: string; cap: string; w: number; h: number };

const P = (file: string, w: number, h: number, cap: string, alt = cap): Photo => ({ src: `/zdjecia/realizacje/${file}.webp`, alt, cap, w, h });

export const PHOTOS = {
  podjazdPlyty: P("podjazd-kostka-plyty", 1100, 1100, "kostka i płyty z odwodnieniem liniowym"),
  podjazdCzerwony: P("podjazd-jodelka-czerwona", 825, 1100, "podjazd z kostki w jodełkę"),
  podjazdGaraz: P("podjazd-garaz", 619, 1100, "płyty i obrzeże przy garażu"),
  podjazdDwaWzory: P("podjazd-dwa-wzory", 825, 1100, "podjazd w dwóch wzorach kostki, w trakcie robót"),
  kostkaZolta: P("kostka-zolta-obwodka", 1100, 825, "kostka z żółtą obwódką wokół drzewa"),
  chodnikDonice: P("chodnik-donice", 1100, 1100, "chodnik i plac przy budynku, z donicami"),
  placPlyty: P("plac-plyty-kostka", 1100, 1100, "plac z płyt, w trakcie zagęszczania"),
  plytyLuk: P("plyty-luk-z-kostki", 1100, 1100, "płyty z łukiem z kostki"),
  sciezkaZolta: P("sciezka-zolta-obwodka", 1100, 1100, "ścieżka z kostki z żółtą obwódką, w trakcie robót"),
  szaraJodelka: P("kostka-jodelka-szara", 1100, 1100, "szara kostka w jodełkę"),
  parkingWalec: P("parking-walec", 1100, 1100, "parking z kostki i walec przy podbudowie"),
  rozeta: P("rozeta-z-kostki", 1100, 825, "rozeta z kostki w trakcie układania"),
  bobcat: P("bobcat", 825, 1100, "minikoparka na placu budowy"),
  obrzeza: P("obrzeza-podbudowa", 1100, 825, "obrzeża na podbudowie przed układaniem kostki"),
  skarpa: P("skarpa-kamien", 825, 1100, "skarpa wykładana kamieniem"),
} satisfies Record<string, Photo>;

export const BY_SERVICE: Record<string, Photo[]> = {
  "podjazdy-z-kostki-brukowej-bialystok": [PHOTOS.podjazdCzerwony, PHOTOS.podjazdGaraz, PHOTOS.podjazdDwaWzory],
  "tarasy-z-kostki-i-plyt-bialystok": [PHOTOS.plytyLuk, PHOTOS.placPlyty, PHOTOS.chodnikDonice],
  "sciezki-i-chodniki-z-kostki-bialystok": [PHOTOS.sciezkaZolta, PHOTOS.kostkaZolta, PHOTOS.rozeta],
  "place-i-parkingi-z-kostki-bialystok": [PHOTOS.placPlyty, PHOTOS.parkingWalec, PHOTOS.szaraJodelka],
  "prace-ziemne-i-korytowanie-bialystok": [PHOTOS.bobcat, PHOTOS.obrzeza, PHOTOS.parkingWalec],
};
