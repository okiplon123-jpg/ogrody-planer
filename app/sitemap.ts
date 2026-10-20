import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, number][] = [["", 1], ["/uslugi", 0.9], ["/wizualizator", 0.9], ["/planer", 0.8], ["/o-nas", 0.6], ["/kontakt", 0.8], ["/polityka-prywatnosci", 0.2]];
  return pages.map(([p, priority]) => ({ url: `${SITE_URL}${p}`, lastModified: new Date(), priority }));
}
