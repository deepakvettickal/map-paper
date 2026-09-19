# map-paper
Open source tool to generate artistic wallpapers / posters from maps.

## Run locally
```bash
npm install
npm run dev     # http://localhost:5173
```

Search for a place, pan and zoom the poster, change colours and text, and export a print-resolution PNG.
Styles are plain JSON files in `src/styles/`. See [PLAN.md](PLAN.md) for the roadmap and the full style list.

## Tribute
map-paper stands on the shoulders of these open source projects. Thank you!

- **[prettymaps](https://github.com/marceloprates/prettymaps)** by Marcelo Prates. It started artistic OpenStreetMap
  posters, and its inked look and JSON presets inspired our style specs. Our first style, *Heerhugowaard*, is a tribute to its preset of the same name.
- **[prettymapp](https://github.com/chrieke/prettymapp)** by Christoph Rieke. A streamlined take on prettymaps with
  a friendly web UI.
- **[terraink](https://github.com/yousifamanuel/terraink)** by Yousif Amanuel. Showed how fast and polished a
  browser-based poster maker can be with vector tiles and MapLibre.

No code was copied from the AGPL-licensed projects; ideas were reimplemented from scratch.

## Built with
- [MapLibre GL JS](https://maplibre.org) for GPU map rendering
- [OpenFreeMap](https://openfreemap.org) for free vector tiles
- [OpenStreetMap](https://www.openstreetmap.org/copyright) for map data © OpenStreetMap contributors
- [Nominatim](https://nominatim.org) for place search
