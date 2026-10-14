const principles = [
  {
    title: "Matched to the exact vehicle",
    body: "Answers are tied to the year, make, model and engine, so information for a different variant stays out of yours.",
  },
  {
    title: "The source comes with it",
    body: "Each answer says where it came from, so you can check it before you act on it.",
  },
  {
    title: "No guessed numbers",
    body: "Torque specs, capacities and part numbers come from verified data. When MechLens doesn’t have one, it says so instead of estimating.",
  },
  {
    title: "Honest when it’s unsure",
    body: "If it can’t tell what you’re looking at, it asks you to move closer instead of guessing.",
  },
];

export function Trust() {
  return (
    <section id="trust" aria-labelledby="trust-title" className="bg-graphite py-24 text-on-graphite sm:py-32">
      <div className="mx-auto grid max-w-[1240px] gap-14 px-5 sm:px-8 lg:grid-cols-[5fr_7fr] lg:gap-20">
        <div>
          <h2
            id="trust-title"
            className="text-[clamp(2.125rem,4.4vw,3.5rem)] leading-[1.05] font-medium tracking-[-0.035em]"
          >
            Verified answers, or a clear “not sure.”
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-on-graphite-muted">
            MechLens is designed to answer from professional, verified repair information for the
            vehicle in front of you, and to tell you when it can’t.
          </p>
        </div>
        <ul className="grid gap-x-12 sm:grid-cols-2">
          {principles.map((principle) => (
            <li key={principle.title} className="border-t border-graphite-line py-7">
              <h3 className="text-xl font-semibold tracking-[-0.015em]">{principle.title}</h3>
              <p className="mt-2 leading-relaxed text-on-graphite-muted">{principle.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
