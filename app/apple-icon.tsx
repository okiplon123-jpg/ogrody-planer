import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#e8c500", color: "#0b0d10", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 150, fontWeight: 800, lineHeight: 1, paddingBottom: 22 }}>g</div>
    ),
    size,
  );
}
