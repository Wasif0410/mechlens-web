"use client";

import { useEffect, useState } from "react";
import { navigation } from "@/lib/site";
import { Wordmark } from "./wordmark";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-500 ${
        scrolled ? "border-hairline bg-night/75 backdrop-blur-xl" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-8 px-5 sm:px-8">
        <a href="#top" aria-label="MechLens home" className="text-bone">
          <Wordmark />
        </a>
        <nav aria-label="Main" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-8">
            {navigation.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-sm text-ash transition-colors duration-200 hover:text-bone">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a href="#waitlist" className="button-primary ml-auto h-9 px-4 text-sm lg:ml-0">
          Join the waitlist
        </a>
      </div>
    </header>
  );
}
