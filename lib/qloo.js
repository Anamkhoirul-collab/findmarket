// Server-only Qloo client. The API key is read from the environment and is
// sent only in the X-Api-Key header. It never reaches the browser.

const BASE = (process.env.QLOO_BASE_URL || "https://hackathon.api.qloo.com").replace(/\/$/, "");

async function qlooGet(path, params) {
  const key = process.env.QLOO_API_KEY;
  if (!key) throw new Error("QLOO_API_KEY is not set");
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params || {})) {
    if (v === undefined || v === null || v === "") continue;
    qs.set(k, Array.isArray(v) ? v.join(",") : String(v));
  }
  const url = `${BASE}${path}?${qs.toString()}`;
  // Retry briefly when Qloo is rate limiting (429) or busy (5xx), which happens when many calls run at once.
  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(url, {
        headers: { "X-Api-Key": key, Accept: "application/json" },
        signal: controller.signal,
        cache: "no-store",
      });
      const text = await res.text();
      if (res.ok) return JSON.parse(text);
      const retryable = res.status === 429 || res.status >= 500;
      if (retryable && attempt < 3) {
        const after = Number(res.headers.get("retry-after"));
        await new Promise((r) => setTimeout(r, after > 0 && after <= 5 ? after * 1000 : 500 * 2 ** attempt + Math.random() * 300));
        continue;
      }
      throw new Error(`Qloo ${path} returned ${res.status}: ${text.slice(0, 300)}`);
    } finally {
      clearTimeout(timer);
    }
  }
}

// Finds the first array in a response that looks like a list of results.
function pickArray(json, keys) {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  const r = json.results ?? json;
  if (Array.isArray(r)) return r;
  for (const k of keys) {
    if (Array.isArray(r?.[k])) return r[k];
  }
  return [];
}

function normEntity(e) {
  const p = e.properties || {};
  return {
    id: e.entity_id || e.id,
    name: e.name,
    type: e.subtype || e.type || (Array.isArray(e.types) ? e.types[0] : undefined),
    affinity: typeof e.query?.affinity === "number" ? e.query.affinity : undefined,
    popularity: typeof e.popularity === "number" ? e.popularity : undefined,
    country: p.geocode?.country_code || p.geocode?.country || undefined,
    lat: typeof (e.location?.lat ?? p.geocode?.latitude) === "number" ? (e.location?.lat ?? p.geocode?.latitude) : undefined,
    lon: typeof (e.location?.lon ?? p.geocode?.longitude) === "number" ? (e.location?.lon ?? p.geocode?.longitude) : undefined,
    description: (p.short_description || p.description || "").slice(0, 200) || undefined,
  };
}

function normTag(t) {
  return {
    id: t.id || t.tag_id || t.entity_id,
    name: t.name,
    type: t.subtype || t.type || t.tag_type,
    affinity: typeof t.query?.affinity === "number" ? t.query.affinity : undefined,
  };
}

/** GET /v2/tags: turn a word like "jazz" into Qloo tag IDs (often several types). */
export async function searchTags(query, take = 6) {
  const json = await qlooGet("/v2/tags", { "filter.query": query, take });
  return pickArray(json, ["tags", "entities"]).map(normTag).filter((t) => t.id);
}

/** GET /search: turn a name like "Blue Bottle Coffee" into Qloo entity IDs. */
export async function searchEntities(query, type, take = 3) {
  const json = await qlooGet("/search", { query, types: type, take });
  return pickArray(json, ["entities"]).map(normEntity).filter((e) => e.id);
}

/** GET /v2/insights: taste-based results of one type from tag/entity signals. */
export async function insights({ filterType, tagIds = [], entityIds = [], take = 8, extra = {} }) {
  const json = await qlooGet("/v2/insights", {
    "filter.type": filterType,
    "signal.interests.tags": tagIds.length ? tagIds : undefined,
    "signal.interests.entities": entityIds.length ? entityIds : undefined,
    take,
    ...extra,
  });
  if (filterType === "urn:tag") {
    return pickArray(json, ["tags", "entities"]).map(normTag);
  }
  if (filterType === "urn:demographics") {
    const d = json?.results?.demographics ?? json?.results ?? json;
    return Array.isArray(d) ? d.slice(0, 10) : d;
  }
  return pickArray(json, ["entities"]).map(normEntity);
}

