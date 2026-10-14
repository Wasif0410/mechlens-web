# MechLens website

The marketing site for MechLens, AI goggles for automotive technicians. Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, and a 3D model of the goggles built in code with React Three Fiber. It is built to deploy on Vercel with no extra configuration.

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
2. **Replace the concept goggles** with real product renders when they exist (see "The goggles" below), and update the "Concept design" notes in the hero and footer.
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
    sections/             hero, anatomy, how it works, trust, audiences, FAQ, waitlist
    goggles/              the 3D model: geometry, materials, canvas, viewer, scene settings
    site-header.tsx, site-footer.tsx, wordmark.tsx, waitlist-form.tsx
  lib/
    site.ts               name, description, URL, navigation, shared Open Graph fields
    brand.ts              brand colours for code that can’t read the CSS tokens
    waitlist.ts           roles and the validation schema shared by the form and the endpoint (zod/mini)
  assets/                 poster renders and the engine bay photo
scripts/
  render-posters.mjs      renders src/assets/goggles-*.png from the live scene
docs/
  research.md             the study of YC company websites behind the design
```

## The goggles

The goggles are a concept model built from code in `src/components/goggles/`: one visor outline, swept and wrapped into the frame, face seal, lens, brow bar and strap. `scene.ts` holds the camera views, the poster sizes and the positions of the labelled parts, so the anatomy callouts always point at the part the model draws.

The hero shows a pre-rendered poster immediately and swaps in the live model (drag to turn it) once the page is idle, the model is on screen and drawn. Without WebGL, or if the 3D view fails or loses its GPU context, the poster stays.

After changing the model, re-render the posters:

```bash
npx playwright install chromium   # once
npm run dev                       # in one terminal
npm run posters                   # in another (BASE_URL defaults to http://localhost:3000)
```

## Design

- **Palette.** Light studio grey for the product, graphite for the trust section, and one accent: workshop yellow (`#f2b705`) for buttons, the push-to-talk ring and the status light. Tokens are in `src/app/globals.css`.
- **Type.** Archivo, self-hosted (SIL Open Font License, `src/app/fonts/OFL.txt`).
- **Motion.** A short entrance for the hero text, the draggable model, and the FAQ opening. No scroll-driven animation. `prefers-reduced-motion` turns the entrance off.
- **Accessibility.** Skip link, visible focus, labelled form controls, text alternatives for the renders, and colour contrast at WCAG AA or better.

## Credits

Engine bay photo: [“Nissan Sunny N16 2011 Engine bay (QG13DE)”](https://commons.wikimedia.org/wiki/File:Nissan_Sunny_N16_2011_Engine_bay_(QG13DE).jpg) by VScode fanboy, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), cropped, with an answer drawn over it. The credit in the footer is required by the license.

## Dependencies and audit

`npm audit --omit=dev` reports no vulnerabilities in what ships. The advisories `npm audit` lists come from the ESLint toolchain (`eslint-config-next` → `fast-glob` → `micromatch` → `braces`), run only during development and builds, never in the browser or on the server at request time. npm's suggested fix downgrades `eslint-config-next` to the Next.js 14 line, so leave it until `eslint-config-next` ships an update.

`three` is pinned to 0.182.0 because React Three Fiber 9.8 still creates a `THREE.Clock`, which three.js 0.183 and newer deprecate with a console warning on every page load.
