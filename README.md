# map-paper

Make a poster or a wallpaper out of any place on Earth. There are 39 styles to pick from. Some copy old
cartography, some borrow from map apps, and the rest are made up. Everything renders live in the browser and
exports big enough to print.

![Grosvenor Square in the Synthwave style](docs/hero.jpg)

## Run it locally

You need [Node.js](https://nodejs.org) 18 or newer, and a browser that supports WebGL. Chrome, Edge, Firefox
and Safari all work. There is nothing to sign up for and no API key to get.

```bash
git clone https://github.com/deepakvettickal/map-paper.git
cd map-paper
npm install
npm run dev
```

Open **http://localhost:5173**. It takes a moment on first load while the map tiles come down.

Then:

1. **Search for a place** in the sidebar. You can also drag and scroll the poster to frame it yourself.
2. **Pick a style**, then change any of the colours, fonts, border and text if you want to.
3. **Choose a size.** A4, A3, square, phone, or 4K desktop. Paper sizes also have a DPI setting.
4. **Hit Download PNG** and the file goes to your downloads folder.

In a hurry, or just browsing? **Surprise me** picks a style, a city and a fresh palette for you. The sun and
moon button in the corner switches the interface between light and dark.

You can link straight to a style and a place: `?style=nolli&lat=51.5&lng=-0.12&zoom=14&size=desktop`.

Other commands:

```bash
npm run build       # typecheck and build to dist/
npm run preview     # serve the production build
npm run typecheck   # types only
```

**If something looks wrong.** A blank map usually means the browser window was behind another one. Browsers
stop drawing WebGL in the background, so bring the window to the front and it will come back. If an export
fails with a size error, drop the DPI. Very large canvases go past what some graphics cards allow.

## The styles

Each style is a single JSON file in [`src/styles/`](src/styles/), so adding one means adding a file rather
than writing code. Every style also opens at a place that suits it, which is what you see below.

### Historic cartography

| | |
|:--|:--|
| <img src="docs/gallery/nolli.jpg" width="420"><br>**Nolli** - after Giambattista Nolli, 1748<br><sub>Rome, Italy</sub> | <img src="docs/gallery/sanborn.jpg" width="420"><br>**Sanborn** - after Sanborn fire-insurance maps<br><sub>San Francisco, California, USA</sub> |
| <img src="docs/gallery/snow.jpg" width="420"><br>**Snow** - after John Snow's cholera map, 1854<br><sub>Soho, London, UK</sub> | <img src="docs/gallery/booth.jpg" width="420"><br>**Booth** - after Charles Booth's poverty map, 1889<br><sub>Whitechapel, London, UK</sub> |
| <img src="docs/gallery/ordnance.jpg" width="420"><br>**Ordnance** - after Ordnance Survey first edition<br><sub>Edinburgh, Scotland</sub> | <img src="docs/gallery/soviet-topo.jpg" width="420"><br>**Soviet Topo** - after Soviet military topographic maps<br><sub>Saint Petersburg, Russia</sub> |
| <img src="docs/gallery/beck.jpg" width="420"><br>**Harry Beck** - after Harry Beck's Underground diagram, 1933<br><sub>King's Cross, London, UK</sub> | <img src="docs/gallery/vignelli.jpg" width="420"><br>**Vignelli** - after Massimo Vignelli's subway map, 1972<br><sub>Midtown, New York, USA</sub> |

### prettymaps tributes

Colour themes from [prettymaps](https://github.com/marceloprates/prettymaps) and
[prettymapp](https://github.com/chrieke/prettymapp), rebuilt on this engine.

| | |
|:--|:--|
| <img src="docs/gallery/heerhugowaard.jpg" width="420"><br>**Heerhugowaard** - after the prettymaps preset of the same name<br><sub>Stad van de Zon, Heerhugowaard, Netherlands</sub> | <img src="docs/gallery/peach.jpg" width="420"><br>**Peach** - after the Peach theme in prettymapp<br><sub>Macau, China</sub> |
| <img src="docs/gallery/auburn.jpg" width="420"><br>**Auburn** - after the Auburn theme in prettymapp<br><sub>Eixample, Barcelona, Spain</sub> | <img src="docs/gallery/citrus.jpg" width="420"><br>**Citrus** - after the Citrus theme in prettymapp<br><sub>Würzburg, Germany</sub> |

### Culture and craft

| | |
|:--|:--|
| <img src="docs/gallery/ukiyo-e.jpg" width="420"><br>**Ukiyo-e** - after Edo-period woodblock maps<br><sub>Asakusa, Tokyo, Japan</sub> | <img src="docs/gallery/bauhaus.jpg" width="420"><br>**Bauhaus** - after the Bauhaus and Swiss International Style<br><sub>Dessau, Germany</sub> |
| <img src="docs/gallery/art-deco.jpg" width="420"><br>**Art Deco** - after 1920s Art Deco posters<br><sub>Miami Beach, Florida, USA</sub> | <img src="docs/gallery/blueprint.jpg" width="420"><br>**Blueprint** - after architectural blueprints<br><sub>Chandigarh, India</sub> |
| <img src="docs/gallery/cyanotype.jpg" width="420"><br>**Cyanotype** - after Anna Atkins' cyanotypes, 1840s<br><sub>Amsterdam, Netherlands</sub> | <img src="docs/gallery/stained-glass.jpg" width="420"><br>**Stained Glass** - after Gothic stained glass<br><sub>Chartres, France</sub> |
| <img src="docs/gallery/risograph.jpg" width="420"><br>**Risograph** - after risograph zines<br><sub>Kreuzberg, Berlin, Germany</sub> | <img src="docs/gallery/linocut.jpg" width="420"><br>**Linocut** - after linocut printmaking<br><sub>Alfama, Lisbon, Portugal</sub> |
| <img src="docs/gallery/pencil.jpg" width="420"><br>**Pencil** - after a graphite sketchbook<br><sub>Île de la Cité, Paris, France</sub> | <img src="docs/gallery/watercolor.jpg" width="420"><br>**Watercolor** - after painted map washes<br><sub>Kochi, Kerala, India</sub> |
| <img src="docs/gallery/starry-night.jpg" width="420"><br>**Starry Night** - after Van Gogh's The Starry Night, 1889<br><sub>Saint-Rémy-de-Provence, France</sub> |  |

### Moods

| | |
|:--|:--|
| <img src="docs/gallery/pastel.jpg" width="420"><br>**Pastel** - soft pastels on warm beige<br><sub>Nyhavn, Copenhagen, Denmark</sub> | <img src="docs/gallery/sakura.jpg" width="420"><br>**Sakura** - cherry blossom in spring<br><sub>Gion, Kyoto, Japan</sub> |
| <img src="docs/gallery/solarpunk.jpg" width="420"><br>**Solarpunk** - sun, glass and greenery<br><sub>Marina Bay, Singapore</sub> | <img src="docs/gallery/dune.jpg" width="420"><br>**Dune** - desert ochres and deep shade<br><sub>Dubai, United Arab Emirates</sub> |
| <img src="docs/gallery/nordic.jpg" width="420"><br>**Nordic** - pale northern light<br><sub>Reykjavík, Iceland</sub> |  |

### Map apps, reimagined

These borrow the thinking behind each map: how colour is used, how road types are ranked, the overall mood.
No assets or code are taken from them.

| | |
|:--|:--|
| <img src="docs/gallery/gmaps-dark.jpg" width="420"><br>**GMaps Dark** - inspired by the dark mode of Google Maps<br><sub>San Francisco, California, USA</sub> | <img src="docs/gallery/search.jpg" width="420"><br>**Search** - inspired by the light mode of Google Maps<br><sub>Mountain View, California, USA</sub> |
| <img src="docs/gallery/drive.jpg" width="420"><br>**Drive** - inspired by the design philosophy of Waze<br><sub>Tel Aviv, Israel</sub> | <img src="docs/gallery/here.jpg" width="420"><br>**Here** - inspired by the design philosophy of HERE Maps<br><sub>Mitte, Berlin, Germany</sub> |
| <img src="docs/gallery/toner.jpg" width="420"><br>**Toner** - inspired by Stamen Toner<br><sub>The Loop, Chicago, USA</sub> | <img src="docs/gallery/night.jpg" width="420"><br>**Night** - inspired by CARTO Dark Matter<br><sub>Victoria Harbour, Hong Kong</sub> |

### Originals

| | |
|:--|:--|
| <img src="docs/gallery/circuit.jpg" width="420"><br>**Circuit** - printed circuit boards<br><sub>Futian, Shenzhen, China</sub> | <img src="docs/gallery/synthwave.jpg" width="420"><br>**Synthwave** - 80s retro-futurism<br><sub>Santa Monica, California, USA</sub> |
| <img src="docs/gallery/neon.jpg" width="420"><br>**Neon** - neon signs after dark<br><sub>Shinjuku, Tokyo, Japan</sub> | <img src="docs/gallery/brutalist.jpg" width="420"><br>**Brutalist** - raw concrete architecture<br><sub>South Bank, London, UK</sub> |
| <img src="docs/gallery/8-bit.jpg" width="420"><br>**8-bit** - handheld pixel-art games<br><sub>Kyoto, Japan</sub> |  |

## How it works

- **Vector tiles instead of API calls.** [OpenFreeMap](https://openfreemap.org) tiles are drawn on the GPU by
  [MapLibre GL](https://maplibre.org). Panning, zooming and restyling happen straight away, and nothing is
  re-fetched when a colour changes.
- **Styles are just data.** A `StyleSpec` carries the colours, road widths for each class, pattern fills,
  fonts, frame and effects. [`src/engine/buildMapStyle.ts`](src/engine/buildMapStyle.ts) turns that into a
  MapLibre style.
- **The art renderer.** [`src/engine/patterns.ts`](src/engine/patterns.ts) builds hatching, crosshatch,
  stipple, waves and dot fills as they are needed. [`src/engine/effects.ts`](src/engine/effects.ts) then runs
  a single WebGL pass over the finished poster for paper texture, grain, shaky lines, ink misregistration,
  pixelation and vignetting. Everything is measured in poster units, which is why a 300 DPI export looks like
  the preview. There is a switch and a strength slider in the sidebar.
- **Export.** A hidden map renders at a higher pixel ratio, then the frame, text and effects are composited on
  top. A4 at 300 DPI finishes in well under a second on a normal graphics card.

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

[CLAUDE.md](CLAUDE.md) has the architecture notes and what is planned next, including 3D terrain and
buildings, and map ornaments like compass roses and cartouches.

## TODOs

- [ ] Add more styles
- [ ] Publish and serve the tool, for access without cloning the repo

Bigger plans such as 3D terrain, map ornaments and SVG or PDF export are listed in [CLAUDE.md](CLAUDE.md).

## Credits

### Open source used

| Project | Licence | Role |
|---|---|---|
| [MapLibre GL JS](https://maplibre.org) | BSD-3-Clause | GPU map rendering |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL | all map data, © OpenStreetMap contributors |
| [OpenFreeMap](https://openfreemap.org) | free public tiles | planet-wide vector tiles, no API key |
| [Nominatim](https://nominatim.org) | data ODbL | place search |
| [React](https://react.dev), [Vite](https://vite.dev), [Zustand](https://zustand.docs.pmnd.rs), [TypeScript](https://www.typescriptlang.org) | MIT / Apache-2.0 | app framework, build, state, types |
| [Puppeteer](https://pptr.dev) | Apache-2.0 | the screenshot and gallery tooling |
| [Google Fonts](https://fonts.google.com) | OFL | every typeface in the poster text picker |

### Style inspirations

The historic maps are long out of copyright, but their makers are named here anyway. Styles marked
*original* are new designs, so there is nobody to credit.

| Style | Credit |
|---|---|
| Heerhugowaard | the `heerhugowaard` preset from [prettymaps](https://github.com/marceloprates/prettymaps) by Marcelo Prates |
| Peach, Auburn, Citrus | the colour themes of the same names in [prettymapp](https://github.com/chrieke/prettymapp) by Christoph Rieke |
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
| Pencil, Pastel, Sakura, Solarpunk, Dune, Nordic, Neon, Synthwave, Brutalist, Circuit, 8-bit | *original* |

The map-app styles take inspiration from how those maps are designed. They do not copy any assets, code or
map styles, and this project is not affiliated with or endorsed by those companies.

## Tribute

map-paper builds on the work of these open source projects.

- **[prettymaps](https://github.com/marceloprates/prettymaps)** by Marcelo Prates, which started artistic
  OpenStreetMap posters. Its inked look and JSON presets shaped how styles are described here, and the
  *Heerhugowaard* style is a tribute to its preset of the same name.
- **[prettymapp](https://github.com/chrieke/prettymapp)** by Christoph Rieke, a tidier take on prettymaps
  with a friendly web UI.
- **[terraink](https://github.com/yousifamanuel/terraink)** by Yousif Amanuel, which shows how fast and
  polished a browser-based poster maker can be when it is built on vector tiles and MapLibre.

None of the AGPL-licensed code was copied. The ideas were rebuilt from scratch.

## Built with

- [MapLibre GL JS](https://maplibre.org) for GPU map rendering
- [OpenFreeMap](https://openfreemap.org) for free vector tiles
- [OpenStreetMap](https://www.openstreetmap.org/copyright) for map data © OpenStreetMap contributors
- [Nominatim](https://nominatim.org) for place search

## Licence

MIT. Map data is © OpenStreetMap contributors and tiles come from OpenFreeMap, so that credit has to stay on
anything you publish from here.
