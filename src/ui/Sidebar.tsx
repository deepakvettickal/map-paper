import { useEffect, useState } from "react";
import { activeEffects, formatCoords, usePoster } from "../store";
import { hasEffects } from "../engine/effects";
import { STYLES } from "../styles";
import { SIZES, pixelSize } from "../config/sizes";
import { searchPlaces, type Place } from "../services/geocode";
import { downloadBlob, renderPoster } from "../engine/exportPng";
import { previewSize } from "../poster/Poster";
import type { StyleSpec } from "../config/types";

const COLOR_LABELS: [keyof StyleSpec["colors"], string][] = [
  ["land", "Land"],
  ["water", "Water"],
  ["waterDots", "Water dots"],
  ["green", "Parks & grass"],
  ["forest", "Forest"],
  ["sand", "Sand"],
  ["road", "Roads"],
  ["roadCasing", "Road casing"],
  ["outline", "Outlines"],
  ["rail", "Rail"],
  ["frame", "Frame"],
  ["text", "Text"],
];

function LocationSearch() {
  const jumpTo = usePoster((s) => s.jumpTo);
  const set = usePoster((s) => s.set);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      searchPlaces(query, ctrl.signal)
        .then((r) => {
          setResults(r);
          setError(null);
        })
        .catch((e) => e.name !== "AbortError" && setError(String(e.message ?? e)));
    }, 450);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  const choose = (p: Place) => {
    jumpTo(p.center, 15);
    const parts = p.displayName.split(",").map((s) => s.trim());
    set({ title: p.name, subtitle: parts.length > 1 ? `${parts[1]}, ${parts[parts.length - 1]}` : "" });
    setQuery("");
    setResults([]);
  };

  return (
    <div className="search">
      <input
        placeholder="Search a place…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {error && <div className="hint error">{error}</div>}
      {results.length > 0 && (
        <ul className="results">
          {results.map((p) => (
            <li key={p.displayName} onClick={() => choose(p)}>
              <strong>{p.name}</strong>
              <span>{p.displayName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Sidebar() {
  const s = usePoster();
  const [status, setStatus] = useState<string | null>(null);
  const size = SIZES.find((z) => z.id === s.sizeId)!;
  const px = pixelSize(size, s.dpi);

  const doExport = async () => {
    setStatus("Rendering…");
    try {
      const t0 = performance.now();
      const blob = await renderPoster({
        spec: s.spec,
        view: s.view,
        text: {
          title: s.title,
          subtitle: s.subtitle,
          coords: s.showCoords ? formatCoords(s.view.center) : null,
          show: s.showText,
          scale: s.textScale,
        },
        previewWidth: previewSize.width,
        previewHeight: previewSize.height,
        ...px,
        fx: activeEffects(s),
      });
      const slug = (s.title || "map").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      downloadBlob(blob, `${slug}-${s.spec.id}-${px.width}x${px.height}.png`);
      setStatus(`Done in ${((performance.now() - t0) / 1000).toFixed(1)}s (${(blob.size / 1e6).toFixed(1)} MB)`);
    } catch (e) {
      setStatus(`Export failed: ${(e as Error).message}`);
    }
  };

  return (
    <aside className="sidebar">
      <h1>map-paper</h1>

      <section>
        <h2>Location</h2>
        <LocationSearch />
        <div className="hint">{formatCoords(s.view.center)} · z{s.view.zoom.toFixed(1)}</div>
      </section>

      <section>
        <h2>Style</h2>
        <select
          value={s.spec.id}
          onChange={(e) => s.setSpec(STYLES.find((st) => st.id === e.target.value)!)}
        >
          {STYLES.map((st) => (
            <option key={st.id} value={st.id}>
              {st.name}
            </option>
          ))}
        </select>
        <div className="hint">{s.spec.credit}</div>
        <button className="link" onClick={() => s.setSpec(STYLES.find((st) => st.id === s.spec.id)!)}>
          Reset colours
        </button>
      </section>

      <section>
        <h2>Art renderer</h2>
        {hasEffects(s.spec.effects) ? (
          <>
            <label className="check">
              <input type="checkbox" checked={s.fxOn} onChange={(e) => s.set({ fxOn: e.target.checked })} />
              Paper, grain &amp; ink effects
            </label>
            <label className="range">
              Strength
              <input
                type="range"
                min={0}
                max={2}
                step={0.05}
                value={s.fxAmount}
                disabled={!s.fxOn}
                onChange={(e) => s.set({ fxAmount: Number(e.target.value) })}
              />
              <span>{Math.round(s.fxAmount * 100)}%</span>
            </label>
          </>
        ) : (
          <div className="hint">This style is intentionally clean and digital.</div>
        )}
      </section>

      <section>
        <h2>Text</h2>
        <label className="check">
          <input
            type="checkbox"
            checked={s.showText}
            onChange={(e) => s.set({ showText: e.target.checked })}
          />
          Show text
        </label>
        <input value={s.title} placeholder="Title" onChange={(e) => s.set({ title: e.target.value })} />
        <input
          value={s.subtitle}
          placeholder="Subtitle"
          onChange={(e) => s.set({ subtitle: e.target.value })}
        />
        <label className="check">
          <input
            type="checkbox"
            checked={s.showCoords}
            onChange={(e) => s.set({ showCoords: e.target.checked })}
          />
          Show coordinates
        </label>
        <label className="range">
          Size
          <input
            type="range"
            min={0.4}
            max={2}
            step={0.05}
            value={s.textScale}
            disabled={!s.showText}
            onChange={(e) => s.set({ textScale: Number(e.target.value) })}
          />
          <span>{Math.round(s.textScale * 100)}%</span>
        </label>
      </section>

      <section>
        <h2>Colours</h2>
        <div className="colors">
          {COLOR_LABELS.map(([key, label]) => (
            <label key={key}>
              <input
                type="color"
                value={s.spec.colors[key] as string}
                onChange={(e) => s.setColor(key, e.target.value)}
              />
              {label}
            </label>
          ))}
          {s.spec.colors.buildings.map((col, i) => (
            <label key={`b${i}`}>
              <input
                type="color"
                value={col}
                onChange={(e) => {
                  const next = [...s.spec.colors.buildings];
                  next[i] = e.target.value;
                  s.setColor("buildings", next);
                }}
              />
              Building {i + 1}
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2>Export</h2>
        <select value={s.sizeId} onChange={(e) => s.set({ sizeId: e.target.value })}>
          {SIZES.map((z) => (
            <option key={z.id} value={z.id}>
              {z.label}
            </option>
          ))}
        </select>
        {size.unit === "mm" && (
          <select value={s.dpi} onChange={(e) => s.set({ dpi: Number(e.target.value) })}>
            {[150, 200, 300].map((d) => (
              <option key={d} value={d}>
                {d} DPI
              </option>
            ))}
          </select>
        )}
        <div className="hint">
          {px.width} × {px.height} px
        </div>
        <button className="primary" onClick={doExport} disabled={status === "Rendering…"}>
          Download PNG
        </button>
        {status && <div className="hint">{status}</div>}
      </section>
    </aside>
  );
}
