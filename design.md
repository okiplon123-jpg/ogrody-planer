# Design — NAZWA MARKI (kostka brukowa)

A locked design system for this site. Every page redesign reads this file before emitting code. Extend or amend this file when the system needs to grow; do not override it per page.

## Pre-flight (what was found before touching anything)
- Framework: Next.js 16 (app router), Tailwind v4 (`@import "tailwindcss"`, `@theme inline` in `app/globals.css`), `next/font/google`.
- Previous fonts: Bricolage Grotesque + IBM Plex Mono + Instrument Sans (`app/layout.tsx`) — replaced.
- Previous palette: paper `#efede6`, rust `#d9622b` in `globals.css :root` — replaced.
- Motion: `gsap` installed but unused (hero removed) → stance: motion-cut. Scroll reveals removed.
- Preserved untouched: `/planer` (dark tool UI), `lib/*`, the visualizer logic (`components/visualizer/Visualizer.tsx` — behaviour only, skin changes), `public/zdjecia`, `public/textures`.

## Brief
- Audience: homeowners and small businesses in [miasto i okolice] who want a driveway, terrace, path or yard laid in paving stone. They know what they want to see, not how it is built.
- Use case: one action — call (or try a paver on their own photo first, then call).
- Tone: utilitarian, plainspoken, institutional-adjacent. A trade, not a lifestyle brand.
- Honest-copy rule: no invented numbers, awards, testimonials, years in business, guarantees. Anything the firm has to confirm is written as `[do uzupełnienia]`.

## Genre
editorial

## Theme
Grid, signal-yellow ink. Swiss neo-grotesque systems manual: a visible 12-column hairline grid, one heavy grotesk, one signal ink, zero radius, zero shadow, geometry doing the talking. Tokens live in `tokens.css`.

- Paper `oklch(99% 0.003 255)` (cool near-white) · ink `oklch(16% 0.010 255)` · hairline `oklch(88% 0.004 255)`
- Accent: signal yellow `oklch(82% 0.17 95)`. Surface only (plate, filled buttons, the period square). Never yellow type on paper. Text on yellow is ink.
- One plate per page (the page's loud moment), never a second.

## Typography
- Display: Archivo 800, lowercase, tracking -0.045em, line-height 0.9, `clamp(3.25rem, 10.5vw, 8.5rem)`.
- Section heads: Archivo 800 lowercase, `--text-3xl`.
- Body: Archivo 400, 17px, line-height 1.55, measure ≤ 62ch.
- Label voice: Archivo 600 uppercase 12px, tracking 0.09em, muted. Captions, table heads, units, buttons. Never a kicker above a heading.
- No serif, no mono, no italics in headings. Non-breaking space before units (`m²`, `cm`), Polish quotation marks „ ”.

## Macrostructure family
- Marketing (home, wizualizator): **Workbench** — the live visualizer is the product frame; the page is a guided tour of using it.
- Process pages (usługi): **Narrative Workflow** — numbered stages of how a surface gets laid.
- Content pages (o nas, polityka): **Long Document** — prose, inline heads, no marketing blocks.
- Contact: index of facts + one form.

Navigation: **N1a** (wordmark · usługi · wizualizator · call button) — the site has exactly two content destinations; the rest live in the footer. Footer: **Ft4** dense colophon (contact + sitemap in one block). Persistent **C4** sticky bottom bar with the call button.

## Motion
- Motion-cut. No scroll reveals, no parallax, no autoplay.
- Allowed: hover micro-states on rows and buttons (background to paper-2, title slides 8px, border to ink), 180–240 ms `--ease-out`.
- `prefers-reduced-motion: reduce` removes transitions and smooth scroll.

## CTA voice
- Primary: signal-yellow fill, ink text, label voice, square, 1px ink border — "zadzwoń [telefon]".
- Secondary: transparent, 1px ink border — "przymierz kostkę na zdjęciu".
- Every button states its verb. No "kliknij tutaj", no "dowiedz się więcej".

## What pages MUST share
Wordmark, the visible rails, Archivo single family, the signal yellow (≤ 5% of a viewport outside the plate), button shapes, ruled rows (no cards).

## What pages MAY differ on
Macrostructure within the family, the one object per band (specimen cells, process stages, ruled matrix, cross-section), whether the page carries a plate.

## Imagery
No stock photography of finished jobs (the firm has none to show). Imagery = the visualizer and specimen cells of real paver textures (CC0, see `public/zdjecia/ZRODLA.md`). Own job photos slot into the specimen cells when they exist.

## Per-page allowances
Marketing: one plate. Process / content pages: typography and ruled objects only.

## Exports
`tokens.css` is canonical (imported by `app/globals.css`).
