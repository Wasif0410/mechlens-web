import Image from "next/image";
import frontView from "@/assets/goggles-product-1.png";
import { Reveal } from "@/components/reveal";
import { WaitlistForm } from "@/components/waitlist-form";

export function Closing() {
  return (
    <section id="waitlist" aria-labelledby="waitlist-title" className="relative overflow-hidden">
      <div className="relative mx-auto max-w-[1320px] px-5 pt-24 pb-36 text-center sm:px-8 sm:pt-28 sm:pb-48">
        {/*
          The goggles, front on, closing the page the way it opened. The render has empty space
          around the goggles, so the frame crops it; the strap is on the left, so the image shifts
          right to centre the visor under the headline.
        */}
        <div aria-hidden="true" className="relative mx-auto aspect-[2/1] w-full max-w-[760px] overflow-hidden">
          <Image
            src={frontView}
            alt=""
            fill
            sizes="(max-width: 800px) 100vw, 760px"
            className="translate-x-[6%] object-cover object-[50%_52%]"
          />
        </div>
        <Reveal>
          <h2 id="waitlist-title" className="display-xl mx-auto mt-4 max-w-[12ch]">
            Be first to wear it.
          </h2>
        </Reveal>
        <p className="lead mx-auto mt-7 max-w-[34rem]">
          Join the waitlist to hear first about early access. Shops and dealerships: choose your role
          and we’ll follow up about a pilot.
        </p>
        <div className="mt-12">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
