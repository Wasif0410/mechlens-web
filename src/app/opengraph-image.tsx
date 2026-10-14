import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";

export const alt = "MechLens: AI goggles for automotive technicians";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The share image: the headline beside the hero render of the goggles. Built at build time. */
export default async function Image() {
  const poster = await readFile(join(process.cwd(), "src/assets/goggles-hero.png"));
  const src = `data:image/png;base64,${poster.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: brand.studio,
          color: brand.ink,
          padding: "0 0 0 72px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 470 }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 30, fontWeight: 700 }}>
            <div style={{ width: 16, height: 16, background: brand.signal, marginRight: 14 }} />
            MechLens
          </div>
          <div style={{ fontSize: 60, lineHeight: 1.04, letterSpacing: -2, marginTop: 36 }}>
            AI goggles for automotive technicians.
          </div>
          <div style={{ fontSize: 24, lineHeight: 1.4, color: brand.inkMuted, marginTop: 28 }}>
            Verified repair answers, one press away.
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img elements */}
        <img src={src} width={760} height={475} alt="" style={{ marginLeft: -40 }} />
      </div>
    ),
    size,
  );
}
