import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";

export const alt = "MechLens: the answer, in your line of sight. AI goggles for automotive technicians.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The share image, built at build time. Swap in the hero render once it exists. */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: `radial-gradient(circle at 78% 30%, #1d2024 0%, ${brand.night} 62%)`,
          color: brand.bone,
          padding: "64px 72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 28, fontWeight: 500 }}>
          <div style={{ width: 14, height: 14, background: brand.signal, marginRight: 14 }} />
          MechLens
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, lineHeight: 0.98, letterSpacing: -3.5 }}>The answer,</div>
          <div style={{ fontSize: 88, lineHeight: 0.98, letterSpacing: -3.5 }}>in your line of sight.</div>
          <div style={{ fontSize: 26, color: brand.ash, marginTop: 30 }}>AI goggles for automotive technicians.</div>
        </div>
      </div>
    ),
    size,
  );
}
