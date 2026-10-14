import { WaitlistForm } from "@/components/waitlist-form";

export function WaitlistSection() {
  return (
    <section id="waitlist" aria-labelledby="waitlist-title" className="bg-surface py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-5 text-center sm:px-8">
        <h2
          id="waitlist-title"
          className="text-[clamp(2.5rem,5.4vw,4.5rem)] leading-[1.02] font-medium tracking-[-0.04em]"
        >
          Be first to wear it.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
          Join the waitlist to hear first about early access. Shops and dealerships: choose your
          role and we’ll follow up about a pilot.
        </p>
        <div className="mt-10">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
