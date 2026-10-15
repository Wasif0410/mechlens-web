import { navigation } from "@/lib/site";
import { Wordmark } from "./wordmark";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-hairline">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 pt-16 sm:px-8 md:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <Wordmark className="text-bone" />
          <p className="max-w-sm text-sm text-ash">
            AI goggles that bring verified repair information to the technician on the car.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-ash">
            {navigation.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="transition-colors hover:text-bone">
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#waitlist" className="transition-colors hover:text-bone">
                Join the waitlist
              </a>
            </li>
          </ul>
        </nav>
        <div className="space-y-2 border-t border-hairline pt-6 text-xs leading-relaxed text-ash md:col-span-2">
          <p>The goggles shown are a concept design. The final hardware may look different.</p>
          <p>
            Engine bay photo:{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Nissan_Sunny_N16_2011_Engine_bay_(QG13DE).jpg"
              className="underline underline-offset-2 hover:text-bone"
            >
              “Nissan Sunny N16 2011 Engine bay (QG13DE)”
            </a>{" "}
            by VScode fanboy,{" "}
            <a href="https://creativecommons.org/licenses/by/4.0/" className="underline underline-offset-2 hover:text-bone">
              CC BY 4.0
            </a>
            , darkened, with an illustrated overlay.
          </p>
          <p>© 2026 MechLens</p>
        </div>
      </div>
      <p
        aria-hidden="true"
        className="pointer-events-none mt-10 -mb-[0.22em] text-center text-[clamp(4.5rem,19vw,18rem)] leading-none font-medium tracking-[-0.06em] text-transparent select-none [background-clip:text] bg-gradient-to-b from-white/[0.11] to-white/0"
      >
        MechLens
      </p>
    </footer>
  );
}
