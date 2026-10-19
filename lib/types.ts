export type Kind =
  | "house" | "garage" | "surface" | "lawn" | "bed"
  | "tree" | "shrub" | "hedge" | "grass"
  | "fence" | "gate" | "pergola" | "bench" | "planter" | "water" | "light";

export type SurfaceUse = "driveway" | "terrace" | "path" | "other";
export type Pattern = "classic" | "rect" | "herringbone" | "modern";
export type Edging = "none" | "graphite" | "light";
export type Lighting = "day" | "golden" | "evening";
export type Facade = "white" | "graphite" | "wood";

/** Single source of truth for 2D editor and 3D renderer. Units: metres, plot origin = top-left, y points "down" (towards the street). */
export interface PlanObject {
  id: string;
  kind: Kind;
  x: number; // centre
  y: number;
  w: number;
  h: number;
  rot: number; // degrees, clockwise in plan
  /** normalised polygon in [-0.5,0.5] box (centre-relative). Absent = rectangle/ellipse. */
  poly?: [number, number][];
  /** editable control points (metres, local to the object centre). poly is derived from them. */
  nodes?: [number, number][];
  smooth?: boolean; // curved edges through the nodes
  band?: number;    // set = a path/strip drawn along the nodes with this width (m)
  material?: string;
  pattern?: Pattern;
  edging?: Edging;
  use?: SurfaceUse;
  species?: string;
  height?: number; // buildings
  facade?: Facade;
}

export interface Project {
  version: 1;
  name: string;
  plot: { w: number; l: number };
  fence: { enabled: boolean; style: "graphite" | "wood" | "light" };
  lighting: Lighting;
  objects: PlanObject[];
}

export interface Settings {
  units: "m" | "cm";
  snap: boolean;
  grid: boolean;
  dims: boolean;
  waste: number; // %
  quality: "high" | "low";
}
