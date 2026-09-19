import type {
  ExpressionSpecification,
  LayerSpecification,
  StyleSpecification,
} from "maplibre-gl";
import type { RoadClass, StyleSpec } from "../config/types";

// OpenFreeMap serves OpenMapTiles-schema vector tiles for the whole planet, no API key.
const TILES_URL = "https://tiles.openfreemap.org/planet";
const SRC = "omt";

// Drawn bottom to top, so bigger roads sit on top of smaller ones.
const ROAD_CLASSES: RoadClass[] = [
  "path",
  "service",
  "minor",
  "tertiary",
  "secondary",
  "primary",
  "trunk",
  "motorway",
];

/** Name of the generated water-dot pattern image; encodes colours so a colour change yields a new image. */
export function waterPatternId(spec: StyleSpec) {
  return `dots:${spec.colors.water}:${spec.colors.waterDots}`;
}

/** Width expression: per-class base width at z16, doubling with every zoom level. */
function roadWidth(spec: StyleSpec, factor = 1): ExpressionSpecification {
  const byClass = [
    "match",
    ["get", "class"],
    ...ROAD_CLASSES.flatMap((c) => [c, spec.roadWidths[c] * factor]),
    "track",
    spec.roadWidths.path * factor,
    spec.roadWidths.minor * factor,
  ] as unknown as ExpressionSpecification;
  return [
    "interpolate",
    ["exponential", 2],
    ["zoom"],
    10,
    ["*", byClass, 1 / 64],
    16,
    byClass,
    20,
    ["*", byClass, 16],
  ];
}

function roadColor(spec: StyleSpec): ExpressionSpecification | string {
  const entries = Object.entries(spec.roadColors ?? {});
  if (!entries.length) return spec.colors.road;
  return [
    "match",
    ["get", "class"],
    ...entries.flat(),
    spec.colors.road,
  ] as unknown as ExpressionSpecification;
}

const roadFilter: ExpressionSpecification = [
  "all",
  ["==", ["geometry-type"], "LineString"],
  ["in", ["get", "class"], ["literal", [...ROAD_CLASSES, "track"]]],
];

const roadSort: ExpressionSpecification = ["index-of", ["get", "class"], ["literal", ROAD_CLASSES]];

