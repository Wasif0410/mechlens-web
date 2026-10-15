/** Site-wide facts, shared by metadata, navigation and the sitemap. */

/**
 * The site's origin (scheme and host, no trailing slash), used for canonical links, the sitemap
 * and the share image.
 *
 * 1. NEXT_PUBLIC_SITE_URL, if set (for example "https://mechlens.com" or "mechlens.com").
 * 2. On Vercel preview deployments, the preview's own URL, so previews never point at production.
 * 3. On Vercel production, the project's production domain.
 * 4. Otherwise http://localhost:3000.
 */
function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return new URL(/^https?:\/\//.test(explicit) ? explicit : `https://${explicit}`).origin;
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

export const site = {
  name: "MechLens",
  title: "MechLens | AI goggles for automotive technicians",
  description:
    "MechLens is building AI goggles for automotive technicians: they see the part in front of you, hear your question and answer with verified repair information for the exact vehicle.",
  url: siteUrl(),
} as const;

/**
 * Open Graph fields shared by every page. Metadata merges shallowly, so a page that sets its own
 * `openGraph` spreads this in rather than replacing it.
 */
export const baseOpenGraph = {
  type: "website",
  siteName: site.name,
  title: site.title,
  description: site.description,
  locale: "en_US",
} as const;

export const navigation = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#product", label: "Product" },
  { href: "#trust", label: "Verified answers" },
  { href: "#shops", label: "For shops" },
  { href: "#faq", label: "FAQ" },
] as const;
