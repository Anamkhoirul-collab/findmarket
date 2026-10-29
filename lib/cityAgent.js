// City taste profile agent.
// 1. Qloo /v2/insights with a location signal: taste tags, brands, artists for people in the city.
// 2. Qloo places in the city, plus an optional trending pass (kept only if the API supports it).
// 3. Qloo demographics for the top taste tags.
// 4. Gemini turns the profile into product opportunity IDEAS, using only names Qloo returned.
// Taste data is not sales data, and the brief says so.

import { insights, heatmap, audienceParams, cleanTags } from "./qloo";
import { generateJSON } from "./llm";

const SYSTEM = `You help small businesses decide what to make for export.
You read taste data from Qloo, which describes what groups of people in a place tend to like.
It is not sales or trade data. Never claim demand, sales, prices or market size. Respond with JSON only.`;

async function step(trace, name, tool, fn) {
  const started = Date.now();
  try {
    const r = await fn();
    const detail = Array.isArray(r)
      ? `${r.length} results${r.length ? `: ${r.slice(0, 4).map((x) => x.name || x.id || "").join(", ")}` : ""}`
      : r && typeof r === "object" ? Object.keys(r).slice(0, 5).join(", ") : String(r ?? "");
    trace.push({ name, tool: r?.__provider || tool, ok: true, ms: Date.now() - started, detail });
    return r;
  } catch (err) {
    trace.push({ name, tool, ok: false, ms: Date.now() - started, detail: String(err.message || err).slice(0, 200) });
    return null;
  }
}

export async function runCityAgent({ city, language, audience = {}, home = { code: "ID", name: "Indonesia" } }) {
  const trace = [];
  const loc = { "signal.location.query": city, ...audienceParams(audience) };

  const [tags, brands, artists, places, trending] = await Promise.all([
    step(trace, `Taste words for people in ${city}`, "Qloo /v2/insights (tag)", () => insights({ filterType: "urn:tag", take: 30, extra: loc })),
    step(trace, `Brands people in ${city} like`, "Qloo /v2/insights (brand)", () => insights({ filterType: "urn:entity:brand", take: 10, extra: loc })),
    step(trace, `Music people in ${city} like`, "Qloo /v2/insights (artist)", () => insights({ filterType: "urn:entity:artist", take: 6, extra: loc })),
    step(trace, `Places in ${city}`, "Qloo /v2/insights (place)", () => insights({ filterType: "urn:entity:place", take: 8, extra: { "filter.location.query": city } })),
    step(trace, `Brands trending in ${city}`, "Qloo /v2/insights (brand, trends)", () => insights({ filterType: "urn:entity:brand", take: 8, extra: { ...loc, "bias.trends": "high" } })),
  ]);
  const [podcasts, tvShows, books] = await Promise.all([
    step(trace, `Podcasts people in ${city} like`, "Qloo /v2/insights (podcast)", () => insights({ filterType: "urn:entity:podcast", take: 5, extra: loc })),
    step(trace, `TV shows people in ${city} like`, "Qloo /v2/insights (tv_show)", () => insights({ filterType: "urn:entity:tv_show", take: 5, extra: loc })),
    step(trace, `Books people in ${city} like`, "Qloo /v2/insights (book)", () => insights({ filterType: "urn:entity:book", take: 5, extra: loc })),
  ]);

  const tagIdByName = Object.fromEntries((tags || []).map((t) => [t.name, t.id]));
  const tagList = cleanTags(tags).slice(0, 15).map((t) => ({ ...t, id: tagIdByName[t.name] }));
  if (!tagList.length && !(brands || []).length) {
    const err = new Error(`Qloo returned no taste data for “${city}”. Try a larger city or the English name.`);
    err.trace = trace;
    throw err;
  }

  let demographics = null;
  let heat = null;
  const topTagIds = tagList.slice(0, 3).map((t) => t.id).filter(Boolean);
  if (topTagIds.length) {
    [demographics, heat] = await Promise.all([
      step(trace, "Age and gender tendencies", "Qloo /v2/insights (demographics)", () =>
        insights({ filterType: "urn:demographics", tagIds: topTagIds, take: 10 })),
      step(trace, `Where this audience is in ${city}`, "Qloo /v2/insights (heatmap)", () =>
        heatmap({ location: city, tagIds: topTagIds, extra: audienceParams(audience) })),
    ]);
  }

  const data = {
    city,
    taste_tags: tagList.map(({ name, affinity }) => ({ name, affinity })),
    brands: (brands || []).map((b) => b.name),
    trending_brands: (trending || []).map((b) => b.name),
    artists: (artists || []).map((a) => a.name),
    places: (places || []).map((p) => p.name),
    podcasts: (podcasts || []).map((x) => x.name),
    tv_shows: (tvShows || []).map((x) => x.name),
    books: (books || []).map((x) => x.name),
  };

  const lang = language === "id" ? "Indonesian (Bahasa Indonesia)" : "English";
  const profile = await step(trace, "Turn the profile into product ideas", "AI", async () => {
    return generateJSON({
      system: SYSTEM,
      temperature: 0.5,
      prompt: `Qloo taste data for people in ${city}:
${JSON.stringify(data, null, 1)}

Write in ${lang}. Return JSON:
{
  "country": "country of this city in ${lang}",
  "summary": "2-3 sentences on the taste of this audience, phrased as group tendencies",
  "opportunities": [
    {"category": "food | fashion | craft | beauty", "title": "short product idea", "idea": "1-2 sentences on what a maker in ${home.name} could make", "why": "1 sentence linking it to the Qloo data", "signals": ["2-4 names copied from the Qloo data"]}
  ],
  "cautions": ["2 honest limits, including that this is taste data, not sales data, and demand should be checked in ITC Trade Map or Export Potential Map"]
}
Give exactly 2 opportunities per category (8 total). Every name in "signals" and "why" must appear in the Qloo data above.`,
    });
  });

  // Keep only signals that really came from Qloo
  const known = new Set([...data.taste_tags.map((t) => t.name), ...data.brands, ...data.trending_brands, ...data.artists, ...data.places].map((s) => (s || "").toLowerCase()));
  const opportunities = (profile?.opportunities || []).map((o) => ({
    category: ["food", "fashion", "craft", "beauty"].includes(o.category) ? o.category : "other",
    title: String(o.title || "").slice(0, 80),
    idea: String(o.idea || "").slice(0, 400),
    why: String(o.why || "").slice(0, 300),
    signals: (o.signals || []).filter((s) => known.has(String(s).toLowerCase())).slice(0, 4),
  })).filter((o) => o.title && o.idea);

  return {
    mocked: false,
    city,
    country: profile?.country || "",
    summary: profile?.summary || "",
    ...data,
    demographics: Array.isArray(demographics) ? demographics : demographics ? [demographics] : [],
    heatmap: heat || [],
    audience,
    opportunities,
    cautions: profile?.cautions || [],
    trace,
    fetchedAt: Date.now(),
  };
}
