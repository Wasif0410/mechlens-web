import { navigation } from "@/lib/site";
import { Wordmark } from "./wordmark";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-studio">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <Wordmark className="text-ink" />
          <p className="max-w-sm text-[15px] text-ink-muted">
            AI goggles that bring verified repair information to the technician on the car.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-7 gap-y-3 text-[15px] text-ink-muted">
            {navigation.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="transition-colors hover:text-ink">
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#waitlist" className="transition-colors hover:text-ink">
                Join the waitlist
              </a>
            </li>
          </ul>
        </nav>
        <div className="space-y-2 border-t border-line pt-6 text-[13px] leading-relaxed text-ink-muted md:col-span-2">
          <p>The goggles shown are a concept design. The final hardware may look different.</p>
          <p>
            Engine bay photo:{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Nissan_Sunny_N16_2011_Engine_bay_(QG13DE).jpg"
              className="underline underline-offset-2 hover:text-ink"
            >
              “Nissan Sunny N16 2011 Engine bay (QG13DE)”
            </a>{" "}
            by VScode fanboy,{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              className="underline underline-offset-2 hover:text-ink"
            >
              CC BY 4.0
            </a>
            , cropped, with an answer drawn over it.
          </p>
          <p>© 2026 MechLens</p>
        </div>
      </div>
    </footer>
  );
}
