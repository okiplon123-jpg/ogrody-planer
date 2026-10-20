import { ImageResponse } from "next/og";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

/* Brand mark: signal-yellow square with an ink "g". 48 px, as Google asks for favicons in multiples of 48. */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#e8c500", color: "#0b0d10", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 800, lineHeight: 1, paddingBottom: 6 }}>g</div>
    ),
    size,
  );
}
