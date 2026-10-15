import { notFound } from "next/navigation";
import { PosterStage } from "@/components/goggles/poster-stage";
import type { GogglesView } from "@/components/goggles/poster";
import { CAMERAS } from "@/components/goggles/scene";

/**
 * Development only: renders one view of the goggles on a transparent background at poster size,
 * for `npm run posters`. `?view=product&progress=0.5` poses the product view at that scroll
 * position. Production builds answer 404.
 */
export default async function RenderPage({ searchParams }: PageProps<"/dev/render">) {
  if (process.env.NODE_ENV === "production") notFound();
  const { view, progress } = await searchParams;
  if (typeof view !== "string" || !Object.hasOwn(CAMERAS, view)) notFound();
  const value = typeof progress === "string" ? Number(progress) : undefined;
  if (value !== undefined && !(value >= 0 && value <= 1)) notFound();
  return <PosterStage view={view as GogglesView} progress={value} />;
}
