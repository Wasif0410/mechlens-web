import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

// Next.js marks not-found responses noindex on its own.
export const metadata: Metadata = {
  title: "Page not found | MechLens",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[1240px] flex-col px-5 py-8 sm:px-8">
      <Link href="/" aria-label="MechLens home" className="self-start text-ink">
        <Wordmark />
      </Link>
      <div className="my-auto max-w-xl py-24">
        <h1 className="text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05] font-medium tracking-[-0.035em]">
          This page doesn’t exist.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-muted">
          The link may be out of date. Everything about MechLens is on the home page.
        </p>
        <Link href="/" className="button-primary mt-8">
          Go to the home page
        </Link>
      </div>
    </main>
  );
}