/** GET /v2/insights with filter.type=urn:heatmap: where in a place an audience concentrates. */
export async function heatmap({ location, tagIds = [], entityIds = [], extra = {} }) {
  const json = await qlooGet("/v2/insights", {
    "filter.type": "urn:heatmap",
    "filter.location.query": location,
    "signal.interests.tags": tagIds.length ? tagIds : undefined,
    "signal.interests.entities": entityIds.length ? entityIds : undefined,
    ...extra,
  });
  const arr = pickArray(json, ["heatmap", "entities", "locations"]);
  return arr.map((h) => {
    const loc = h.location || h.geo || h;
    const lat = loc.latitude ?? loc.lat;
    const lon = loc.longitude ?? loc.lon ?? loc.lng;
    const q = h.query || h;
    const value = q.affinity ?? q.affinity_rank ?? q.popularity ?? h.value;
    return typeof lat === "number" && typeof lon === "number" && typeof value === "number" ? { lat, lon, value } : null;
  }).filter(Boolean).slice(0, 400);
}

/** Places in a location for an audience, with address and tags when Qloo returns them. */
export async function placesFor({ location, tagIds = [], entityIds = [], take = 10, extra = {} }) {
  const json = await qlooGet("/v2/insights", {
    "filter.type": "urn:entity:place",
    "filter.location.query": location,
    "signal.interests.tags": tagIds.length ? tagIds : undefined,
    "signal.interests.entities": entityIds.length ? entityIds : undefined,
    take,
    ...extra,
  });
  const seen = new Set();
  return pickArray(json, ["entities"]).filter((e) => {
    const k = (e.name || "").toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  }).map((e) => {
    const p = e.properties || {};
    return {
      name: e.name,
      address: p.address || p.formatted_address || "",
      affinity: typeof e.query?.affinity === "number" ? e.query.affinity : undefined,
      tags: (e.tags || []).map((t) => t.name).filter(Boolean).slice(0, 3),
      lat: e.location?.lat ?? p.geocode?.latitude,
      lon: e.location?.lon ?? p.geocode?.longitude,
    };
  }).filter((x) => x.name);
}

// Optional audience narrowing, e.g. { age: "25_to_29", gender: "female" }.
export function audienceParams(a = {}) {
  const out = {};
  if (a.age) out["signal.demographics.age"] = a.age;
  if (a.gender) out["signal.demographics.gender"] = a.gender;
  return out;
}

export const TYPE_URN = {
  brand: "urn:entity:brand",
  place: "urn:entity:place",
  artist: "urn:entity:artist",
  movie: "urn:entity:movie",
  book: "urn:entity:book",
  destination: "urn:entity:destination",
  tv_show: "urn:entity:tv_show",
  podcast: "urn:entity:podcast",
};

// Tags that describe almost every city and say nothing about taste.
const GENERIC = new Set(["tourist attraction", "place", "places", "shopping", "point of interest", "establishment", "attraction", "landmark", "locality", "store", "premise", "neighborhood", "neighbourhood", "geocode", "political", "city", "town"]);
// Venue categories (Qloo place types) are real signals but say little about taste, so they go last.
const CATEGORY = /^(restaurant|cafe|café|coffee shop|bar|hotel|museum|event venue|takeout restaurant|fast food restaurant|personal care|park|shopping mall|supermarket|grocery store|night club|gym|bakery|pub|lodging|food|store|clothing store|beauty salon|spa|tourist information center)$/i;
export function cleanTags(tags) {
  const base = (tags || []).filter((t) => t.name && !GENERIC.has(t.name.trim().toLowerCase()));
  const isVenue = (t) => CATEGORY.test(t.name.trim()) || /^urn:tag:(genre|category):place/.test(t.id || "");
  const list = [...base.filter((t) => !isVenue(t)), ...base.filter((t) => isVenue(t))];
  const vals = list.map((t) => t.affinity).filter((v) => typeof v === "number");
  const flat = vals.length < 2 || Math.max(...vals) - Math.min(...vals) < 0.02;
  // When scores are flat, Qloo's order is the only signal: turn rank into a gentle 100 -> 55 scale.
  return list.map((t, i) => ({ name: t.name, affinity: flat ? Math.max(0.55, 1 - i * 0.06) : t.affinity }));
}
