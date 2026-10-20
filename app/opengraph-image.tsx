import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Kostka brukowa i ogrody, Białystok i okolice";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Link preview card (Facebook, Google, messengers). */
export default async function OG() {
  const data = await readFile(join(process.cwd(), "assets/Archivo-ExtraBold.ttf"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#f8f9fb", color: "#0b0d10", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, fontFamily: "Archivo" }}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 44, fontWeight: 800 }}>
          gryczewski<div style={{ width: 22, height: 22, background: "#e8c500", marginLeft: 6, marginTop: 14 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 132, fontWeight: 800, lineHeight: 0.95, letterSpacing: -4 }}>
          <div>kostka brukowa</div>
          <div style={{ display: "flex", alignItems: "center" }}>i ogrody<div style={{ width: 70, height: 70, background: "#e8c500", marginLeft: 18, marginTop: 52 }} /></div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 36, fontWeight: 600 }}>
          <div>Białystok i okolice</div>
          <div style={{ background: "#e8c500", padding: "14px 28px" }}>+48 885 879 108</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Archivo", data, weight: 800, style: "normal" }] },
  );
}
