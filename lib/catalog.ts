import type { Kind, Pattern, SurfaceUse } from "./types";

export type TexKind = "bricks" | "gravel" | "grass" | "mulch" | "planks";
export interface Material {
  id: string; name: string; cat: string; color: string; tex: TexKind;
  pattern?: Pattern; kind: "surface" | "lawn" | "bed";
  /** real PBR photo texture in /public/textures/<dir> (seamless, CC0 Poly Haven); tileM = metres covered by one tile */
  photo?: { dir: string; tileM: number };
}
export const MATERIAL_CATS = [
  "Kostka betonowa", "Kostka szlachetna", "Płyty tarasowe", "Kamień naturalny",
  "Żwir", "Trawnik", "Rabaty", "Inne powierzchnie",
] as const;

const S = "surface" as const;
export const MATERIALS: Material[] = [
  { id: "kb-grafit", name: "Kostka grafitowa", cat: "Kostka betonowa", color: "#3a3d40", tex: "bricks", pattern: "classic", kind: S },
  { id: "kb-szara", name: "Kostka szara", cat: "Kostka betonowa", color: "#8c8f90", tex: "bricks", pattern: "classic", kind: S },
  { id: "kb-melanz", name: "Kostka melanż", cat: "Kostka betonowa", color: "#7d756a", tex: "bricks", pattern: "rect", kind: S },
  { id: "kb-piasek", name: "Kostka piaskowa", cat: "Kostka betonowa", color: "#c4ae88", tex: "bricks", pattern: "classic", kind: S },
  { id: "ks-czarna", name: "Szlachetna antracyt", cat: "Kostka szlachetna", color: "#26292c", tex: "bricks", pattern: "herringbone", kind: S },
  { id: "ks-jasna", name: "Szlachetna jasnoszara", cat: "Kostka szlachetna", color: "#bdbfba", tex: "bricks", pattern: "herringbone", kind: S },
  { id: "pt-wielko", name: "Płyty wielkoformatowe", cat: "Płyty tarasowe", color: "#9b9d9b", tex: "bricks", pattern: "modern", kind: S },
  { id: "pt-kamien", name: "Płyty imitujące kamień", cat: "Płyty tarasowe", color: "#a69c8c", tex: "bricks", pattern: "modern", kind: S },
  { id: "kn-granit", name: "Granit szary", cat: "Kamień naturalny", color: "#7e8284", tex: "bricks", pattern: "rect", kind: S },
  { id: "kn-piaskowiec", name: "Piaskowiec", cat: "Kamień naturalny", color: "#b9a07c", tex: "bricks", pattern: "rect", kind: S },
  { id: "zw-dekor", name: "Żwir dekoracyjny", cat: "Żwir", color: "#d0c8b7", tex: "gravel", kind: S },
  { id: "zw-ciemny", name: "Grys ciemny", cat: "Żwir", color: "#5e5f5c", tex: "gravel", kind: S },
  { id: "tr-rolowany", name: "Trawnik z rolki", cat: "Trawnik", color: "#5f8d3d", tex: "grass", kind: "lawn", photo: { dir: "grass_roll", tileM: 2.2 } },
  { id: "tr-siany", name: "Trawnik siany", cat: "Trawnik", color: "#74a04a", tex: "grass", kind: "lawn", photo: { dir: "grass_natural", tileM: 2.2 } },
  { id: "rb-kora", name: "Kora sosnowa", cat: "Rabaty", color: "#6d4a30", tex: "mulch", kind: "bed" },
  { id: "rb-ziemia", name: "Ziemia ogrodowa", cat: "Rabaty", color: "#4b3b2d", tex: "mulch", kind: "bed" },
  { id: "in-deska", name: "Deska kompozytowa", cat: "Inne powierzchnie", color: "#7b5d44", tex: "planks", kind: S },
  { id: "ph-behaton", name: "Behaton szary (skan)", cat: "Kostka betonowa", color: "#6f6a5f", tex: "bricks", kind: S, photo: { dir: "concrete_pavers", tileM: 1.6 } },
  { id: "ph-bruzowa", name: "Kostka brązowa (skan)", cat: "Kostka betonowa", color: "#7a6450", tex: "bricks", kind: S, photo: { dir: "concrete_pavers_02", tileM: 1.6 } },
  { id: "ph-granit", name: "Kostka granitowa ciemna (skan)", cat: "Kamień naturalny", color: "#3d3a36", tex: "bricks", kind: S, photo: { dir: "brick_pavement_02", tileM: 1.1 } },
  { id: "ph-klinkier", name: "Klinkier (skan)", cat: "Kostka szlachetna", color: "#9a8a55", tex: "bricks", kind: S, photo: { dir: "floor_klinkers_01", tileM: 1.2 } },
  { id: "ph-bruk", name: "Bruk kamienny (skan)", cat: "Kamień naturalny", color: "#8c8474", tex: "bricks", kind: S, photo: { dir: "cobblestone_floor_01", tileM: 1.3 } },
  { id: "ph-zwir", name: "Żwir dwukolorowy (skan)", cat: "Żwir", color: "#5c5a52", tex: "gravel", kind: S, photo: { dir: "bicolour_gravel", tileM: 0.9 } },
  { id: "in-beton", name: "Beton architektoniczny", cat: "Inne powierzchnie", color: "#9d9d98", tex: "bricks", pattern: "modern", kind: S },
];
export const matById = (id?: string) => MATERIALS.find((m) => m.id === id) ?? MATERIALS[0];

