# Deploying map-paper

The site is a static build plus one serverless function, hosted on Cloudflare Pages. Telemetry is written to
Firestore by that function, never by the browser.

Everything below needs your accounts, so it has to be run by you. None of it takes long.

## 1. Cloudflare Pages

1. Sign in at [dash.cloudflare.com](https://dash.cloudflare.com) and go to **Workers & Pages → Create → Pages
   → Connect to Git**.
2. Pick `deepakvettickal/map-paper` and set:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Node version:** 20 (add an environment variable `NODE_VERSION = 20`)
3. Deploy. You get `map-paper.pages.dev`, and every push to `main` redeploys. Pull requests get their own
   preview URLs.

Functions in `functions/` are picked up automatically, so `/api/event` goes live with the site.

### A cleaner URL

`map-paper.pages.dev` works, but a domain reads better on a poster tool. Buy one (Cloudflare Registrar sells
at cost), then in the Pages project go to **Custom domains → Set up a domain**. If the domain is already on
Cloudflare DNS, the certificate is issued in a minute or two.

Names worth checking: `mappaper.art`, `mappaper.studio`, `map-paper.app`, `paper.maps` (unavailable),
`inkandatlas.com`. A `.art` or `.studio` suits the project and both are cheap.

## 2. Firebase for telemetry

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com) (analytics not
   needed).
2. **Build → Firestore Database → Create database**, in production mode, in a region near your users.
3. Publish the rules from [`firestore.rules`](firestore.rules). They deny every client read and write. The
   Pages Function authenticates as a service account, which bypasses rules, so the collection stays
   unreachable from any browser.
4. **Project settings → Service accounts → Generate new private key**. Keep the JSON file out of the repo.

## 3. Wire the two together

In the Pages project, under **Settings → Environment variables**, add three **encrypted** variables for both
Production and Preview:

| Variable | Value from the service account JSON |
|---|---|
| `FIREBASE_PROJECT_ID` | `project_id` |
| `FIREBASE_CLIENT_EMAIL` | `client_email` |
| `FIREBASE_PRIVATE_KEY` | `private_key`, newlines and all |

Set `TELEMETRY_DISABLED = true` on Preview if you would rather previews did not write.

Redeploy, open the site, and a `visit` document should appear in the `events` collection.

## What gets recorded

Anonymous counts only. No cookies, no fingerprinting, no third-party scripts, and the session id lives in
`sessionStorage`, so it disappears when the tab closes.

| Event | Recorded with it |
|---|---|
| `visit` | style, interface theme, referring site, viewport size, country (from Cloudflare) |
| `export` | style, place, output size and DPI, render time, file size, **and the full poster config** |
| `randomise` | style, city, how far the palette drifted |
| `preset_export`, `preset_import` | style |

The poster config saved with each download is the same JSON the app can import, which is what the planned
gallery will replay.

## Running the function locally

```bash
npm run build
npx wrangler pages dev dist --compatibility-date=2024-11-01
```

Without the Firebase variables the endpoint answers normally and simply logs that the write failed, so the
app behaves the same either way.
