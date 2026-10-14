import { notFound } from "next/navigation";
import { PosterStage } from "@/components/goggles/poster-stage";
import { CAMERAS, type GogglesView } from "@/components/goggles/scene";

/**
 * Development only: renders one view of the goggles on a transparent background at poster size,
 * for `npm run posters`. Production builds answer 404.
 */
export default async function RenderPage({ searchParams }: PageProps<"/dev/render">) {
  if (process.env.NODE_ENV === "production") notFound();
  const { view } = await searchParams;
  if (typeof view !== "string" || !Object.hasOwn(CAMERAS, view)) notFound();
  return <PosterStage view={view as GogglesView} />;
}
