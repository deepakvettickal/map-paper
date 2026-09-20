# map-paper

Turn any place on Earth into a poster or wallpaper. 32 art styles, from historic cartography to modern map
apps to ideas of our own, all rendered live in the browser and exported at print resolution.

![Grosvenor Square in the Synthwave style](docs/hero.jpg)

## Run it

```bash
npm install
npm run dev     # http://localhost:5173
```

Search for a place, pan and zoom, pick a style, tweak any colour, then export a PNG. Paper sizes go up to
A3 at 300 DPI, and wallpaper sizes up to 4K.

Deep links open a style at a place: `?style=nolli&lat=51.5&lng=-0.12&zoom=14&size=desktop`.

## The styles

Every style is one JSON file in [`src/styles/`](src/styles/), so a new one is a new file — no code needed.
All views below are Grosvenor Square, London.

### Historic cartography

| | | |
|:--:|:--:|:--:|
| ![Nolli](docs/gallery/nolli.jpg)<br>**Nolli** · Rome 1748 | ![Sanborn](docs/gallery/sanborn.jpg)<br>**Sanborn** · fire insurance maps | ![Snow](docs/gallery/snow.jpg)<br>**Snow** · cholera map 1854 |
| ![Booth](docs/gallery/booth.jpg)<br>**Booth** · poverty map 1889 | ![Ordnance](docs/gallery/ordnance.jpg)<br>**Ordnance** · OS first edition | ![Soviet Topo](docs/gallery/soviet-topo.jpg)<br>**Soviet Topo** · military maps |
| ![Harry Beck](docs/gallery/beck.jpg)<br>**Harry Beck** · Underground 1933 | ![Vignelli](docs/gallery/vignelli.jpg)<br>**Vignelli** · NYC subway 1972 | ![Heerhugowaard](docs/gallery/heerhugowaard.jpg)<br>**Heerhugowaard** · prettymaps tribute |

### Culture and craft

| | | |
|:--:|:--:|:--:|
| ![Ukiyo-e](docs/gallery/ukiyo-e.jpg)<br>**Ukiyo-e** · Edo woodblock | ![Bauhaus](docs/gallery/bauhaus.jpg)<br>**Bauhaus** · Swiss International | ![Art Deco](docs/gallery/art-deco.jpg)<br>**Art Deco** · gold on navy |
| ![Blueprint](docs/gallery/blueprint.jpg)<br>**Blueprint** · drafting paper | ![Cyanotype](docs/gallery/cyanotype.jpg)<br>**Cyanotype** · sun prints | ![Stained Glass](docs/gallery/stained-glass.jpg)<br>**Stained Glass** · Gothic windows |
| ![Risograph](docs/gallery/risograph.jpg)<br>**Risograph** · two-ink zine | ![Linocut](docs/gallery/linocut.jpg)<br>**Linocut** · carved block | ![Pencil](docs/gallery/pencil.jpg)<br>**Pencil** · graphite sketch |
| ![Watercolor](docs/gallery/watercolor.jpg)<br>**Watercolor** · painted washes | ![Starry Night](docs/gallery/starry-night.jpg)<br>**Starry Night** · after van Gogh | ![Pastel](docs/gallery/pastel.jpg)<br>**Pastel** · soft tones on beige |

### Map apps, reimagined

Design philosophies borrowed, never copied.

| | | |
|:--:|:--:|:--:|
| ![GMaps Dark](docs/gallery/gmaps-dark.jpg)<br>**GMaps Dark** | ![Search](docs/gallery/search.jpg)<br>**Search** | ![Drive](docs/gallery/drive.jpg)<br>**Drive** |
| ![Here](docs/gallery/here.jpg)<br>**Here** | ![Toner](docs/gallery/toner.jpg)<br>**Toner** | ![Night](docs/gallery/night.jpg)<br>**Night** |

### Originals

| | | |
|:--:|:--:|:--:|
| ![Circuit](docs/gallery/circuit.jpg)<br>**Circuit** · printed boards | ![Synthwave](docs/gallery/synthwave.jpg)<br>**Synthwave** · 80s retro-future | ![Neon](docs/gallery/neon.jpg)<br>**Neon** · signs after dark |
| ![Brutalist](docs/gallery/brutalist.jpg)<br>**Brutalist** · raw concrete | ![8-bit](docs/gallery/8-bit.jpg)<br>**8-bit** · handheld pixel art | |

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

See [PLAN.md](PLAN.md) for the roadmap: 3D terrain and buildings, ornaments such as compass roses and
cartouches, and the styles still waiting on them.

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
