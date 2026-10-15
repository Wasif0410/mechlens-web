import type { StaticImageData } from "next/image";
import engineBay from "@/assets/engine-bay.jpg";

/** The photographs on the page, in one place. To add one: put the file under src/assets, import it here and add an entry. */
export type Shot = {
  still: StaticImageData;
  alt: string;
};

export type ShotName = "pov";

export const shots: Record<ShotName, Shot> = {
  pov: {
    still: engineBay,
    alt: "An engine bay seen through the goggles: a green battery at the right, below a black ribbed air filter box.",
  },
};
