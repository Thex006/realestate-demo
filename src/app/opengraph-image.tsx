import { ImageResponse } from "next/og";

export const alt = "Budapest Luxury Apartments, concept redesign";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share card: flat black, the promise in large type, the concept note in small. */
export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#000", color: "#f2efe9", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80 }}>
        <div style={{ fontSize: 24, letterSpacing: 8, color: "#c9a96e" }}>BUDAPEST LUXURY APARTMENTS</div>
        <div style={{ fontSize: 72, fontWeight: 600, lineHeight: 1.05, maxWidth: 900 }}>The Budapest home you’d never find alone</div>
        <div style={{ fontSize: 22, color: "#a39e95" }}>Concept redesign. Not affiliated with the agency.</div>
      </div>
    ),
    size,
  );
}
