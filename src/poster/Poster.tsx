import { useEffect, useLayoutEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { buildMapStyle, registerPatternProvider } from "../engine/buildMapStyle";
import { drawOverlay, loadFonts } from "./drawOverlay";
import { formatCoords, usePoster } from "../store";
import { SIZES } from "../config/sizes";

/** CSS size of the on-screen poster, read by the exporter to reproduce the framing. */
export const previewSize = { width: 0, height: 0 };

export function Poster() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapEl = useRef<HTMLDivElement>(null);
  const overlayEl = useRef<HTMLCanvasElement>(null);
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
      style: buildMapStyle(spec),
      center: view.center,
      zoom: view.zoom,
      bearing: view.bearing,
      attributionControl: false,
    });
    registerPatternProvider(map, () => usePoster.getState().spec);
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
    if (spec === initialSpec.current) return; // the map was created with this spec
    mapRef.current?.setStyle(buildMapStyle(spec));
  }, [spec]);

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
      });
    });
    return () => {
      cancelled = true;
    };
  }, [box, spec, title, subtitle, showCoords, showText, textScale, center]);

  return (
    <div ref={wrapRef} className="poster-wrap">
      <div className="poster" style={{ width: box.width, height: box.height }}>
        <div ref={mapEl} className="poster-map" />
        <canvas ref={overlayEl} className="poster-overlay" />
      </div>
    </div>
  );
}
