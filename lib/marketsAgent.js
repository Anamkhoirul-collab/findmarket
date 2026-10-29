// Light overview for the Markets page: only Qloo calls, no AI, so many cities load fast.
// Per city: top taste words and trending brands (the trending pass is optional).
import { insights, cleanTags } from "./qloo";

async function safe(fn) {
  try { return await fn(); } catch { return null; }
}

async function overviewFor(city) {
  const loc = { "signal.location.query": city };
  const [tags, trending] = await Promise.all([
    safe(() => insights({ filterType: "urn:tag", take: 20, extra: loc })),
    safe(() => insights({ filterType: "urn:entity:brand", take: 5, extra: { ...loc, "bias.trends": "high" } })),
  ]);
  const taste = cleanTags(tags).slice(0, 6);
  return { city, ok: taste.length > 0, taste_tags: taste, trending_brands: (trending || []).map((b) => b.name).filter(Boolean) };
}

// Small concurrency limit to stay polite with the API.
export async function runMarketsOverview(cities, limit = 3) {
  const out = new Array(cities.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, cities.length) }, async () => {
    while (i < cities.length) {
      const idx = i++;
      out[idx] = await overviewFor(cities[idx]);
    }
  });
  await Promise.all(workers);
  return out;
}
