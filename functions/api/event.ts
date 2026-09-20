/**
 * Telemetry sink: the only way anything reaches the database.
 *
 * Runs on Cloudflare Pages. The browser posts an anonymous event here; this
 * function validates it, throws away anything it did not ask for, and writes to
 * Firestore with a service account that only exists as a Worker secret. Firestore
 * rules deny all client access (see firestore.rules), so the database cannot be
 * read or written from a browser even if someone lifts the project id.
 */
import { SignJWT, importPKCS8 } from "jose";

interface Env {
  /** Service account email, e.g. telemetry@project.iam.gserviceaccount.com */
  FIREBASE_CLIENT_EMAIL: string;
  /** Service account private key (PEM, with real newlines). */
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_PROJECT_ID: string;
  /** Optional: skip writes while testing. */
  TELEMETRY_DISABLED?: string;
}

const EVENTS = ["visit", "export", "randomise", "preset_import", "preset_export"] as const;
type EventName = (typeof EVENTS)[number];

const MAX_BODY = 64 * 1024; // a poster preset is a few KB; anything larger is junk
const TOKEN_TTL = 3000; // seconds; Google caps access tokens at an hour

let cachedToken: { token: string; expires: number } | null = null;

/** Mints (and briefly caches) a Google access token from the service account. */
async function accessToken(env: Env): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expires > now + 60) return cachedToken.token;

  const key = await importPKCS8(env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), "RS256");
  const assertion = await new SignJWT({ scope: "https://www.googleapis.com/auth/datastore" })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(env.FIREBASE_CLIENT_EMAIL)
    .setSubject(env.FIREBASE_CLIENT_EMAIL)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + TOKEN_TTL)
    .sign(key);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) throw new Error(`token exchange failed: ${res.status}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: json.access_token, expires: now + json.expires_in };
  return json.access_token;
}

/** Firestore REST wants typed values; this maps plain JSON onto them. */
function toFirestore(value: unknown): unknown {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestore) } };
  if (typeof value === "object") {
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) fields[k] = toFirestore(v);
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

/** Keeps the payload to the fields we expect, at sane sizes. */
function clean(body: Record<string, unknown>): Record<string, unknown> | null {
  const name = body.name;
  if (typeof name !== "string" || !EVENTS.includes(name as EventName)) return null;
  const str = (v: unknown, max = 200) => (typeof v === "string" ? v.slice(0, max) : undefined);

  const out: Record<string, unknown> = {
    name,
    session: str(body.session, 64) ?? "unknown",
    at: str(body.at, 40) ?? new Date().toISOString(),
    style: str(body.style, 64),
    styleName: str(body.styleName, 64),
    theme: str(body.theme, 16),
    referrer: str(body.referrer, 120),
    place: body.place,
    output: body.output,
    render: body.render,
    viewport: body.viewport,
    drift: typeof body.drift === "number" ? body.drift : undefined,
  };
  // The full poster config, kept only for downloads: this is what the gallery will replay.
  if (name === "export" && body.preset && typeof body.preset === "object") out.preset = body.preset;
  for (const k of Object.keys(out)) if (out[k] === undefined) delete out[k];
  return out;
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const ok = new Response(null, { status: 204 });
  try {
    const raw = await ctx.request.text();
    if (raw.length > MAX_BODY) return new Response("payload too large", { status: 413 });

    const parsed = clean(JSON.parse(raw) as Record<string, unknown>);
    if (!parsed) return new Response("bad event", { status: 400 });
    if (ctx.env.TELEMETRY_DISABLED === "true") return ok;

    // Country and user agent come from the edge, not from the client.
    const cf = ctx.request.cf as { country?: string } | undefined;
    const doc = {
      ...parsed,
      country: cf?.country ?? "unknown",
      ua: (ctx.request.headers.get("user-agent") ?? "").slice(0, 180),
      receivedAt: new Date().toISOString(),
    };

    const token = await accessToken(ctx.env);
    const url = `https://firestore.googleapis.com/v1/projects/${ctx.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/events`;
    const res = await fetch(url, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ fields: (toFirestore(doc) as { mapValue: { fields: unknown } }).mapValue.fields }),
    });
    if (!res.ok) console.error("firestore write failed", res.status, await res.text());
  } catch (e) {
    // Never surface internals, and never fail the page because analytics broke.
    console.error("event error", (e as Error).message);
  }
  return ok;
};

/** Anything other than POST gets nothing. */
export const onRequest: PagesFunction<Env> = async (ctx) =>
  ctx.request.method === "POST" ? onRequestPost(ctx) : new Response("method not allowed", { status: 405 });
