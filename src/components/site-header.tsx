"use client";

import { useEffect, useState } from "react";
import { navigation } from "@/lib/site";
import { Wordmark } from "./wordmark";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The section crossing the middle of the screen is the one you're reading.
  useEffect(() => {
    const sections = navigation
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((section): section is HTMLElement => section !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(`#${entry.target.id}`);
          else setCurrent((value) => (value === `#${entry.target.id}` ? null : value));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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
                <a
                  href={item.href}
                  aria-current={current === item.href ? "location" : undefined}
                  className="text-sm text-ash transition-colors duration-200 hover:text-bone aria-[current]:text-bone"
                >
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
