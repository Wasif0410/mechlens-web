"use client";

import { useEffect, useState } from "react";
import { navigation } from "@/lib/site";
import { Wordmark } from "./wordmark";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? "border-line bg-studio/90 backdrop-blur-md" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-8 px-5 sm:px-8">
        <a href="#top" aria-label="MechLens home" className="text-ink">
          <Wordmark />
        </a>
        <nav aria-label="Main" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-7">
            {navigation.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-[15px] text-ink-muted transition-colors duration-200 hover:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a href="#waitlist" className="button-primary ml-auto h-10 px-5 lg:ml-0">
          Join the waitlist
        </a>
      </div>
    </header>
  );
}
