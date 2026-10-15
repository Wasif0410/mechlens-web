import Image from "next/image";
import { type ShotName, shots } from "@/lib/shots";

/** One photograph filling its relatively positioned parent. */
export function Shot({ name, sizes }: { name: ShotName; sizes: string }) {
  const shot = shots[name];
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image src={shot.still} alt={shot.alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
