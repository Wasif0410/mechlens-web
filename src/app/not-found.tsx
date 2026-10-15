import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

// Next.js marks not-found responses noindex on its own.
export const metadata: Metadata = {
  title: "Page not found | MechLens",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[1320px] flex-col px-5 py-6 sm:px-8">
      <Link href="/" aria-label="MechLens home" className="self-start text-bone">
        <Wordmark />
      </Link>
      <div className="my-auto max-w-xl py-24">
        <h1 className="display-lg">This page doesn’t exist.</h1>
        <p className="lead mt-6">The link may be out of date. Everything about MechLens is on the home page.</p>
        <Link href="/" className="button-primary mt-10">
          Go to the home page
        </Link>
      </div>
    </main>
  );
}
