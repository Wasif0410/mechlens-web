import type { Metadata } from "next";
import { Closing } from "@/components/sections/closing";
import { Faq } from "@/components/sections/faq";
import { LensStory } from "@/components/sections/lens-story";
import { Network } from "@/components/sections/network";
import { Product } from "@/components/sections/product";
import { Shops } from "@/components/sections/shops";
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
        <LensStory />
        <Product />
        <Network />
        <Shops />
        <Faq />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
