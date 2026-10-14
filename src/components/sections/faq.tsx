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
    a: "From professional repair information that is verified before MechLens uses it. Answers show where they came from.",
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
    <section id="faq" aria-labelledby="faq-title" className="border-t border-line py-24 sm:py-32">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 sm:px-8 lg:grid-cols-[5fr_7fr] lg:gap-20">
        <h2
          id="faq-title"
          className="text-[clamp(2.125rem,4.4vw,3.5rem)] leading-[1.05] font-medium tracking-[-0.035em]"
        >
          Common questions.
        </h2>
        <div className="border-b border-line">
          {questions.map((item) => (
            <details key={item.q} className="faq-item group border-t border-line">
              <summary className="relative cursor-pointer list-none py-6 pr-12 text-lg font-semibold tracking-[-0.01em] [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 right-2 size-3.5 -translate-y-1/2 before:absolute before:top-1/2 before:left-0 before:h-0.5 before:w-full before:-translate-y-1/2 before:bg-ink after:absolute after:top-1/2 after:left-0 after:h-0.5 after:w-full after:-translate-y-1/2 after:rotate-90 after:bg-ink after:transition-transform after:duration-300 group-open:after:rotate-0"
                />
              </summary>
              <p className="max-w-xl pb-7 leading-relaxed text-ink-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