export const PATTERNS: { id: Pattern; name: string }[] = [
  { id: "classic", name: "Klasyczny" }, { id: "rect", name: "Prostokątny" },
  { id: "herringbone", name: "Jodełka" }, { id: "modern", name: "Nowoczesny" },
];

export const SURFACE_USES: { id: SurfaceUse; name: string }[] = [
  { id: "driveway", name: "Podjazd" }, { id: "terrace", name: "Taras" },
  { id: "path", name: "Ścieżka" }, { id: "other", name: "Inna nawierzchnia" },
];

export interface Species { name: string; d: number; height: number; color: string; accent?: string; style: "round" | "cone" | "column" | "birch" | "bush" | "tuft" | "hedge" }
export const SPECIES: Record<string, Species> = {
  klon: { name: "Klon", d: 4.5, height: 7, color: "#4f7d34", accent: "#8a3d2a", style: "round" },
  brzoza: { name: "Brzoza", d: 2.8, height: 7.5, color: "#7ea55a", style: "birch" },
  swierk: { name: "Świerk", d: 2.8, height: 6.5, color: "#1f4a33", style: "cone" },
  tuja: { name: "Tuja", d: 0.9, height: 2.6, color: "#2a5a3a", style: "column" },
  hortensja: { name: "Hortensja", d: 1.2, height: 1.0, color: "#6f9a4d", accent: "#e9e6f2", style: "bush" },
  lawenda: { name: "Lawenda", d: 0.7, height: 0.55, color: "#6c7fa6", accent: "#8f78b8", style: "bush" },
  trawy: { name: "Trawy ozdobne", d: 1.0, height: 0.9, color: "#bfae6a", accent: "#e1d49a", style: "tuft" },
  zywoplot: { name: "Żywopłot tujowy", d: 1, height: 1.9, color: "#2c5c3c", style: "hedge" },
};

export interface LibItem {
  id: string; name: string; cat: string; kind: Kind; species?: string;
  w: number; h: number; height?: number; group?: number; material?: string; use?: SurfaceUse; pattern?: Pattern;
}
export const GARDEN_CATS = [
  "Trawniki", "Drzewa", "Krzewy", "Żywopłoty", "Rabaty", "Rośliny ozdobne", "Rośliny trawiaste", "Mała architektura", "Woda",
] as const;

export const GARDEN_ITEMS: LibItem[] = [
  { id: "g-trawnik", name: "Trawnik", cat: "Trawniki", kind: "lawn", w: 6, h: 4, material: "tr-rolowany" },
  { id: "g-trawnik2", name: "Trawnik siany", cat: "Trawniki", kind: "lawn", w: 6, h: 4, material: "tr-siany" },
  { id: "g-klon", name: "Klon", cat: "Drzewa", kind: "tree", species: "klon", w: 4.5, h: 4.5 },
  { id: "g-brzoza", name: "Brzoza", cat: "Drzewa", kind: "tree", species: "brzoza", w: 2.8, h: 2.8 },
  { id: "g-swierk", name: "Świerk", cat: "Drzewa", kind: "tree", species: "swierk", w: 2.8, h: 2.8 },
  { id: "g-tuja", name: "Tuja", cat: "Krzewy", kind: "shrub", species: "tuja", w: 0.9, h: 0.9 },
  { id: "g-hortensja", name: "Hortensje", cat: "Krzewy", kind: "shrub", species: "hortensja", w: 1.2, h: 1.2 },
  { id: "g-hortensja3", name: "Grupa hortensji (3)", cat: "Krzewy", kind: "shrub", species: "hortensja", w: 1.2, h: 1.2, group: 3 },
  { id: "g-zywoplot", name: "Żywopłot tujowy", cat: "Żywopłoty", kind: "hedge", species: "zywoplot", w: 5, h: 0.9 },
  { id: "g-rabata", name: "Rabata (kora)", cat: "Rabaty", kind: "bed", w: 4, h: 1.6, material: "rb-kora" },
  { id: "g-rabata2", name: "Rabata (ziemia)", cat: "Rabaty", kind: "bed", w: 4, h: 1.6, material: "rb-ziemia" },
  { id: "g-lawenda", name: "Lawenda", cat: "Rośliny ozdobne", kind: "shrub", species: "lawenda", w: 0.7, h: 0.7 },
  { id: "g-lawenda5", name: "Grupa lawendy (5)", cat: "Rośliny ozdobne", kind: "shrub", species: "lawenda", w: 0.7, h: 0.7, group: 5 },
  { id: "g-trawy", name: "Trawy ozdobne", cat: "Rośliny trawiaste", kind: "grass", species: "trawy", w: 1, h: 1 },
  { id: "g-trawy5", name: "Kępa traw (5)", cat: "Rośliny trawiaste", kind: "grass", species: "trawy", w: 1, h: 1, group: 5 },
  { id: "g-donica", name: "Donica", cat: "Mała architektura", kind: "planter", w: 0.9, h: 0.9 },
  { id: "g-pergola", name: "Pergola", cat: "Mała architektura", kind: "pergola", w: 4, h: 3 },
  { id: "g-ogrodzenie", name: "Ogrodzenie (segment)", cat: "Mała architektura", kind: "fence", w: 4, h: 0.12 },
  { id: "g-lawka", name: "Ławka", cat: "Mała architektura", kind: "bench", w: 1.6, h: 0.5 },
  { id: "g-oczko", name: "Oczko wodne", cat: "Woda", kind: "water", w: 3, h: 2.2 },
];

