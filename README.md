# map-paper

**Try it live: [map-paper.pages.dev](https://map-paper.pages.dev)**

Make a poster or a wallpaper out of any place on Earth. There are 41 styles to pick from. Some copy old
cartography, some borrow from map apps, and the rest are made up. Everything renders live in the browser and
exports big enough to print.

![Venice, half in the Pencil style and half in Stained Glass](docs/hero.jpg)

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

**Save config** writes the whole poster to a JSON file: the style, every colour, the place, the text and the
output size. **Load config** puts it all back. Handy for keeping a look you like, or sending one to someone
else.

In a hurry, or just browsing? **Surprise me** picks a style, a city and a fresh palette for you. The three squares in the
corner switch the interface between light, dark and AMOLED black.

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

### Editor themes

| | |
|:--|:--|
| <img src="docs/gallery/solarized-light.jpg" width="420"><br>**Solarized Light** - after Ethan Schoonover's Solarized Light<br><sub>Copenhagen, Denmark</sub> | <img src="docs/gallery/solarized-dark.jpg" width="420"><br>**Solarized Dark** - after Ethan Schoonover's Solarized Dark<br><sub>Seattle, United States</sub> |

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

### prettymaps tributes

Colour themes from [prettymaps](https://github.com/marceloprates/prettymaps) and
[prettymapp](https://github.com/chrieke/prettymapp), rebuilt on this engine.

| | |
|:--|:--|
| <img src="docs/gallery/heerhugowaard.jpg" width="420"><br>**Heerhugowaard** - after the prettymaps preset of the same name<br><sub>Stad van de Zon, Heerhugowaard, Netherlands</sub> | <img src="docs/gallery/peach.jpg" width="420"><br>**Peach** - after the Peach theme in prettymapp<br><sub>Macau, China</sub> |
| <img src="docs/gallery/auburn.jpg" width="420"><br>**Auburn** - after the Auburn theme in prettymapp<br><sub>Eixample, Barcelona, Spain</sub> | <img src="docs/gallery/citrus.jpg" width="420"><br>**Citrus** - after the Citrus theme in prettymapp<br><sub>Würzburg, Germany</sub> |

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
node scripts/gallery.mjs [ids…]             # rebuild the README gallery
node scripts/hero.mjs [a] [b] [lat] [lng] [zoom]   # rebuild the split hero image
```

[CLAUDE.md](CLAUDE.md) has the architecture notes and what is planned next, including 3D terrain and
buildings, and map ornaments like compass roses and cartouches.

## TODOs

- [ ] Add more styles
- [ ] Publish and serve the tool, for access without cloning the repo
- [ ] Let people send in a palette they made with **Surprise me**, so good ones can become styles
- [ ] Build a gallery of posters people have made, replayed live from their saved configs

Bigger plans such as 3D terrain, map ornaments and SVG or PDF export are listed in [CLAUDE.md](CLAUDE.md).

## Hosting and privacy

The site is a static build plus one serverless function on Cloudflare Pages; see [DEPLOY.md](DEPLOY.md).

Usage is counted anonymously: visits, exports, randomisations and config saves. There are no cookies, no
fingerprinting and no third-party analytics, and the session id lives in `sessionStorage`, so it is gone when
the tab closes. Downloads also record the poster config, which is what the planned gallery will replay.

The browser never touches the database. Events go to this site's own `/api/event`, which holds the
credentials and writes to Firestore; [`firestore.rules`](firestore.rules) denies every client read and write.

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

One row per style, in the order they appear in the app. The historic maps are long out of copyright, but
their makers are named here anyway. Styles marked *original* are new designs, so there is nobody to credit.

| Style | Inspiration |
|---|---|
| Nolli | After Giambattista Nolli, Nuova Pianta di Roma (1748) |
| Sanborn | After the Sanborn fire-insurance maps (1867–1970s) |
| Snow | After John Snow's cholera map of Soho (1854) |
| Booth | After Charles Booth's Descriptive Map of London Poverty (1889) |
| Ordnance | After the Ordnance Survey first edition (1840s-80s) |
| Harry Beck | After Harry Beck's London Underground diagram (1933) |
| Vignelli | After Massimo Vignelli's New York City subway map (1972) |
| Blueprint | After architectural cyanotype blueprints |
| Cyanotype | After Anna Atkins' cyanotype photograms (1840s) |
| Soviet Topo | After Soviet military topographic maps |
| Bauhaus | After the Bauhaus school and Swiss International Style |
| Art Deco | After 1920s-30s Art Deco posters |
| Ukiyo-e | After Edo-period Japanese woodblock maps |
| Stained Glass | *original* - Gothic stained-glass windows |
| Starry Night | After Vincent van Gogh, The Starry Night (1889) |
| Risograph | After risograph and screenprinted zines |
| Linocut | *original* - carved linoleum block prints |
| Pencil | *original* - graphite sketchbook |
| Watercolor | Inspired by [Stamen Watercolor](https://maps.stamen.com) |
| Pastel | *original* - soft pastels on warm beige |
| Sakura | *original* - cherry blossom in spring |
| Solarpunk | *original* - the solarpunk palette of sun and greenery |
| Dune | *original* - desert ochres and deep shade |
| Nordic | *original* - pale northern light |
| Toner | Inspired by [Stamen Toner](https://maps.stamen.com) |
| Night | Inspired by [CARTO Dark Matter](https://carto.com/basemaps) |
| Neon | *original* - neon signs after dark |
| GMaps Dark | Inspired by the dark mode of Google Maps |
| Search | Inspired by the light mode of Google Maps |
| Drive | Inspired by the design philosophy of Waze |
| Here | Inspired by the design philosophy of HERE Maps |
| Synthwave | *original* - 80s retro-futurism |
| Brutalist | *original* - raw concrete architecture |
| Circuit | *original* - printed circuit boards |
| 8-bit | *original* - handheld pixel-art games |
| Solarized Light | After the Solarized Light palette by Ethan Schoonover |
| Solarized Dark | After the Solarized Dark palette by Ethan Schoonover |
| Heerhugowaard | Tribute to [prettymaps](https://github.com/marceloprates/prettymaps) by Marcelo Prates |
| Peach | The Peach theme from [prettymapp](https://github.com/chrieke/prettymapp) by Christoph Rieke |
| Auburn | The Auburn theme from [prettymapp](https://github.com/chrieke/prettymapp) by Christoph Rieke |
| Citrus | The Citrus theme from [prettymapp](https://github.com/chrieke/prettymapp) by Christoph Rieke |

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

## Contributing

Fixes and ideas are welcome. To propose a change:

1. **Fork** the repo (or create a branch if you have push access), and start from an up-to-date `main`:
   `git checkout main && git pull`.
2. **Branch** for your change: `git checkout -b my-change`.
3. Make the change and check it still builds: `npm run build` (this also typechecks). If you touched a style,
   look at a screenshot — style work can't be verified by reading JSON.
4. **Commit and push:** `git commit -am "Describe the change"` then `git push -u origin my-change`.
5. **Open a pull request** against `main`: `gh pr create` (or use the GitHub "Compare & pull request" button).
   Describe what changed and why.
6. **Request approval.** `main` is protected, so every PR needs a review before it can merge. Add the
   maintainer as a reviewer (`gh pr edit --add-reviewer deepakvettickal`) and wait for the ✅ before merging.
   Please don't force-merge or push directly to `main`.

## Licence

MIT. Map data is © OpenStreetMap contributors and tiles come from OpenFreeMap, so that credit has to stay on
anything you publish from here.

---

This whole project was vibecoded over a weekend using Claude Code, and hence it's susceptible to bugs, errors
and mistakes. All fixes and suggestions are welcome.
