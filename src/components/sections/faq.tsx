import { Reveal } from "@/components/reveal";
import { waitlistRoles } from "@/lib/waitlist";

const shopRole = waitlistRoles.find((role) => role.value === "shop")?.label ?? "Shop or dealership";

const questions = [
  {
    q: "When will MechLens be available?",
    a: "We’re building it now. People on the waitlist hear first about early access.",
  },
  {
    q: "Which vehicles will it support?",
    a: "MechLens will start with a focused set of vehicles and add more as the information for each one is verified.",
  },
  {
    q: "Where does the information come from?",
    a: "MechLens is designed to answer only from professional repair information that has been verified, and to show where each answer came from.",
  },
  {
    q: "Is it meant to replace experienced technicians?",
    a: "No. It’s meant to handle the routine lookups, so technicians keep working and senior technicians can focus on the hard problems.",
  },
  {
    q: "How much will it cost?",
    a: "We’ll announce pricing before launch. Join the waitlist and you’ll hear first.",
  },
  {
    q: "Can my shop try it early?",
    a: `Choose “${shopRole}” when you join the waitlist and we’ll follow up about piloting MechLens with your technicians.`,
  },
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-32 sm:py-40">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,40rem)] lg:gap-24">
        <Reveal>
          <h2 id="faq-title" className="display-lg">
            Questions.
          </h2>
        </Reveal>
        <div className="border-b border-hairline">
          {questions.map((item) => (
            <details key={item.q} className="faq-item group border-t border-hairline">
              <summary className="relative cursor-pointer list-none py-6 pr-12 text-lg font-medium tracking-[-0.01em] [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 right-2 size-3.5 -translate-y-1/2 before:absolute before:top-1/2 before:left-0 before:h-px before:w-full before:-translate-y-1/2 before:bg-bone after:absolute after:top-1/2 after:left-0 after:h-px after:w-full after:-translate-y-1/2 after:rotate-90 after:bg-bone after:transition-transform after:duration-300 group-open:after:rotate-0"
                />
              </summary>
              <p className="max-w-xl pb-7 leading-relaxed text-ash">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