export const ELEMENT_ITEMS: LibItem[] = [
  { id: "e-ogrodzenie", name: "Segment ogrodzenia", cat: "Elementy", kind: "fence", w: 4, h: 0.12 },
  { id: "e-brama", name: "Brama wjazdowa", cat: "Elementy", kind: "gate", w: 3.4, h: 0.3 },
  { id: "e-furtka", name: "Furtka", cat: "Elementy", kind: "gate", w: 1.2, h: 0.3 },
  { id: "e-pergola", name: "Pergola", cat: "Elementy", kind: "pergola", w: 4, h: 3 },
  { id: "e-lawka", name: "Ławka", cat: "Elementy", kind: "bench", w: 1.6, h: 0.5 },
  { id: "e-donica", name: "Donica", cat: "Elementy", kind: "planter", w: 0.9, h: 0.9 },
];
export const BUILDING_ITEMS: LibItem[] = [
  { id: "b-dom", name: "Dom jednorodzinny", cat: "Budynki", kind: "house", w: 12, h: 9, height: 6.5 },
  { id: "b-garaz", name: "Garaż", cat: "Budynki", kind: "garage", w: 6, h: 6, height: 3.2 },
  { id: "b-wiata", name: "Budynek gospodarczy", cat: "Budynki", kind: "garage", w: 3.5, h: 3, height: 2.6 },
];
export const LIGHT_ITEM: LibItem = { id: "l-lampa", name: "Lampa ogrodowa", cat: "Oświetlenie", kind: "light", w: 0.4, h: 0.4 };

export const KIND_LABEL: Record<Kind, string> = {
  house: "Dom", garage: "Garaż / budynek", surface: "Nawierzchnia", lawn: "Trawnik", bed: "Rabata",
  tree: "Drzewo", shrub: "Krzew", hedge: "Żywopłot", grass: "Trawy ozdobne", fence: "Ogrodzenie",
  gate: "Brama / furtka", pergola: "Pergola", bench: "Ławka", planter: "Donica", water: "Oczko wodne", light: "Lampa",
};
/** objects whose size is a single diameter */
export const POINT_KINDS: Kind[] = ["tree", "shrub", "grass", "planter", "light"];
export const SHAPE_KINDS: Kind[] = ["surface", "lawn", "bed"];


/** The only things the simplified planner offers. */
export const SIMPLE_ITEMS: LibItem[] = [
  { id: "s-dom", name: "Dom", cat: "", kind: "house", w: 12, h: 9, height: 6.5 },
  { id: "s-podjazd", name: "Podjazd", cat: "", kind: "surface", w: 3.5, h: 8, material: "ks-czarna", pattern: "herringbone", use: "driveway" },
  { id: "s-taras", name: "Taras", cat: "", kind: "surface", w: 5, h: 4, material: "pt-wielko", pattern: "modern", use: "terrace" },
  { id: "s-sciezka", name: "Ścieżka", cat: "", kind: "surface", w: 1.2, h: 6, material: "kb-szara", pattern: "classic", use: "path" },
  { id: "s-trawnik", name: "Trawnik", cat: "", kind: "lawn", w: 6, h: 4, material: "tr-rolowany" },
  { id: "s-rabata", name: "Rabata", cat: "", kind: "bed", w: 4, h: 1.6, material: "rb-kora" },
  { id: "s-drzewo", name: "Drzewo", cat: "", kind: "tree", species: "klon", w: 4, h: 4 },
  { id: "s-krzewy", name: "Krzewy", cat: "", kind: "shrub", species: "hortensja", w: 1.2, h: 1.2, group: 3 },
  { id: "s-lampa", name: "Lampa", cat: "", kind: "light", w: 0.4, h: 0.4 },
];

export const findLibItem = (id: string) => [...SIMPLE_ITEMS, ...GARDEN_ITEMS, ...ELEMENT_ITEMS, ...BUILDING_ITEMS, LIGHT_ITEM].find((i) => i.id === id);
