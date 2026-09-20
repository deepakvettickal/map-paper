# CLAUDE.md

Guidance for Claude Code working in this repository.

## Commands

```bash
npm install
npm run dev          # dev server on http://localhost:5173
npm run build        # typecheck + production build
npm run typecheck    # tsc --noEmit

node scripts/snap.mjs <outDir> <styleId…>   # screenshot styles via the local Chrome
node scripts/contact-sheet.mjs <dir> [n]    # combine screenshots for side-by-side review
node scripts/gallery.mjs [ids…]             # rebuild docs/gallery for the README
node scripts/hero.mjs [a] [b] [lat] [lng] [zoom]   # rebuild docs/hero.jpg (two styles spliced)
```

The snapshot scripts need the dev server running. `VIEW="&lat=51.5&lng=-0.12&zoom=14&size=desktop"` overrides
the framing. **Always look at a screenshot after changing a style** — style work cannot be verified by
reading JSON.

## Architecture

```
src/
  config/     types.ts (StyleSpec, PatternSpec, EffectsSpec), sizes.ts, fonts.ts
  styles/     one JSON file per style + index.ts (order + DEFAULT_STYLE_ID)
  engine/     buildMapStyle.ts, patterns.ts, effects.ts, exportPng.ts
  poster/     Poster.tsx (map + overlay + effects canvas), drawOverlay.ts, borders.ts
  ui/         Sidebar.tsx
  services/   geocode.ts (Nominatim)
  store.ts    Zustand store; activeEffects() resolves the live effect settings
```

Rendering path: `StyleSpec` → `buildMapStyle()` → MapLibre style → map canvas. `drawOverlay()` draws the
frame, text panel and credit onto a second canvas. With effects on, `EffectsRenderer` composites both
through one WebGL pass; the same function serves the preview and `renderPoster()` for export.

## Conventions

- **Every style carries its own place.** `defaultView` sets the centre, zoom and text a style opens at, and
  picking a style in the sidebar moves there. The gallery screenshots use it too.
- **Styles are data.** A new style is a new JSON file plus an entry in `src/styles/index.ts`. Never
  special-case a style in engine code; add an optional field to `StyleSpec` instead.
- **Poster units.** Effect sizes and overlay measurements are fractions of the poster's shorter side, so the
  preview and a 300 DPI export match. Never use raw pixels there.
- **Colours stay editable.** Everything drawn must trace back to a `StyleSpec` colour, so the sidebar pickers
  work. Pattern backgrounds follow their layer's colour (see `patternBg`).
- **Optional element colours** (landuse, aeroway, waterway, transit) fall back to a derived tint; keep
  `derivedColors()` in step with `buildMapStyle()`.
- Map apps draw no building or landcover outlines; clean styles should set `outlineWidth: 0` and rely on road
  casings.
- **Palettes are built in OKLCH** (see the generator in the repo history): give each style a deliberate
  lightness ramp for paper, landuse, buildings, casing and roads, so nothing sits within a couple of percent
  of its neighbour. That is what stops a style looking washed out.
- Border rules draw in `colors.text`, not `colors.outline`, because clean styles set `outline` to the land
  colour to suppress building outlines.
- TypeScript is strict, no `any` in new code. Comments explain *why*, not what.

## Gotchas

- **MapLibre is pinned to v5.** v6's tile worker does not load under Vite.
- The export map must be on-screen but invisible (`opacity: 0`), because MapLibre never loads a style into a
  container positioned far off-screen.
- Tile feature ids are OSM id × 10 and neighbours are consecutive, so building palettes use golden-ratio
  hashing to avoid same-colour clumps.
- Chrome pauses rendering for hidden windows: a blank map in a screenshot usually means the window was in the
  background, not a bug.
- A Zustand selector must not build a new object per call; select primitives and combine with `useMemo`.

## Roadmap

1. ✅ Flat colour, casings, patterns, frame and text
2. ✅ Art renderer: paper, grain, wobble, misregistration, pixelation, vignette
3. ⬜ 3D: extruded buildings, DEM terrain, hillshade, tilted cameras (unlocks Bollmann, Berann, Imhof, Contours)
4. ⬜ Ornaments: compass roses, cartouches, rhumb lines, sea creatures, seals (unlocks Mercator, Ortelius,
   Blaeu, Portolan, Piri Reis, al-Idrisi, Mughal, Codex, Fantasy)
5. ⬜ Poster extras: border library, SVG/PDF export, what3words signature

Styles whose flat version exists but whose full look needs a later phase: Ukiyo-e (cloud bands) and Art Deco
(sunburst ornaments).

## Attribution

Map data © OpenStreetMap contributors; tiles by OpenFreeMap. That credit must stay on every exported poster.
prettymaps and terraink are AGPL: reimplement ideas, never copy their code. prettymapp is MIT.
