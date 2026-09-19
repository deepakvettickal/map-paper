# map-paper — Plan

## Vision
The best open-source tool for artistic map posters and wallpapers. It blends the inked, hand-crafted look of
[prettymaps](https://github.com/marceloprates/prettymaps) with the speed and UI of
[terraink](https://github.com/yousifamanuel/terraink). It grows into a large library of styles inspired by historical
cartographers, cultural traditions, the design philosophies of modern map apps, and original ideas.

Everything is driven by a **JSON style spec**, as in both reference projects.

## Decisions
- **Fresh codebase** (MIT). Ideas are reimplemented and no AGPL code is copied (prettymaps and terraink are AGPL-3.0).
  MIT code from [prettymapp](https://github.com/chrieke/prettymapp) may be borrowed with attribution.
- **Local first.** It runs on a local dev server, and hosting comes later.
- **Fast by design.** Rendering happens in the browser on the GPU (MapLibre GL) from pre-built vector tiles (OpenFreeMap).
  There are no per-render Overpass queries, which are what makes the Python tools slow.

## Stack
- Vite, React and TypeScript
- MapLibre GL JS
- Zustand for state
- OpenFreeMap vector tiles (free, no API key)
- Nominatim geocoding

## Architecture (v1)
```
src/
  config/types.ts            StyleSpec + poster types
  styles/*.json              one JSON file per style
  engine/buildMapStyle.ts    StyleSpec -> MapLibre style
  engine/exportPng.ts        high-DPI offscreen render + frame/text compositing
  poster/Poster.tsx          map + frame + title/subtitle/coords overlay
  ui/Sidebar.tsx             search, size, colours, text, export
  services/geocode.ts        Nominatim search
  store.ts                   Zustand store
```

## Engine roadmap (phases)
| Phase | Capability | Unlocks |
|---|---|---|
| 1 | **Flat + casing**: JSON colours, road casings, building palettes, fill patterns, frame and text | Flat, modern and graphic styles |
| 2 | **Art renderer**: paper grain, hatching, stippling, wobbly ink lines, washes, misregistration (custom WebGL shaders over the same vector tiles) | Most historical, cultural and craft styles |
| 3 | **3D**: building extrusion, DEM terrain, hillshade, tilted/axonometric cameras | Bollmann, Berann, Swiss relief, "Fruit" |
| 4 | **Ornaments**: SVG library of cartouches, compass roses, rhumb lines, sea creatures, borders, seals | Mercator, Ortelius, Blaeu, Portolan, Piri Reis… |
| 5 | **Poster extras**: border library, custom text blocks, coordinate / plus-code / what3words signature, SVG/PDF export | All styles |

## Master style table
Engine capability key: **F** = flat, **C** = casing, **T** = texture/hatching (art renderer), **3D**, **O** = ornaments.
Status key: ✅ done · 🚧 in progress · ⬜ planned.

| # | Style name | Category | Inspiration / credit | Visual signature | Engine | Phase | Status |
|---|---|---|---|---|---|---|---|
| 1 | Heerhugowaard | Tribute | prettymaps "heerhugowaard" preset (Marcelo Prates) | Cream land, dotted blue water, coral/brown buildings, thick dark road casings | F, C | 1 | 🚧 |
| 2 | Mercator | Historical | Gerardus Mercator, 1569 atlas | Copper-engraved lines, italic Latin lettering, strapwork cartouche | T, O | 4 | ⬜ |
| 3 | Ortelius | Historical | Abraham Ortelius, *Theatrum Orbis Terrarum* 1570 | Hand-coloured washes, ornate frames, sea monsters, ships | T, O | 4 | ⬜ |
| 4 | Blaeu | Historical | Willem & Joan Blaeu, Dutch Golden Age atlases | Rich gold/green/rose washes, heavy decorative borders | T, O | 4 | ⬜ |
| 5 | Piri Reis | Historical | Piri Reis map, Ottoman, 1513 | Parchment, rhumb-line networks, compass roses, bright miniature colours | T, O | 4 | ⬜ |
| 6 | Portolan | Historical | Mediterranean portolan charts, 14th–16th c. | Wind-rose lines on vellum, red/black coastal names | T, O | 4 | ⬜ |
| 7 | Nolli | Historical | Giambattista Nolli, *Pianta di Roma* 1748 | Figure-ground: black buildings, white public space, fine hatching | F, T | 1→2 | ⬜ |
| 8 | Cassini | Historical | Cassini map of France, 18th c. | Hachured relief, fine black engraving, sparse colour | T, 3D | 2 | ⬜ |
| 9 | Snow | Historical | John Snow, cholera map 1854 | Plain black on cream, data dots | F | 1 | ⬜ |
| 10 | Booth | Historical | Charles Booth, poverty map 1889 | Street-colour coding on grey-beige paper | F, T | 1→2 | ⬜ |
| 11 | Sanborn | Historical | Sanborn fire-insurance maps | Pastel material colours (pink brick, yellow wood), crisp outlines | F, C | 1 | ⬜ |
| 12 | Ordnance | Historical | Ordnance Survey, 1st edition | Stippled woods, hachures, copperplate labels | T | 2 | ⬜ |
| 13 | Imhof Relief | Historical | Eduard Imhof, Swiss shaded relief | Painted shaded relief, aerial-perspective colour | T, 3D | 3 | ⬜ |
| 14 | Harry Beck | Historical | Harry Beck, London Underground 1933 | 45°/90° lines, bold primaries, white background | F | 1 | ⬜ |
| 15 | Vignelli | Historical | Massimo Vignelli, NYC subway 1972 | Beck-like, stricter Helvetica grid | F | 1 | ⬜ |
| 16 | Bollmann | Historical | Hermann Bollmann bird's-eye city maps | Axonometric line-drawn buildings | 3D, T | 3 | ⬜ |
| 17 | Berann | Historical | Heinrich Berann panoramas | Painted 3D terrain, blue haze horizon | 3D, T | 3 | ⬜ |
| 18 | Fantasy | Historical | Pauline Baynes / Tolkien-era fantasy maps | Ink hills, tree clusters, uncial lettering | T, O | 4 | ⬜ |
| 19 | Ukiyo-e | Cultural | Edo-period Japanese woodblock maps | Flat woodblock colours, indigo wave-pattern water, gold cloud bands | F, T, O | 2 | ⬜ |
| 20 | Shan-shui | Cultural | Chinese ink-wash landscape painting | Ink wash, xuan-paper texture, red seal stamp signature | T, O | 2 | ⬜ |
| 21 | al-Idrisi | Cultural | Muhammad al-Idrisi, *Tabula Rogeriana* 1154 | South-up option, geometric borders, gold and lapis | F, O | 4 | ⬜ |
| 22 | Mughal | Cultural | Mughal miniature painting | Jewel tones, floral borders | F, T, O | 4 | ⬜ |
| 23 | Codex | Cultural | Aztec codices (e.g. Mapa Quinatzin) | Footprint paths, glyphs, flat earth tones | F, O | 4 | ⬜ |
| 24 | Soviet Topo | Cultural | Soviet military topographic maps | Precise brown/green/blue, grid overlay | F, C | 1 | ⬜ |
| 25 | Bauhaus | Cultural | Bauhaus / Swiss International Style | Grid, primaries, sans-serif, asymmetric layout | F | 1 | ⬜ |
| 26 | Art Deco | Cultural | 1920s–30s Art Deco posters | Gold on navy, geometric sunburst frame | F, O | 1→4 | ⬜ |
| 27 | Blueprint | Cultural | Architectural cyanotype blueprints | White lines on Prussian blue, grid | F | 1 | ⬜ |
| 28 | Risograph | Cultural | Risograph / screenprint zines | 2–3 spot inks, grain, deliberate misregistration | T | 2 | ⬜ |
| 29 | Search | Provider-inspired | Google Maps design philosophy | Neutral base, colour only for wayfinding, soft pastels | F, C | 1 | ⬜ |
| 30 | Drive | Provider-inspired | Waze design philosophy | Playful, bold rounded roads, cartoon friendliness | F, C | 1 | ⬜ |
| 31 | Fruit | Provider-inspired | Apple Maps design philosophy | Soft 3D, gentle gradients, refined typography | F, 3D | 3 | ⬜ |
| 32 | Here | Provider-inspired | HERE Maps design philosophy | Dense-data clarity, cool greys | F, C | 1 | ⬜ |
| 33 | Toner | Provider-inspired | Stamen Toner | Pure black and white, high contrast | F | 1 | ⬜ |
| 34 | Watercolor | Provider-inspired | Stamen Watercolor | Painted, bleeding washes | T | 2 | ⬜ |
| 35 | Night | Provider-inspired | CARTO Dark Matter | Glowing roads on black | F, C | 1 | ⬜ |
| 36 | Synthwave | Original | 80s retro-futurism | Neon magenta/cyan glow roads on deep purple, horizon grid | F, C, T | 1→2 | ⬜ |
| 37 | Brutalist | Original | Brutalist architecture | Concrete greys, heavy blocks, raw type | F, T | 1→2 | ⬜ |
| 38 | Embroidery | Original | Cross-stitch / embroidery | Stitched lines, fabric texture | T | 2 | ⬜ |
| 39 | Linocut | Original | Linocut printmaking | Carved-edge black lines, ink texture | T | 2 | ⬜ |
| 40 | Circuit | Original | Printed circuit boards | Green PCB, copper traces, via dots at junctions | F, C, T | 1→2 | ⬜ |
| 41 | Contours | Original | Topographic contour art | Contour lines only, no streets | 3D (DEM), F | 3 | ⬜ |
| 42 | Cyanotype | Original | Anna Atkins cyanotype prints | Prussian blue with sun-bleached whites, paper texture | F, T | 2 | ⬜ |
| 43 | Pencil | Original | Graphite sketchbook | Sketchy strokes, cross-hatching, paper grain | T | 2 | ⬜ |
| 44 | Stained Glass | Original | Gothic stained glass | Blocks as jewel-coloured glass, lead-came streets | F, C, T | 2 | ⬜ |
| 45 | Knitted | Original | Knitwear | Knit-stitch texture, wool palette | T | 2 | ⬜ |
| 46 | 8-bit | Original | Pixel-art video games | Pixelated palette-limited render | T | 2 | ⬜ |
| 47 | Constellation | Original | Star charts | Intersections as stars, streets as faint lines on night sky | F, T | 2 | ⬜ |

More vintage references from the project owner will be added here as they come in.

## Verification (v1)
1. `npm install && npm run dev`, then open http://localhost:5173.
2. Search for a location. The map renders instantly in the Heerhugowaard style.
3. Colour edits and title edits update live.
4. Export a PNG at 300 DPI and check that the frame and text are included and sharp.
5. `npm run build` passes.

## Credits
Map data © OpenStreetMap contributors. Tiles from OpenFreeMap. Inspired by prettymaps, prettymapp and terraink.