export function buildMapStyle(spec: StyleSpec): StyleSpecification {
  const c = spec.colors;
  const roadLayout = {
    "line-cap": "round",
    "line-join": "round",
    "line-sort-key": roadSort,
  } as const;

  const layers: LayerSpecification[] = [
    { id: "land", type: "background", paint: { "background-color": c.land } },
    {
      id: "landcover-green",
      type: "fill",
      source: SRC,
      "source-layer": "landcover",
      filter: ["in", ["get", "class"], ["literal", ["grass", "farmland", "wetland"]]],
      paint: { "fill-color": c.green },
    },
    {
      id: "landcover-forest",
      type: "fill",
      source: SRC,
      "source-layer": "landcover",
      filter: ["==", ["get", "class"], "wood"],
      paint: { "fill-color": c.forest },
    },
    {
      id: "landcover-sand",
      type: "fill",
      source: SRC,
      "source-layer": "landcover",
      filter: ["==", ["get", "class"], "sand"],
      paint: { "fill-color": c.sand },
    },
    {
      id: "park",
      type: "fill",
      source: SRC,
      "source-layer": "park",
      paint: { "fill-color": c.green },
    },
    {
      id: "green-outline",
      type: "line",
      source: SRC,
      "source-layer": "landcover",
      paint: { "line-color": c.outline, "line-width": spec.outlineWidth },
    },
    {
      id: "water",
      type: "fill",
      source: SRC,
      "source-layer": "water",
      paint: spec.waterPattern
        ? { "fill-pattern": waterPatternId(spec) }
        : { "fill-color": c.water },
    },
    {
      id: "water-outline",
      type: "line",
      source: SRC,
      "source-layer": "water",
      paint: { "line-color": c.outline, "line-width": spec.outlineWidth * 1.5 },
    },
    {
      id: "waterway",
      type: "line",
      source: SRC,
      "source-layer": "waterway",
      paint: {
        "line-color": c.water,
        "line-width": ["interpolate", ["exponential", 2], ["zoom"], 12, 1, 18, 24],
      },
    },
    {
      id: "building",
      type: "fill",
      source: SRC,
      "source-layer": "building",
      paint: {
        // Alternate the palette by feature id, like prettymaps' random building colours.
        "fill-color": (c.buildings.length === 1
          ? c.buildings[0]
          : [
              "match",
              // Tile ids are OSM id × 10 + type, and neighbouring buildings often have
              // consecutive OSM ids. Golden-ratio hashing scatters consecutive ids evenly.
              [
                "floor",
                [
                  "*",
                  ["%", ["*", ["floor", ["/", ["abs", ["to-number", ["id"], 0]], 10]], 0.6180339887], 1],
                  c.buildings.length,
                ],
              ],
              ...c.buildings.slice(0, -1).flatMap((col, i) => [i, col]),
              c.buildings[c.buildings.length - 1],
            ]) as unknown as ExpressionSpecification,
      },
    },
    {
      id: "building-outline",
      type: "line",
      source: SRC,
      "source-layer": "building",
      paint: { "line-color": c.outline, "line-width": spec.outlineWidth },
    },
    ...(spec.roadGlow
      ? [
          {
            id: "road-glow",
            type: "line",
            source: SRC,
            "source-layer": "transportation",
            filter: roadFilter,
            layout: roadLayout,
            paint: {
              "line-color": spec.roadGlow.color,
              "line-opacity": spec.roadGlow.opacity,
              "line-width": roadWidth(spec, spec.roadGlow.widthFactor),
              "line-blur": roadWidth(spec, spec.roadGlow.widthFactor / 2),
            },
          } satisfies LayerSpecification,
        ]
      : []),
    {
      id: "road-casing",
      type: "line",
      source: SRC,
      "source-layer": "transportation",
      filter: roadFilter,
      layout: roadLayout,
      paint: {
        "line-color": c.roadCasing,
        "line-width": roadWidth(spec, 1 + 2 * spec.casingRatio),
      },
    },
    {
      id: "road",
      type: "line",
      source: SRC,
      "source-layer": "transportation",
      filter: roadFilter,
      layout: roadLayout,
      paint: { "line-color": roadColor(spec), "line-width": roadWidth(spec) },
    },
    {
      id: "rail",
      type: "line",
      source: SRC,
      "source-layer": "transportation",
      filter: ["==", ["get", "class"], "rail"],
      paint: {
        "line-color": c.rail,
        "line-width": ["interpolate", ["exponential", 2], ["zoom"], 12, 0.5, 18, 6],
        "line-dasharray": [3, 2],
      },
    },
  ];

  return {
    version: 8,
    sources: { [SRC]: { type: "vector", url: TILES_URL } },
    layers,
  };
}

/** Draws a tileable dot-pattern image for water. Registered lazily on `styleimagemissing`. */
export function makeWaterPattern(spec: StyleSpec): ImageData {
  const size = 16;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = spec.colors.water;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = spec.colors.waterDots;
  for (const [x, y] of [
    [4, 4],
    [12, 12],
  ]) {
    ctx.beginPath();
    ctx.arc(x, y, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  return ctx.getImageData(0, 0, size, size);
}

/** Wires a map so the water pattern for the current spec is generated on demand. */
export function registerPatternProvider(
  map: import("maplibre-gl").Map,
  getSpec: () => StyleSpec,
) {
  map.on("styleimagemissing", (e) => {
    const spec = getSpec();
    if (e.id === waterPatternId(spec) && !map.hasImage(e.id)) {
      map.addImage(e.id, makeWaterPattern(spec), { pixelRatio: 2 });
    }
  });
}
