# MechLens website

The marketing site for MechLens, AI goggles for automotive technicians. Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, a 3D model of the goggles built in code with React Three Fiber, Motion for animation and Lenis for smooth scrolling. It is built to deploy on Vercel with no extra configuration.

## Run it

Requires Node 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

| Script | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (also type-checks) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (Next.js core web vitals and TypeScript rules) |
| `npm run typecheck` | Generates Next.js route types, then runs TypeScript with no output |
| `npm run posters` | Re-render the goggles poster images from the 3D scene (see below) |

## Deploy on Vercel

Import the repository in Vercel and deploy; the framework preset is detected. Nothing else is required.

- **Site URL.** Canonical links, the sitemap and the share image use the production domain Vercel provides (`VERCEL_PROJECT_PRODUCTION_URL`); preview deployments use their own URL. To use another domain, set `NEXT_PUBLIC_SITE_URL` (for example `https://mechlens.com`). Builds outside Vercel without it fall back to `http://localhost:3000`.
- **Static by default.** The page, sitemap, robots file, icon and share image are prerendered at build time. Only `POST /api/waitlist` runs on demand.

## Before launch

1. **Store waitlist sign-ups.** The waitlist is a mock for now: `src/app/api/waitlist/route.ts` validates each request, tells the visitor they’re on the list, and saves nothing (it logs a warning without personal data for each accepted request, so the gap shows in Vercel’s logs). Persist the entry where the route marks it; the form already handles success and error responses. When you do, add rate limiting (for example Vercel Firewall rules or a per-IP limit in the route); a hidden spam-trap field already filters simple bots.
2. **Replace the concept goggles** with the real product design when it exists (see "The goggles" below), and update the "Concept design" notes in the hero, the product scene and the footer. The hero, the product scene and the closing all use the rendered posters, so re-rendering updates them.
3. **Review the copy** in `src/components/sections/` and `src/components/lens/modes.tsx`. It describes intended product behaviour (the modes, the technician network, vehicle matching, review before use) and makes no claims about specs, pricing, customers or availability.
4. **Consider your own photography.** The photos are licensed from Wikimedia Commons (see "Credits"); photos of real MechLens prototypes in real shops would say more. Each photo's overlays are positioned in that photo's coordinates (`src/components/lens/photos.ts`), so a new photo needs its part boxes measured.

## Project structure

```
src/
  app/
    layout.tsx            fonts, metadata, viewport
    page.tsx              the landing page, composed from sections
    globals.css           design tokens (Tailwind @theme) and base styles
    api/waitlist/         waitlist endpoint (validation only for now)
    opengraph-image.tsx   share image, generated at build time
    not-found.tsx         branded 404 page
    robots.ts, sitemap.ts, icon.svg, favicon.ico, apple-icon.png
    dev/render/           development-only page used to render posters (404 in production)
  components/
    sections/             lens story (the hero and the modes, one held scene), product (pinned 3D
                          scene), network (verified answers), shops (the service floor), FAQ,
                          closing (waitlist)
    lens/                 the heads-up scenes: the photos and their part boxes, a cover-fit photo
                          frame with a focal point, brackets and tags, and the three modes
    goggles/              the 3D model: geometry, materials, canvas, viewer, scene settings,
                          label projector; poster.ts holds the poster sizes and has no three.js
                          import, so pages can use it without loading the 3D code
    network/              the objects in the verified-answers story (repair order, vehicle plate,
                          answer)
    lit-words.tsx         text whose words light up as you scroll
    providers.tsx         Lenis smooth scrolling and Motion's reduced-motion setting
    site-header.tsx, site-footer.tsx, wordmark.tsx, waitlist-form.tsx, reveal.tsx
  lib/
    site.ts               name, description, URL, navigation, shared Open Graph fields
    brand.ts              brand colours for code that can’t read the CSS tokens
    waitlist.ts           roles and the validation schema shared by the form and the endpoint (zod/mini)
    use-prefers-reduced-motion.ts  hydration-safe reduced-motion preference
    use-pinning.ts        whether the screen has room for the held two-column network scene
  assets/                 goggles posters and lens mask (rendered from the 3D scene) and the photos
scripts/
  render-posters.mjs      renders src/assets/goggles-*.png from the live scene
docs/
  research.md             the first study of YC company websites
  redesign-direction.md   the research behind the dark redesign
  redesign-references.jpg the reference moments from Fall 2026 YC sites
```

## The goggles

