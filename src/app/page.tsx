import type { Metadata } from "next";
import { Closing } from "@/components/sections/closing";
import { Evidence } from "@/components/sections/evidence";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { InUse } from "@/components/sections/in-use";
import { Problem } from "@/components/sections/problem";
import { Product } from "@/components/sections/product";
import { Shops } from "@/components/sections/shops";
import { Statement } from "@/components/sections/statement";
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
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-bone focus:px-4 focus:py-2 focus:text-night"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Statement />
        <Problem />
        <Product />
        <InUse />
        <Evidence />
        <Shops />
        <Faq />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
