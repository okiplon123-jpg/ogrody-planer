import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const data = await readFile(join(process.cwd(), "assets/Archivo-ExtraBold.ttf"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0b0d10", color: "#e8c500", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Archivo", fontSize: 200, fontWeight: 800, lineHeight: 1, paddingBottom: 34 }}>g</div>
    ),
    { ...size, fonts: [{ name: "Archivo", data, weight: 800, style: "normal" }] },
  );
}
