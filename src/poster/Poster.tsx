import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { buildMapStyle, registerPatternProvider } from "../engine/buildMapStyle";
import { drawOverlay, loadFonts } from "./drawOverlay";
import { activeBorder, activeEffects, formatCoords, usePoster } from "../store";
import { EffectsRenderer } from "../engine/effects";
import { SIZES } from "../config/sizes";

/** CSS size of the on-screen poster, read by the exporter to reproduce the framing. */
export const previewSize = { width: 0, height: 0 };

export function Poster() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapEl = useRef<HTMLDivElement>(null);
  const overlayEl = useRef<HTMLCanvasElement>(null);
  const fxEl = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<EffectsRenderer | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  const spec = usePoster((s) => s.spec);
  const sizeId = usePoster((s) => s.sizeId);
  const jumpToken = usePoster((s) => s.jumpToken);
  const title = usePoster((s) => s.title);
  const subtitle = usePoster((s) => s.subtitle);
  const showCoords = usePoster((s) => s.showCoords);
  const showText = usePoster((s) => s.showText);
  const textScale = usePoster((s) => s.textScale);
  const center = usePoster((s) => s.view.center);
  const showLabels = usePoster((s) => s.showLabels);
  const border = usePoster((s) => s.border);
  const borderScale = usePoster((s) => s.borderScale);
  const fxOn = usePoster((s) => s.fxOn);
  const fxAmount = usePoster((s) => s.fxAmount);
  const fx = useMemo(() => activeEffects({ spec, fxOn, fxAmount }), [spec, fxOn, fxAmount]);
  const fxKey = JSON.stringify(fx);

  // Fit the poster's aspect ratio into the available area.
  const size = SIZES.find((s) => s.id === sizeId)!;
  useLayoutEffect(() => {
    const el = wrapRef.current!;
    const fit = () => {
      const pad = 32;
      const aw = el.clientWidth - pad * 2;
      const ah = el.clientHeight - pad * 2;
      const ratio = size.width / size.height;
      const width = Math.floor(Math.min(aw, ah * ratio));
      setBox({ width, height: Math.floor(width / ratio) });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);

  // Create the map once.
  useEffect(() => {
    const { view, spec } = usePoster.getState();
    const map = new maplibregl.Map({
      container: mapEl.current!,
      style: buildMapStyle(spec, { labels: usePoster.getState().showLabels }),
      center: view.center,
      zoom: view.zoom,
      bearing: view.bearing,
      attributionControl: false,
      // The art renderer reads the map canvas as a texture after each frame.
      canvasContextAttributes: { preserveDrawingBuffer: true },
    });
    registerPatternProvider(map);
    map.on("render", () => scheduleFx.current());
    map.on("error", (e) => console.error("map error:", e.error?.message ?? e));
    map.on("moveend", () => {
      const c = map.getCenter();
      usePoster.getState().setView({
        center: [c.lng, c.lat],
        zoom: map.getZoom(),
        bearing: map.getBearing(),
      });
    });
    mapRef.current = map;
    if (import.meta.env.DEV) (window as unknown as { __map: unknown }).__map = map;
    return () => map.remove();
  }, []);

  // Live style updates (MapLibre diffs the style, so this is cheap).
  const initialSpec = useRef(spec);
  useEffect(() => {
    // Skip the first run: the map was created with this spec and label setting.
    if (spec === initialSpec.current && !showLabels) return;
    mapRef.current?.setStyle(buildMapStyle(spec, { labels: showLabels }));
  }, [spec, showLabels]);

  // Jump after a search.
  useEffect(() => {
    if (!jumpToken) return;
    const { view } = usePoster.getState();
    mapRef.current?.jumpTo({ center: view.center, zoom: view.zoom });
  }, [jumpToken]);

  useEffect(() => {
    previewSize.width = box.width;
    previewSize.height = box.height;
    mapRef.current?.resize();
  }, [box]);

  // Redraw frame + text overlay.
  useEffect(() => {
    const canvas = overlayEl.current;
    if (!canvas || !box.width) return;
    let cancelled = false;
    loadFonts(spec).then(() => {
      if (cancelled) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = box.width * dpr;
      canvas.height = box.height * dpr;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawOverlay(ctx, canvas.width, canvas.height, spec, {
        title,
        subtitle,
        coords: showCoords ? formatCoords(center) : null,
        show: showText,
        scale: textScale,
        border: activeBorder({ spec, border }),
        borderScale,
      });
      scheduleFx.current();
    });
    return () => {
      cancelled = true;
    };
  }, [box, spec, title, subtitle, showCoords, showText, textScale, border, borderScale, center]);

  // Art renderer: composite map + overlay through the effects shader, at most once per frame.
  const scheduleFx = useRef<() => void>(() => {});
  useEffect(() => {
    let frame = 0;
    scheduleFx.current = () => {
      if (!fx || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const map = mapRef.current;
        const overlay = overlayEl.current;
        if (!map || !overlay || !fxEl.current || !overlay.width) return;
        fxRef.current ??= new EffectsRenderer(fxEl.current);
        const c = map.getCanvas();
        fxRef.current.render(c, overlay, c.width, c.height, fx);
      });
    };
    scheduleFx.current();
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fxKey]);

  return (
    <div ref={wrapRef} className="poster-wrap">
      <div
        className={`poster${fx ? " fx-on" : ""}`}
        style={{ width: box.width, height: box.height }}
      >
        <div ref={mapEl} className="poster-map" />
        <canvas ref={overlayEl} className="poster-overlay" />
        <canvas ref={fxEl} className="poster-fx" />
      </div>
    </div>
  );
}
