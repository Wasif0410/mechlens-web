# Redesign direction: a darker, premium MechLens site

Research done on 14 October 2026. Reference board: `docs/redesign-references.jpg`.

## What was studied

- **Your 14 examples**, each captured during page load (0.4 s, 1.1 s, 2.2 s) and then screen by screen while scrolling, with fonts, colours and animation techniques read from the live page: Rote, Memorable, DeepMark, Maritime, Sintropix, OpenHack, Lark, Redoubt, The Agentic Data Company, Ageospatial, Cyclon, GrayPass, Decent, Frontrunner (usefr.com).
- **The whole Fall 2026 batch**: 131 of its 132 company sites, measured the same way.
- **The 12 strongest dark sites in that batch**, walked screen by screen: Vorelios, Viraj Aero, Applied Kinetics, isoquant, Inflection Space Systems, Talos, Faraday, Dydema, Capveon, Forward, Sentient OS, Latent.

## What the numbers say

| Signal | Fall 2026 batch (131 sites) |
|---|---|
| Dark hero | 57 sites, 44% |
| Headline weight | Light (400 or less) 51, medium (500–550) 36, bold (600+) 41 |
| Most used headline fonts | Geist 13, Inter 11, Newsreader 6, Space Grotesk 5, DM Sans 5, Instrument Sans 4, Instrument Serif 4, Archivo 4 |
| Also loads a monospace font | 46 |
| Also loads a serif | 31 |
| Video in the page | 49 |
| WebGL canvas | 22 |
| Smooth scrolling (Lenis) | 13 |

How much content is hidden until you scroll to it (scroll reveals), on the sites that feel most premium:

| Site | Elements hidden before scrolling |
|---|---|
| Vorelios | 0 of 9 |
| Viraj Aero | 3 of 46 |
| Cyclon | 3 of 27 |
| Applied Kinetics | 6 of 60 |
| Maritime | 6 of 46 |
| Lark (the exception) | 30 of 60 |

**The premium sites barely animate their content.** The motion is in the media: Viraj Aero and Lark loop a film, Maritime plays a dithered film, and Vorelios has one 3D object fixed behind the page that changes as you scroll. Entrances last 0.9 to 1.2 s with a soft ease-out (OpenHack's hero rises over 1 s and its glow over 1.6 s; Maritime's words rise over 0.9 s). Hover and press transitions take 0.15 to 0.3 s.

## Why the current site reads as basic

1. **The product looks like a toy.** The goggles are simple geometry on flat grey with an oval shadow. Every premium hardware site in the batch shows its product in real light and atmosphere: Vorelios' jet at dusk, Viraj Aero's turbine in a dark room, Inflection's spacecraft over the Earth. This is the biggest single reason the site feels vibe coded.
2. **The layout is the default template.** A centred headline, two pill buttons and the product underneath; sections that alternate white, grey and dark boxes; four-column lists, 01/02/03 steps, two equal cards and chat bubbles. Dozens of sites look exactly like this.
3. **No scale contrast.** Everything sits at similar sizes. The premium sites set one 80–100 px line against small, quiet body text about 470 px wide, with a lot of empty space.
4. **The sections don't tell a story.** Each one is a separate topic. Vorelios reads as one argument (the claim, how it works, the proof, the scope, then the call to action) with the same object on screen throughout. Applied Kinetics opens with the problem ("Disconnected systems stall critical work.") before it shows the product.
5. **The motion is generic.** A fade-up on load and a drag. Nothing in the motion expresses what MechLens does.

## The direction: "the view from under the hood"

One idea runs through the whole page: **MechLens puts the answer in your line of sight.** Its visual signature is the heads-up overlay: a thin amber outline that locks onto a part, and a short answer beside it. Everything else stays dark and quiet so that overlay is what you remember.

### Colour

| Role | Value | Use |
|---|---|---|
| Night | `#0a0b0c` | Page background: warm near-black, no pure black |
| Steel | `#16181b` | Raised surfaces, media frames |
| Bone | `#ece9e2` | Headlines (warm off-white, as Vorelios and Dydema do) |
| Ash | `#9a9fa4` | Body text |
| Hairline | `rgb(255 255 255 / 0.10)` | Rules and borders |
| Signal | `#f2b705` | Only the heads-up overlay and the main button. Amber means "what MechLens shows you". |

### Type

