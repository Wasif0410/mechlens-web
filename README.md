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
2. **Replace the concept goggles** with the real product design when it exists (see "The goggles" below), and update the "Concept design" notes in the hero and footer. The closing section uses one of the rendered posters, so re-rendering updates it too.
3. **Review the copy** in `src/components/sections/`. It describes intended product behaviour (verified sources, vehicle matching, no guessed numbers) and makes no claims about specs, pricing or availability.

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
    sections/             hero, statement, problem (the detour route), product (pinned 3D scene),
                          in use (heads-up view), evidence (verified answers), shops (floor plan),
                          FAQ, closing (waitlist)
    goggles/              the 3D model: geometry, materials, canvas, viewer, scene settings,
                          label projector; poster.ts holds the poster sizes and has no three.js
                          import, so pages can use it without loading the 3D code
    providers.tsx         Lenis smooth scrolling and Motion's reduced-motion setting
    pause-button.tsx      pause and play for the looping demo and the floor plan
    site-header.tsx, site-footer.tsx, wordmark.tsx, waitlist-form.tsx, shot.tsx, reveal.tsx
  lib/
    site.ts               name, description, URL, navigation, shared Open Graph fields
    brand.ts              brand colours for code that can’t read the CSS tokens
    waitlist.ts           roles and the validation schema shared by the form and the endpoint (zod/mini)
    shots.ts              the photographs on the page
    use-prefers-reduced-motion.ts  hydration-safe reduced-motion preference
    use-pinning.ts        whether the screen is big enough for pinned scroll scenes
  assets/                 goggles posters (rendered from the 3D scene) and the engine bay photo
scripts/
  render-posters.mjs      renders src/assets/goggles-*.png from the live scene
docs/
  research.md             the first study of YC company websites
  redesign-direction.md   the research behind the dark redesign
  redesign-references.jpg the reference moments from Fall 2026 YC sites
```

## The goggles

The goggles are a concept model built from code in `src/components/goggles/`: one visor outline, swept and wrapped into the frame, face seal, lens, brow bar and strap, lit in a dark studio made of light panels (nothing is downloaded). `scene.ts` holds the camera views, the positions of the labelled parts and the product scene schedule (`PRODUCT_BEATS`: how far the goggles turn, when the heads-up overlay appears on the lens and when the goggles come apart as the visitor scrolls). `EXPLODE` sets where each part travels in the exploded view.

The hero and the product scene show a pre-rendered poster immediately and swap in the live model once the page is idle, the model is on screen and drawn. In the hero, visitors can drag to turn it; in the product scene it turns with the scroll, comes apart into its layers at the end, and amber labels follow the parts. Without WebGL, or if the 3D view fails or loses its GPU context, the posters stay. Small screens and reduced motion get the four product poses as stills.

After changing the model, re-render the posters:

```bash
npx playwright install chromium   # once
npm run dev                       # in one terminal
npm run posters                   # in another (BASE_URL defaults to http://localhost:3000)
```

To add a product beat, add its entry to `PRODUCT_BEATS` and the section, put any PNG at the new poster's path first (the page imports it, so the dev server won't compile without it), then run `npm run posters`.

## Design

- **Direction.** "The view from under the hood": a warm near-black page, off-white headlines, quiet grey body text and one accent. Amber (`#f2b705`) is kept for the heads-up overlay and the main button; it means "what MechLens shows you". Tokens are in `src/app/globals.css`. The research behind it is in `docs/redesign-direction.md`.
- **Type.** Instrument Sans for everything, light and large for headlines. Geist Mono only for what a machine would print: the heads-up overlay, the stamped vehicle plate and an answer's source line. Both load through `next/font/google` and are self-hosted at build time.
- **Sections.** Each one is drawn from the repair bay rather than built from cards. A one-sentence statement after the hero gives the company's case: every car is a different combination of model, year and engine, so the right answer has to be for the exact vehicle. The problem is a route from "Car on the lift" to "Job done" with a detour for every question (the manual, a senior technician, a video), then the direct line MechLens draws. The product is the pinned 3D scene, ending with the goggles taken apart and every part labelled. In use is a technician's view of a real engine bay. Verified answers is an evidence chain: a vehicle plate, the recognised part, a reviewed service record and the answer, or a "not sure". For shops is a service floor seen from above.
- **Motion.** The hero fades up from black and its lines sharpen into place (CSS, so it runs without JavaScript). The statement's words light up at the pace you read. The scroll drives the scenes: the detour route draws as you go, the goggles turn, then come apart while labels follow their parts, the heads-up view opens out from a framed picture to the full width of the screen, and the evidence chain's spine draws down, lighting each step as it reaches it and stamping the service record. Scenes pin only on screens at least 768px wide and 640px tall (the `pin` variant in `globals.css` and `use-pinning.ts`); smaller screens see them draw as they pass. The heads-up view plays a short loop with player-style controls, and the floor plan pulses; both run only while visible and each has a pause button. The header marks the section you're reading. Section headlines settle once. Smooth scrolling with Lenis. `prefers-reduced-motion` turns all of it off: everything is drawn in its final state, with no smoothing, no pinning and no loops.
- **Accessibility.** Skip link, visible focus, labelled form controls, text alternatives for the renders, and colour contrast at WCAG AA or better.

## Credits

Engine bay photo: [“Nissan Sunny N16 2011 Engine bay (QG13DE)”](https://commons.wikimedia.org/wiki/File:Nissan_Sunny_N16_2011_Engine_bay_(QG13DE).jpg) by VScode fanboy, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), darkened, with an illustrated overlay. The credit in the footer is required by the license.

## Dependencies and audit

`npm audit --omit=dev` reports no vulnerabilities in what ships. The advisories `npm audit` lists come from the ESLint toolchain (`eslint-config-next` → `fast-glob` → `micromatch` → `braces`), run only during development and builds, never in the browser or on the server at request time. npm's suggested fix downgrades `eslint-config-next` to the Next.js 14 line, so leave it until `eslint-config-next` ships an update.

`three` is pinned to 0.182.0 because React Three Fiber 9.8 still creates a `THREE.Clock`, which three.js 0.183 and newer deprecate with a console warning on every page load.
