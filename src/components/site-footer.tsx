import { navigation } from "@/lib/site";
import { Wordmark } from "./wordmark";

/** The photographs on the page and the credit each licence asks for. */
const credits = [
  {
    use: "Engine bay",
    title: "Corolla Sport 8NR-FTS",
    page: "https://commons.wikimedia.org/wiki/File:Corolla_Sport_8NR-FTS.jpg",
    author: "TTTNIS",
    licence: "CC0 1.0",
    licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  {
    use: "Brake",
    title: "Alarm bells!",
    page: "https://commons.wikimedia.org/wiki/File:Alarm_bells!_(25681917701).jpg",
    author: "Riley from Christchurch, New Zealand",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0/",
  },
  {
    use: "Repair shop",
    title: "Car repair shop",
    page: "https://commons.wikimedia.org/wiki/File:Car_repair_shop.jpg",
    author: "Martin Vorel",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-hairline">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 pt-16 sm:px-8 md:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <Wordmark className="text-bone" />
          <p className="max-w-sm text-sm text-ash">
            AI goggles designed to bring verified repair information to the technician at the car.
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
            Photos, shown darkened with an illustrated heads-up overlay. The repair-shop photo as shown
            here is shared under the same CC BY-SA 4.0 license.
          </p>
          <ul className="space-y-1">
            {credits.map((credit) => (
              <li key={credit.page}>
                {credit.use}:{" "}
                <a href={credit.page} className="underline underline-offset-2 hover:text-bone">
                  “{credit.title}”
                </a>{" "}
                by {credit.author},{" "}
                <a href={credit.licenceUrl} className="underline underline-offset-2 hover:text-bone">
                  {credit.licence}
                </a>
              </li>
            ))}
          </ul>
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
