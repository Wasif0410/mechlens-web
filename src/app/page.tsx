import type { Metadata } from "next";
import { Anatomy } from "@/components/sections/anatomy";
import { Audiences } from "@/components/sections/audiences";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Trust } from "@/components/sections/trust";
import { WaitlistSection } from "@/components/sections/waitlist-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { baseOpenGraph } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...baseOpenGraph, url: "/" },
};

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-studio"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Anatomy />
        <HowItWorks />
        <Trust />
        <Audiences />
        <Faq />
        <WaitlistSection />
      </main>
      <SiteFooter />
    </>
  );
}
