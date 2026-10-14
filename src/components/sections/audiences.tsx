import { type WaitlistRole, preselectRole } from "@/lib/waitlist";

const audiences: Array<{
  id: string;
  title: string;
  lede: string;
  points: string[];
  action: { label: string; role: WaitlistRole; primary: boolean };
}> = [
  {
    id: "technicians",
    title: "Technicians",
    lede: "Stay on the car and keep the job moving.",
    points: [
      "Identify an unfamiliar part without stopping",
      "Locate components and connectors on the car in front of you",
      "Specs for the exact vehicle, not a forum guess",
      "Learn the job while you’re doing it",
    ],
    action: { label: "Join the waitlist", role: "technician", primary: false },
  },
  {
    id: "shops",
    title: "Shops and dealerships",
    lede: "Built to bring every technician up to speed.",
    points: [
      "Help apprentices work through jobs on their own",
      "Fewer routine questions for your senior technicians",
      "The same sourced answers across the whole floor",
      "Interested in a pilot? Tell us about your service department",
    ],
    action: { label: "Talk to us about a pilot", role: "shop", primary: true },
  },
];

export function Audiences() {
  return (
    <section aria-labelledby="audiences-title" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <h2
          id="audiences-title"
          className="max-w-3xl text-[clamp(2.125rem,4.4vw,3.5rem)] leading-[1.05] font-medium tracking-[-0.035em]"
        >
          For the technician on the car, and the shop behind them.
        </h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {audiences.map((audience) => (
            <article
              key={audience.id}
              id={audience.id}
              aria-labelledby={`${audience.id}-title`}
              className="flex flex-col rounded-3xl bg-surface p-8 sm:p-10"
            >
              <h3 id={`${audience.id}-title`} className="text-[1.75rem] leading-tight font-medium tracking-[-0.025em]">
                {audience.title}
              </h3>
              <p className="mt-2 text-lg text-ink-muted">{audience.lede}</p>
              <ul className="mt-8 flex-1 divide-y divide-line border-y border-line">
                {audience.points.map((point) => (
                  <li key={point} className="py-4 text-[17px]">
                    {point}
                  </li>
                ))}
              </ul>
              <a
                href="#waitlist"
                {...preselectRole(audience.action.role)}
                className={`mt-8 self-start ${audience.action.primary ? "button-primary" : "button-secondary"}`}
              >
                {audience.action.label}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
