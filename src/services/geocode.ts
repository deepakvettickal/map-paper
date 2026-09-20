export interface Place {
  name: string;
  displayName: string;
  center: [number, number];
}

const cache = new Map<string, Place[]>();

/** Free-text place search via OpenStreetMap Nominatim (keep usage light: at most ~1 req/s). */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const hit = cache.get(q);
  if (hit) return hit;
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { signal, headers: { "Accept-Language": "en" } });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const rows: { name: string; display_name: string; lat: string; lon: string }[] = await res.json();
  const places = rows.map((r) => ({
    name: r.name || r.display_name.split(",")[0],
    displayName: r.display_name,
    center: [Number(r.lon), Number(r.lat)] as [number, number],
  }));
  cache.set(q, places);
  return places;
}

/** Name the point under some coordinates (used by "Use my location"). */
export async function reverseGeocode(
  lng: number,
  lat: number,
  signal?: AbortSignal,
): Promise<Place | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { signal, headers: { "Accept-Language": "en" } });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const r: {
    name?: string;
    display_name?: string;
    lat: string;
    lon: string;
    address?: Record<string, string>;
  } = await res.json();
  if (!r.display_name) return null;
  const a = r.address ?? {};
  const name =
    r.name || a.suburb || a.city || a.town || a.village || r.display_name.split(",")[0];
  return { name, displayName: r.display_name, center: [Number(r.lon), Number(r.lat)] };
}
