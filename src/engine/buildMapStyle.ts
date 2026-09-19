import type {
  ExpressionSpecification,
  LayerSpecification,
  StyleSpecification,
} from "maplibre-gl";
import type { PatternSpec, RoadClass, StyleSpec } from "../config/types";
import { makePattern, parsePatternId, patternId } from "./patterns";

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

type PatternLayer = "water" | "green" | "forest" | "buildings";

/** The style colour a pattern sits on, so editing that colour still changes the map. */
function patternBg(spec: StyleSpec, layer: PatternLayer) {
  const c = spec.colors;
  return layer === "water" ? c.water : layer === "green" ? c.green : layer === "forest" ? c.forest : c.buildings[0];
}

function patternFor(spec: StyleSpec, layer: PatternLayer): PatternSpec | undefined {
  const p = spec.patterns?.[layer];
  if (p) return { ...p, bg: patternBg(spec, layer) };
  if (layer === "water" && spec.waterPattern) {
    return { type: "dots", color: spec.colors.waterDots, bg: spec.colors.water, spacing: 8, width: 0.65 };
  }
  return undefined;
}

/** Fill paint for a layer: its pattern if the style defines one, else the flat colour. */
function fill(spec: StyleSpec, layer: PatternLayer, color: string | ExpressionSpecification) {
  const p = patternFor(spec, layer);
  return p ? { "fill-pattern": patternId(p) } : { "fill-color": color };
}

/** Mixes two hex colours; used to derive optional colours a style has not set. */
export function mix(a: string, b: string, t: number) {
  const hex = (x: string) => parseInt(x.replace("#", ""), 16);
  const [A, B] = [hex(a), hex(b)];
  const ch = (sh: number) =>
    Math.round((((A >> sh) & 255) * (1 - t) + ((B >> sh) & 255) * t))
      .toString(16)
      .padStart(2, "0");
  return `#${ch(16)}${ch(8)}${ch(0)}`;
}

/** Resolved values for the optional element colours, for display in the editor. */
export function derivedColors(spec: StyleSpec) {
  const c = spec.colors;
  return {
    landuse: c.landuse ?? mix(c.land, c.outline, 0.07),
    aeroway: c.aeroway ?? mix(c.land, c.outline, 0.16),
    waterway: c.waterway ?? c.water,
    transit: c.transit ?? c.rail,
  };
}

export function buildMapStyle(spec: StyleSpec): StyleSpecification {
  const c = spec.colors;
  // Optional element colours fall back to a subtle tint of the style's own palette.
  const landuseColor = c.landuse ?? mix(c.land, c.outline, 0.07);
  const aerowayColor = c.aeroway ?? mix(c.land, c.outline, 0.16);
  const waterwayColor = c.waterway ?? c.water;
  const transitColor = c.transit ?? c.rail;
  const roadLayout = {
    "line-cap": "round",
    "line-join": "round",
    "line-sort-key": roadSort,
  } as const;

  const layers: LayerSpecification[] = [
    { id: "land", type: "background", paint: { "background-color": c.land } },
    {
      // Built-up and institutional areas: hospitals, schools, industry, cemeteries, retail.
      id: "landuse",
      type: "fill",
      source: SRC,
      "source-layer": "landuse",
      filter: [
        "in",
        ["get", "class"],
        ["literal", ["residential", "commercial", "industrial", "retail", "cemetery", "hospital", "school", "university", "stadium", "railway", "quarry"]],
      ],
      paint: { "fill-color": landuseColor },
    },
    {
      id: "landcover-green",
      type: "fill",
      source: SRC,
      "source-layer": "landcover",
      filter: ["in", ["get", "class"], ["literal", ["grass", "farmland", "wetland"]]],
      paint: fill(spec, "green", c.green),
    },
    {
      id: "landcover-forest",
      type: "fill",
      source: SRC,
      "source-layer": "landcover",
      filter: ["==", ["get", "class"], "wood"],
      paint: fill(spec, "forest", c.forest),
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
      paint: fill(spec, "green", c.green),
    },
    {
      id: "green-outline",
      type: "line",
      source: SRC,
      "source-layer": "landcover",
      paint: { "line-color": c.outline, "line-width": spec.outlineWidth },
    },
    {
      id: "aeroway-area",
      type: "fill",
      source: SRC,
      "source-layer": "aeroway",
      filter: ["==", ["geometry-type"], "Polygon"],
      paint: { "fill-color": aerowayColor },
    },
    {
      id: "water",
      type: "fill",
      source: SRC,
      "source-layer": "water",
      paint: fill(spec, "water", c.water),
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
      // Rivers, canals, streams and ditches, sized by class.
      paint: {
        "line-color": waterwayColor,
        "line-width": [
          "interpolate",
          ["exponential", 2],
          ["zoom"],
          12,
          ["match", ["get", "class"], "river", 1.6, "canal", 1.2, 0.5],
          18,
          ["match", ["get", "class"], "river", 26, "canal", 18, ["literal", 7]],
        ],
      },
    },
    {
      id: "pier",
      type: "line",
      source: SRC,
      "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["pier", "ferry"]]],
      paint: {
        "line-color": c.outline,
        "line-width": ["interpolate", ["exponential", 2], ["zoom"], 12, 0.4, 18, 5],
      },
    },
    {
      id: "building",
      type: "fill",
      source: SRC,
      "source-layer": "building",
      // Alternate the palette by feature id, like prettymaps' random building colours.
      paint: fill(
        spec,
        "buildings",
        (c.buildings.length === 1
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
      ),
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
      id: "aeroway-line",
      type: "line",
      source: SRC,
      "source-layer": "aeroway",
      filter: ["==", ["geometry-type"], "LineString"],
      paint: {
        "line-color": aerowayColor,
        "line-width": [
          "interpolate",
          ["exponential", 2],
          ["zoom"],
          11,
          ["match", ["get", "class"], "runway", 2, 0.6],
          16,
          ["match", ["get", "class"], "runway", 26, ["literal", 8]],
        ],
      },
    },
    {
      id: "transit",
      type: "line",
      source: SRC,
      "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["transit"]]],
      paint: {
        "line-color": transitColor,
        "line-width": ["interpolate", ["exponential", 2], ["zoom"], 12, 0.4, 18, 4],
        "line-dasharray": [2, 2],
        "line-opacity": 0.8,
      },
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

/** Wires a map so pattern images referenced by the style are generated on demand. */
export function registerPatternProvider(map: import("maplibre-gl").Map) {
  map.on("styleimagemissing", (e) => {
    const p = parsePatternId(e.id);
    if (p && !map.hasImage(e.id)) map.addImage(e.id, makePattern(p), { pixelRatio: 2 });
  });
}
