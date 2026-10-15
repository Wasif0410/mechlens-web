import { notFound } from "next/navigation";
import { PosterStage } from "@/components/goggles/poster-stage";
import type { GogglesView } from "@/components/goggles/poster";
import { PRODUCT_HOLD } from "@/components/goggles/poster";
import { CAMERAS, PRODUCT_BEATS } from "@/components/goggles/scene";

/**
 * Development only: renders one view of the goggles on a transparent background at poster size,
 * for `npm run posters`. `?view=product&progress=0.5` poses the product view at that scroll
 * position, or `&beat=2` at a beat of the product scene; `&mask=1` renders the lens mask for
 * that view. Production builds answer 404.
 */
export default async function RenderPage({ searchParams }: PageProps<"/dev/render">) {
  if (process.env.NODE_ENV === "production") notFound();
  const { view, progress, beat, mask } = await searchParams;
  if (typeof view !== "string" || !Object.hasOwn(CAMERAS, view)) notFound();
  const beatValue = typeof beat === "string" ? ((Number(beat) - 1) / (PRODUCT_BEATS.length - 1)) * PRODUCT_HOLD : undefined;
  const value = beatValue ?? (typeof progress === "string" ? Number(progress) : undefined);
  if (value !== undefined && !(value >= 0 && value <= 1)) notFound();
  return <PosterStage view={view as GogglesView} progress={value} mask={mask === "1"} />;
}