The goggles are a concept model built from code in `src/components/goggles/`: one visor outline, swept and wrapped into the frame, face seal, lens, brow bar and strap, lit in a dark studio made of light panels (nothing is downloaded). `scene.ts` holds the camera views, the positions of the labelled parts and the product scene schedule (`PRODUCT_BEATS`: how far the goggles turn, when the heads-up overlay appears on the lens and when the goggles come apart as the visitor scrolls; the last beat holds from `PRODUCT_HOLD` in `poster.ts`). `EXPLODE` sets where each part travels in the exploded view.

The hero is a rendered poster of the goggles front on (`goggles-front.png`), with the headline placed in the band of lens between the brow bar and the nose bridge. Its lens mask (`goggles-front-lens.png`, the visible lens in white at the same framing) lets the engine bay show through the visor as the hero pushes in. The product scene shows a poster immediately and swaps in the live model once the page is idle, the model is on screen and drawn; it turns with the scroll, comes apart into its layers at the end, and amber labels follow the parts. Without WebGL, or if the 3D view fails or loses its GPU context, the posters stay. Small screens and reduced motion get the four product poses as stills.

After changing the model, re-render the posters:

```bash
npx playwright install chromium   # once
npm run dev                       # in one terminal
npm run posters                   # in another (BASE_URL defaults to http://localhost:3000)
```

To add a product beat, add its entry to `PRODUCT_BEATS` and the section, put any PNG at the new poster's path first (the page imports it, so the dev server won't compile without it), then run `npm run posters`.

## Design

- **Direction.** "The view from under the hood": a warm near-black page, off-white headlines, quiet grey body text and one accent. Amber (`#f2b705`) is kept for the heads-up overlay and the main button; it means "what MechLens shows you". Tokens are in `src/app/globals.css`. The research behind it is in `docs/redesign-direction.md`.
- **Type.** Instrument Sans for everything, light and large for headlines. Geist Mono only for what a machine would print: the heads-up overlay, its part tags and panels, and the stamped vehicle plate. Both load through `next/font/google` and are self-hosted at build time.
- **Sections.** One held scene opens the page: the goggles front on with the headline inside the lens; scrolling pushes in until you're looking through the visor at a real engine bay, then three modes play over what you see: Help (ask about a part and the answer appears beside it), Guide (a job step by step, each step on its part) and Inspection (a checklist that logs itself, on a brake). Then the product scene, the verified-answers story (one repair order from a technician in the network, matched to the exact engine, reviewed, then shown as the answer, or a "not sure"), the service floor (a real shop with the heads-up view marking each role), the FAQ and the closing. All of it is driven by the scroll position, with no timers, and holds where the story needs time. The network scene pins only on screens at least 1024px wide and 736px tall (`use-pinning.ts`); smaller screens get the steps one after another. `prefers-reduced-motion` shows every scene still, in its most telling state.
- **Motion.** The hero fades up and its headline sharpens into place (CSS, so it runs without JavaScript) while the heads-up corners close in around it; a slow highlight crosses the visor. Everything after is tied to the scroll: the push into the lens, the words of the modes' introduction lighting up as you read, brackets that search and then lock onto parts, the camera panning across the engine bay to the next job, the repair order filling in and its review stamp landing, the goggles turning and coming apart, and the shop photo pushing in as its roles are marked. Smooth scrolling with Lenis; the header marks the section you're reading.
- **Accessibility.** Skip link, visible focus, labelled form controls, text alternatives for the renders and photos, the modes and roles as text for screen readers, and colour contrast at WCAG AA or better.

## Credits

Photos from Wikimedia Commons, shown darkened with an illustrated heads-up overlay. The footer carries the same credits, as the licences require.

- Engine bay: [“Corolla Sport 8NR-FTS”](https://commons.wikimedia.org/wiki/File:Corolla_Sport_8NR-FTS.jpg) by TTTNIS, [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
- Brake: [“Alarm bells!”](https://commons.wikimedia.org/wiki/File:Alarm_bells!_(25681917701).jpg) by Riley from Christchurch, New Zealand, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/).
- Repair shop: [“Car repair shop”](https://commons.wikimedia.org/wiki/File:Car_repair_shop.jpg) by Martin Vorel, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

## Dependencies and audit

`npm audit --omit=dev` reports no vulnerabilities in what ships. The advisories `npm audit` lists come from the ESLint toolchain (`eslint-config-next` → `fast-glob` → `micromatch` → `braces`), run only during development and builds, never in the browser or on the server at request time. npm's suggested fix downgrades `eslint-config-next` to the Next.js 14 line, so leave it until `eslint-config-next` ships an update.

`three` is pinned to 0.182.0 because React Three Fiber 9.8 still creates a `THREE.Clock`, which three.js 0.183 and newer deprecate with a console warning on every page load.
