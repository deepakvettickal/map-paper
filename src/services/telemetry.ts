/**
 * Anonymous usage counts, posted to this site's own `/api/event` endpoint.
 *
 * The browser never touches the database: the endpoint is a Cloudflare Pages
 * Function that holds the service credentials and writes to Firestore itself.
 * Nothing here identifies a person. There is no cookie, no fingerprint and no
 * third-party script; the session id lives in sessionStorage and dies with the tab.
 */
import type { Preset } from "../config/preset";

const ENDPOINT = "/api/event";

export type EventName = "visit" | "export" | "randomise" | "preset_import" | "preset_export";

function sessionId(): string {
  try {
    const key = "mp-session";
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return "no-storage";
  }
}

/** Referrer host only: enough to see where people arrive from, nothing more. */
function referrerHost(): string | undefined {
  try {
    if (!document.referrer) return undefined;
    const h = new URL(document.referrer).host;
    return h === location.host ? undefined : h;
  } catch {
    return undefined;
  }
}

async function send(name: EventName, data: Record<string, unknown>) {
  // Telemetry must never break the app or block the UI.
  if (import.meta.env.DEV) return;
  const body = JSON.stringify({
    name,
    session: sessionId(),
    at: new Date().toISOString(),
    viewport: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio },
    ...data,
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
      return;
    }
    await fetch(ENDPOINT, { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true });
  } catch {
    /* ignore: analytics is never worth an error in the UI */
  }
}

export const telemetry = {
  visit: (style: string, theme: string) => send("visit", { style, theme, referrer: referrerHost() }),

  /** A finished download, with the whole poster config so it can be replayed in the gallery. */
  export: (preset: Preset, extra: { ms: number; bytes: number; width: number; height: number }) =>
    send("export", {
      style: preset.spec.id,
      styleName: preset.spec.name,
      place: {
        title: preset.text.title,
        subtitle: preset.text.subtitle,
        center: preset.view.center,
        zoom: preset.view.zoom,
      },
      output: { ...preset.output, width: extra.width, height: extra.height },
      render: { ms: extra.ms, bytes: extra.bytes },
      preset,
    }),

  randomise: (style: string, place: string, drift: number) => send("randomise", { style, place, drift }),
  presetExport: (style: string) => send("preset_export", { style }),
  presetImport: (style: string) => send("preset_import", { style }),
};