- **Display and body: Instrument Sans** (free, SIL Open Font License). Headlines at weight 400, 80–104 px on desktop, −3.5% letter spacing, line height 0.98. Vorelios and Latent use it; it is far less common than Geist or Inter.
- **Machine readouts: Geist Mono** (free), small and tracked, only for what a machine would print: the amber heads-up overlay, the stamped vehicle plate and an answer's source line. The monospace face never appears in the page chrome (navigation, headings, labels above sections).
- **If there's budget**, a licensed face lifts it further: Söhne (Klim), ABC Diatype (Dinamo) or Neue Montreal (Pangram Pangram).

### Imagery: what was built

The goggles are the code-built 3D model, upgraded for the dark scene: a studio made of strip lights so rim light draws the silhouette, darker graphite and gunmetal materials, a smoked visor that catches long highlights, a glowing amber status light and an amber heads-up overlay that appears on the lens. AI-generated renders were considered and set aside, so every view of the goggles comes from the same model and stays consistent. The engine bay in the heads-up section is a real, licensed photograph. Professional product renders (an industrial designer or a 3D artist working from CAD) remain the next step once the hardware design settles.

### Page flow (as built)

1. **Hero, one full screen.** The goggles, large and lit from behind, on the right; drag to turn them. The headline sits bottom left, Vorelios-style: "The answer, in your line of sight." A one-line subhead says what it is (AI goggles for automotive technicians), with one primary button (Join the waitlist) and a quiet text link.
2. **The problem: the detour route.** "Every job stops for a question." Below it, a route from "Car on the lift" to "Job done" takes a detour for each question (search the manual, ask a senior technician, find a video), each with the question that caused it. As you scroll, the route draws itself, dims, and the direct amber line MechLens offers draws straight through. The scene is pinned while it plays from tablet width up; on phones the route runs top to bottom and draws as it passes. (An earlier draft drifted technician questions behind the statement; it said less, so the route replaced it.)
3. **The product, a pinned scene of about three screens.** The only scroll-driven moment on the page. The goggles stay fixed while three short statements pass beside them, and the model turns to show each part: a camera at your brow, your voice and one button, the answer in your line of sight.
4. **In use, one screen.** The technician's view of a real engine bay: the question appears, the amber outline locks onto the part, and the answer appears beside it, as a short loop. This replaces the numbered steps and the chat bubbles.
5. **Verified answers: the evidence chain.** "Verified answers, or a clear 'not sure.'" A spine draws down the page through four steps, each shown as the object a technician would recognise: a stamped vehicle plate (the exact vehicle), a crop of the part in the engine bay (the part in front of you), a paper service record that gets a "Reviewed" stamp (a reviewed record), and the answer with its source beside the "not sure" it gives when a link is missing. This is the moat, so it gets room.
6. **For shops: the service floor.** "Built for the whole service floor." A top-down plan of six bays with cars on lifts: technicians wearing MechLens pulse as their questions are answered, all linked to one verified source in the aisle, while the senior technician stays on their own job. Three short points sit beneath it as the plan's legend, with "Talk to us about a pilot". On phones the floor turns upright so it stays legible.
7. **FAQ, the final call to action and the footer.** A minimal accordion. The closing shows the goggles front on above "Be first to wear it." and the waitlist form, and the footer carries a giant wordmark (as isoquant and Cyclon do).

### Motion (based on the measurements above)

- **Page load:** the hero image fades up from black over 1.2 s. Headline lines rise 24 px while sharpening from an 8 px blur, over 0.9 s with `cubic-bezier(0.22, 1, 0.36, 1)`, 80 ms apart. The navigation fades in last.
- **Scrolling:** smooth scrolling with Lenis. Three scroll-driven scenes, built with Motion's `useScroll`: the detour route (pinned), the product scene (pinned) and the evidence chain's spine. Each one shows what MechLens does rather than decorating the page.
- **Section headlines:** a single quiet reveal (opacity and 16 px of movement, 0.6 s). Body text and lists stay put. Cards are not staggered in.
- **Ambient:** the heads-up loop and the floor plan's pulses, both only while on screen, and the hero model floating gently. Nothing else moves on its own.
- **Interaction:** 0.15–0.25 s.
- **Reduced motion:** every scene drawn in its final state, still frames for the goggles, no pinning and no loops.

### Avoid

- A centred headline with two pills, sections in alternating coloured boxes, numbered 01/02/03 steps, equal card pairs, icon grids and chat-bubble mock-ups.
- A "Backed by Y Combinator" badge, logo rows, invented numbers or press quotes.
- A monospace face anywhere except machine readouts; small uppercase labels above every heading.
- Content that fades in as you scroll, section after section.

## What stays

The Next.js and Vercel setup, the waitlist endpoint and form logic, metadata, icons, sitemap and the security headers. The redesign replaces the page layer (sections, styles, the visual assets) and adds two small dependencies: Lenis and Motion.
