import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

/* Brand mark: ink square, heavy signal-yellow "g" in the site's own Archivo ExtraBold. 48 px, as Google asks for favicons in multiples of 48. */
export default async function Icon() {
  const data = await readFile(join(process.cwd(), "assets/Archivo-ExtraBold.ttf"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0b0d10", color: "#e8c500", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Archivo", fontSize: 54, fontWeight: 800, lineHeight: 1, paddingBottom: 9 }}>g</div>
    ),
    { ...size, fonts: [{ name: "Archivo", data, weight: 800, style: "normal" }] },
  );
}
