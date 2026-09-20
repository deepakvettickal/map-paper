# map-paper

Turn any place on Earth into a poster or wallpaper. 32 art styles, from historic cartography to modern map
apps to ideas of our own, all rendered live in the browser and exported at print resolution.

![Grosvenor Square in the Synthwave style](docs/hero.jpg)

## Run it locally

You need [Node.js](https://nodejs.org) 18 or newer (which brings `npm`) and a modern browser with WebGL —
Chrome, Edge, Firefox or Safari. Nothing else: no API keys, no accounts, no server.

```bash
git clone https://github.com/deepakvettickal/map-paper.git
cd map-paper
npm install
npm run dev
```

Open **http://localhost:5173**. The first load fetches map tiles, so give it a second or two.

Then:

1. **Search a place** in the sidebar, or drag and scroll the poster to frame the view yourself.
2. **Pick a style** from the dropdown, and tweak any colour, the typefaces or the text.
3. **Choose a size** — A4, A3, square, phone or 4K desktop — and a DPI for the paper sizes.
4. **Download PNG.** The file lands in your browser's downloads folder.

Deep links open a style at a place: `?style=nolli&lat=51.5&lng=-0.12&zoom=14&size=desktop`.

Other commands:

```bash
npm run build       # typecheck and build to dist/
npm run preview     # serve the production build
npm run typecheck   # types only
```

**Troubleshooting.** A blank map usually means the browser window was hidden or in the background, since
browsers pause WebGL there — bring it to the front and it will draw. If an export fails with a size error,
lower the DPI: very large canvases can exceed what a GPU allows.

## The styles

Every style is one JSON file in [`src/styles/`](src/styles/), so a new one is a new file — no code needed.
Each shot below is the same view of Grosvenor Square, London, exported at 4K desktop-wallpaper proportions.

### Historic cartography

| | |
|:--|:--|
| <img src="docs/gallery/nolli.jpg" width="420"><br>**Nolli** — after Giambattista Nolli, Rome, 1748 | <img src="docs/gallery/sanborn.jpg" width="420"><br>**Sanborn** — after Sanborn fire-insurance maps, 1867–1970s |
| <img src="docs/gallery/snow.jpg" width="420"><br>**Snow** — after John Snow, cholera map of Soho, 1854 | <img src="docs/gallery/booth.jpg" width="420"><br>**Booth** — after Charles Booth, London poverty map, 1889 |
| <img src="docs/gallery/ordnance.jpg" width="420"><br>**Ordnance** — after Ordnance Survey first edition, 1840s–80s | <img src="docs/gallery/soviet-topo.jpg" width="420"><br>**Soviet Topo** — after Soviet military topographic maps |
| <img src="docs/gallery/beck.jpg" width="420"><br>**Harry Beck** — after Harry Beck, London Underground diagram, 1933 | <img src="docs/gallery/vignelli.jpg" width="420"><br>**Vignelli** — after Massimo Vignelli, New York subway map, 1972 |
| <img src="docs/gallery/heerhugowaard.jpg" width="420"><br>**Heerhugowaard** — after the prettymaps preset of the same name |  |

### Culture and craft

| | |
|:--|:--|
| <img src="docs/gallery/ukiyo-e.jpg" width="420"><br>**Ukiyo-e** — after Edo-period Japanese woodblock maps | <img src="docs/gallery/bauhaus.jpg" width="420"><br>**Bauhaus** — after the Bauhaus school and Swiss International Style |
| <img src="docs/gallery/art-deco.jpg" width="420"><br>**Art Deco** — after 1920s–30s Art Deco poster design | <img src="docs/gallery/blueprint.jpg" width="420"><br>**Blueprint** — after architectural blueprints |
| <img src="docs/gallery/cyanotype.jpg" width="420"><br>**Cyanotype** — after Anna Atkins, cyanotype photograms, 1840s | <img src="docs/gallery/stained-glass.jpg" width="420"><br>**Stained Glass** — after Gothic stained-glass windows |
| <img src="docs/gallery/risograph.jpg" width="420"><br>**Risograph** — after risograph and screenprinted zines | <img src="docs/gallery/linocut.jpg" width="420"><br>**Linocut** — after linocut printmaking |
| <img src="docs/gallery/pencil.jpg" width="420"><br>**Pencil** — after a graphite sketchbook | <img src="docs/gallery/watercolor.jpg" width="420"><br>**Watercolor** — after painted map washes |
| <img src="docs/gallery/starry-night.jpg" width="420"><br>**Starry Night** — after Vincent van Gogh, The Starry Night, 1889 | <img src="docs/gallery/pastel.jpg" width="420"><br>**Pastel** — after soft pastels on warm beige |

### Map apps, reimagined

A design philosophy borrowed — colour logic, road hierarchy, mood — never assets or code.

| | |
|:--|:--|
| <img src="docs/gallery/gmaps-dark.jpg" width="420"><br>**GMaps Dark** — inspired by the dark mode of Google Maps | <img src="docs/gallery/search.jpg" width="420"><br>**Search** — inspired by the light mode of Google Maps |
| <img src="docs/gallery/drive.jpg" width="420"><br>**Drive** — inspired by the design philosophy of Waze | <img src="docs/gallery/here.jpg" width="420"><br>**Here** — inspired by the design philosophy of HERE Maps |
| <img src="docs/gallery/toner.jpg" width="420"><br>**Toner** — inspired by Stamen Toner | <img src="docs/gallery/night.jpg" width="420"><br>**Night** — inspired by CARTO Dark Matter |

### Originals

| | |
|:--|:--|
| <img src="docs/gallery/circuit.jpg" width="420"><br>**Circuit** — printed circuit boards | <img src="docs/gallery/synthwave.jpg" width="420"><br>**Synthwave** — 80s retro-futurism |
| <img src="docs/gallery/neon.jpg" width="420"><br>**Neon** — neon signs after dark | <img src="docs/gallery/brutalist.jpg" width="420"><br>**Brutalist** — raw concrete architecture |
| <img src="docs/gallery/8-bit.jpg" width="420"><br>**8-bit** — handheld pixel-art games |  |

## How it works

- **Vector tiles, not API calls.** [OpenFreeMap](https://openfreemap.org) tiles render on the GPU through
  [MapLibre GL](https://maplibre.org), so panning, zooming and restyling are instant. No per-render queries.
- **Styles are data.** A `StyleSpec` holds colours, road widths per class, pattern fills, fonts, frame and
  effects. [`src/engine/buildMapStyle.ts`](src/engine/buildMapStyle.ts) turns it into a MapLibre style.
- **The art renderer.** [`src/engine/patterns.ts`](src/engine/patterns.ts) generates hatching, crosshatch,
  stipple, waves and dots on demand, and [`src/engine/effects.ts`](src/engine/effects.ts) runs one WebGL pass
  over the finished poster for paper texture, grain, hand-drawn wobble, ink misregistration, pixelation and
  vignetting. Sizes are in poster units, so a 300 DPI export matches the preview. A switch and a strength
  slider control it.
- **Export.** An offscreen map renders at a higher pixel ratio, then the frame, text and effects composite on
  top. A4 at 300 DPI takes well under a second on a normal GPU.

### Project layout

```
src/
  config/      style + poster types, paper and wallpaper sizes
  styles/      one JSON file per style
  engine/      style builder, pattern generator, effects shader, PNG export
  poster/      the poster component and its frame/text overlay
  ui/          sidebar controls
  services/    place search (Nominatim)
scripts/       snapshot, contact-sheet and gallery tooling
```

### Working on styles

```bash
node scripts/snap.mjs out/ nolli pencil     # screenshot styles with the local Chrome
node scripts/contact-sheet.mjs out/         # lay them out side by side
node scripts/gallery.mjs                    # rebuild the README gallery
```

See [CLAUDE.md](CLAUDE.md) for the architecture notes and the roadmap: 3D terrain and buildings, and
ornaments such as compass roses and cartouches, plus the styles still waiting on them.

## TODOs

- [ ] Add more styles
- [ ] Publish and serve the tool, for access without cloning the repo

Longer-term plans (3D terrain and buildings, map ornaments, SVG and PDF export) live in
[CLAUDE.md](CLAUDE.md).

## Credits

### Open source we build on

| Project | Licence | What we use it for |
|---|---|---|
| [MapLibre GL JS](https://maplibre.org) | BSD-3-Clause | GPU map rendering |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL | all map data, © OpenStreetMap contributors |
| [OpenFreeMap](https://openfreemap.org) | free public tiles | planet-wide vector tiles, no API key |
| [Nominatim](https://nominatim.org) | data ODbL | place search |
| [React](https://react.dev), [Vite](https://vite.dev), [Zustand](https://zustand.docs.pmnd.rs), [TypeScript](https://www.typescriptlang.org) | MIT / Apache-2.0 | app framework, build, state, types |
| [Puppeteer](https://pptr.dev) | Apache-2.0 | the screenshot and gallery tooling |
| [Google Fonts](https://fonts.google.com) | OFL | every typeface in the poster text picker |

### Style inspirations

Historic maps are long out of copyright; we credit their makers out of respect. Styles marked *original* are
our own and need no credit.

| Style | Credit |
|---|---|
| Heerhugowaard | the `heerhugowaard` preset from [prettymaps](https://github.com/marceloprates/prettymaps) by Marcelo Prates |
| Nolli | Giambattista Nolli, *Nuova Pianta di Roma*, 1748 |
| Sanborn | Sanborn fire-insurance maps, 1867–1970s |
| Snow | John Snow, cholera map of Soho, 1854 |
| Booth | Charles Booth, *Descriptive Map of London Poverty*, 1889 |
| Ordnance | Ordnance Survey first edition, 1840s–80s |
| Harry Beck | Harry Beck, London Underground diagram, 1933 |
| Vignelli | Massimo Vignelli, New York City subway map, 1972 |
| Soviet Topo | Soviet military topographic maps |
| Ukiyo-e | Edo-period Japanese woodblock maps |
| Bauhaus | the Bauhaus school and Swiss International Style |
| Art Deco | 1920s–30s Art Deco poster design |
| Blueprint, Cyanotype | architectural blueprints; Anna Atkins' cyanotype photograms, 1840s |
| Stained Glass | Gothic stained-glass windows |
| Risograph, Linocut | risograph zines and linocut printmaking |
| Watercolor | painted map washes, in the spirit of [Stamen Watercolor](https://maps.stamen.com) |
| Toner | [Stamen Toner](https://maps.stamen.com) |
| Night | [CARTO Dark Matter](https://carto.com/basemaps) |
| Starry Night | Vincent van Gogh, *The Starry Night*, 1889 |
| GMaps Dark, Search | the design philosophy of Google Maps |
| Drive | the design philosophy of Waze |
| Here | the design philosophy of HERE Maps |
| Pencil, Pastel, Neon, Synthwave, Brutalist, Circuit, 8-bit | *original* |

Provider-inspired styles borrow a design philosophy — colour logic, road hierarchy, mood. They copy no
assets, code or map style, and are not affiliated with or endorsed by those companies.

## Tribute

map-paper stands on the shoulders of these open source projects. Thank you!

- **[prettymaps](https://github.com/marceloprates/prettymaps)** by Marcelo Prates. It started artistic
  OpenStreetMap posters, and its inked look and JSON presets inspired our style specs. Our *Heerhugowaard*
  style is a tribute to its preset of the same name.
- **[prettymapp](https://github.com/chrieke/prettymapp)** by Christoph Rieke. A streamlined take on
  prettymaps with a friendly web UI.
- **[terraink](https://github.com/yousifamanuel/terraink)** by Yousif Amanuel. Showed how fast and polished a
  browser-based poster maker can be with vector tiles and MapLibre.

No code was copied from the AGPL-licensed projects; ideas were reimplemented from scratch.

## Built with

- [MapLibre GL JS](https://maplibre.org) for GPU map rendering
- [OpenFreeMap](https://openfreemap.org) for free vector tiles
- [OpenStreetMap](https://www.openstreetmap.org/copyright) for map data © OpenStreetMap contributors
- [Nominatim](https://nominatim.org) for place search

## Licence

MIT. Map data © OpenStreetMap contributors, tiles by OpenFreeMap; keep that credit on anything you publish.
