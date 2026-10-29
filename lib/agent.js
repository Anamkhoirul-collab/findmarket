// The FindMarket agent.
// 1. Plan: Gemini turns a product description into taste concepts and reference brands.
// 2. Resolve: Qloo /v2/tags and /search turn those words into real Qloo IDs.
// 3. Decide: Gemini picks which tag types actually match the product ("jazz" problem).
// 4. Explore: Qloo /v2/insights finds destinations, brands, artists, taste tags,
//    demographics and local places for the same audience.
// 5. Write: Gemini writes a market brief that may only use names found in step 4.
// 6. Verify: code checks every recommended market against Qloo's results.

import { searchTags, searchEntities, insights, placesFor, TYPE_URN } from "./qloo";
import { generateJSON, hasLLM } from "./llm";
import * as mock from "./mock";
import { normalizeDemographics } from "../app/ui/demographics";
import { tradeFor, countryFacts } from "./trade";

const SYSTEM = `You are FindMarket, an export-market research agent for small businesses that want to sell abroad.
You work with data from Qloo, a taste graph that describes what groups of people tend to like.
Always describe group tendencies, never claims about a single person.
Never invent statistics. Respond with JSON only.`;

function useMock() {
  return (
    process.env.MOCK_MODE === "true" ||
    !process.env.QLOO_API_KEY ||
    !hasLLM()
  );
}

async function step(trace, name, tool, fn) {
  const started = Date.now();
  try {
    const result = await fn();
    trace.push({ name, tool: result?.__provider || tool, ok: true, ms: Date.now() - started, detail: summarize(result) });
    return result;
  } catch (err) {
    trace.push({ name, tool, ok: false, ms: Date.now() - started, detail: String(err.message || err).slice(0, 240) });
    return null;
  }
}

function summarize(r) {
  if (Array.isArray(r)) return `${r.length} results${r.length ? `: ${r.slice(0, 4).map((x) => x.name || x.id).join(", ")}` : ""}`;
  if (r && typeof r === "object") return Object.keys(r).slice(0, 6).join(", ");
  return String(r ?? "");
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Errors carry the trace so you can see which step failed and why.
function fail(message, trace) {
  const last = [...trace].reverse().find((s) => !s.ok);
  const err = new Error(last ? `${message} (${last.tool}: ${last.detail})` : message);
  err.trace = trace;
  return err;
}

export async function runAgent({ description, language, home = { code: "ID", name: "Indonesia" }, onStep = null }) {
  const trace = [];
  // Report each finished step as it happens, so the UI can show the agent working live.
  if (onStep) trace.push = (...items) => { items.forEach((x) => { Array.prototype.push.call(trace, x); try { onStep(x); } catch { /* ignore */ } }); return trace.length; };
  const mocked = useMock();

  // 1. Plan
  const plan = await step(trace, "Understand the product", "AI", async () => {
    if (mocked) { await delay(300); return mock.mockPlan; }
    return generateJSON({
      fast: true,
      system: SYSTEM,
      prompt: `Product description from a small business in ${home.name} (may be in any language):
"""${description}"""

Return JSON:
{
  "product_summary": "one sentence in English",
  "hs_code": "the 4-digit Harmonized System heading that best fits this product, e.g. 0901 for coffee, 6214 for scarves, 9405 for lamps",
  "hs_label": "short English name of that HS heading",
  "tag_queries": ["3 to 5 short English keywords for the style, taste, values or category of this product, e.g. 'specialty coffee', 'handcrafted', 'sustainable', 'batik'"],
  "reference_entities": [{"name": "a well-known global brand, place or destination whose fans would likely love this product", "type": "brand | place | destination | artist"}]
}
Give 2 to 4 reference_entities. Prefer brands that are internationally known.`,
    });
  });
  if (!plan) throw fail("The agent could not read the product description.", trace);

  // 2. Resolve words into Qloo IDs, in parallel
  const tagQueries = (plan.tag_queries || []).slice(0, 5);
  const refs = (plan.reference_entities || []).slice(0, 4);

  const tagResults = await Promise.all(
    tagQueries.map((q) =>
      step(trace, `Find Qloo tags for "${q}"`, "Qloo /v2/tags", async () =>
        mocked ? mock.mockTagCandidates[q] || [] : searchTags(q)
      ).then((r) => ({ query: q, candidates: r || [] }))
    )
  );
  const entityResults = await Promise.all(
    refs.map((ref) =>
      step(trace, `Find "${ref.name}" in Qloo`, "Qloo /search", async () => {
        if (mocked) return mock.mockEntityCandidates.filter((e) => e.name === ref.name);
        return searchEntities(ref.name, TYPE_URN[ref.type] || TYPE_URN.brand);
      }).then((r) => r || [])
    )
  );

  const allTags = tagResults.flatMap((t) => t.candidates);
  const allEntities = entityResults.flat();
  if (!allTags.length && !allEntities.length) {
    throw fail("Qloo did not recognise any concept from this description. Try simpler words, like the product type and its style.", trace);
  }

  // 3. Decide which candidates really match (the "five kinds of jazz" decision)
  const choice = await step(trace, "Choose the right tag types", "AI", async () => {
    if (mocked) { await delay(300); return mock.mockChoice; }
    return generateJSON({
      fast: true,
      system: SYSTEM,
      prompt: `Product: ${plan.product_summary}

Qloo returned these tag candidates. Several may share a name but have different types (for example a music genre versus a place genre). Pick the ones that describe the taste of people who would BUY this product.
${JSON.stringify(tagResults.map((t) => ({ query: t.query, candidates: t.candidates.map(({ id, name, type }) => ({ id, name, type })) })), null, 1)}

Entity candidates:
${JSON.stringify(allEntities.map(({ id, name, type }) => ({ id, name, type })), null, 1)}

Return JSON: {"tags":[{"id":"exact id from the list","reason":"one short sentence"}],"entities":[{"id":"exact id from the list","reason":"one short sentence"}]}
Choose up to 5 tags and up to 3 entities. Use only ids from the lists.`,
    });
  });

  // Guard: keep only IDs that really came from Qloo
  const tagIdSet = new Set(allTags.map((t) => t.id));
  const entIdSet = new Set(allEntities.map((e) => e.id));
  let chosenTags = (choice?.tags || []).filter((t) => tagIdSet.has(t.id));
  let chosenEntities = (choice?.entities || []).filter((e) => entIdSet.has(e.id));
  if (!chosenTags.length && !chosenEntities.length) {
    chosenTags = tagResults.filter((t) => t.candidates[0]).map((t) => ({ id: t.candidates[0].id, reason: "Fallback: first Qloo match." })).slice(0, 4);
    chosenEntities = allEntities.slice(0, 2).map((e) => ({ id: e.id, reason: "Fallback: first Qloo match." }));
  }
  const tagIds = chosenTags.map((t) => t.id);
  const entityIds = chosenEntities.map((e) => e.id);
  const signals = { tagIds, entityIds };

  // 4. Explore the audience with Qloo insights, in parallel
  const run = (name, filterType, take, key, extra) =>
    step(trace, name, `Qloo /v2/insights (${filterType})`, async () =>
      mocked ? mock.mockInsights[key] : insights({ filterType, take, extra, ...signals })
    );

  const [destinations, brands, artists, tasteTags, demographics] = await Promise.all([
    run("Rank destinations by audience affinity", "urn:entity:destination", 30, "destinations"),
    run("Brands this audience likes", "urn:entity:brand", 8, "brands"),
    run("Music this audience likes", "urn:entity:artist", 6, "artists"),
    run("Words that describe this taste", "urn:tag", 12, "tags"),
    run("Age and gender tendencies", "urn:demographics", 10, "demographics"),
  ]);

  const foreign = (destinations || []).filter((d) => (d.country || "").toUpperCase() !== home.code);
  const topCity = foreign[0]?.name;
  let places = null;
  if (topCity) {
    places = await run(`Places in ${topCity} with the same audience`, "urn:entity:place", 6, "places", {
      "filter.location.query": topCity,
    });
  }

  const qlooData = {
    destinations: (destinations || []).map(({ name, country, affinity, lat, lon }) => ({ name, country, affinity, lat, lon })),
    brands: (brands || []).map((b) => b.name),
    artists: (artists || []).map((a) => a.name),
    taste_tags: (tasteTags || []).map((t) => t.name),
    demographics,
    places_in_top_city: (places || []).map((p) => p.name),
    top_city: topCity,
  };

  if (!qlooData.destinations.length && !qlooData.brands.length) {
    throw fail("Qloo returned no audience insights for these signals. Try a broader description.", trace);
  }

  // 5. Write the brief
  const lang = language === "id" ? "Indonesian (Bahasa Indonesia)" : "English";
  const report = await step(trace, "Write the market brief", "AI", async () => {
    if (mocked) { await delay(300); return mock.mockReport(language); }
    return generateJSON({
      system: SYSTEM,
      temperature: 0.5,
      prompt: `Product: ${plan.product_summary}
Original description: """${description}"""

Qloo data for people whose taste matches this product:
${JSON.stringify(qlooData, null, 1)}

Write an export market brief in ${lang} for the small business owner. Plain, friendly language.
Rules:
- The exporter is based in ${home.name}. Recommend markets ONLY from qloo destinations, and skip destinations in ${home.name} (country "${home.code}").
- This is an export brief for a small business. Prefer major cities with shops, distributors and importers. Only pick a resort, island or small holiday town if the product clearly suits hotels and resorts, and then say so in "why".
- Every brand, artist, place or taste word you mention must appear in the Qloo data above.
- Do not invent numbers, prices, or market sizes. lat and lon are the approximate city coordinates, for drawing a map.
- Describe groups ("this audience tends to..."), not individuals.

Return JSON:
{
  "headline": "one sentence",
  "markets": [{"name":"exact destination name","country":"country name","lat": 0.0,"lon": 0.0,"why":"two sentences grounded in the Qloo data","signals":["2-4 Qloo names that support this"]}],
  "audience": {"portrait":"3 to 4 sentences","also_loves":["4-6 Qloo names"]},
  "story": {"positioning":"2 sentences","name_and_packaging":["2-3 ideas"],"pitch_line":"one line for a label or pitch"},
  "channels": ["3-5 concrete channel ideas tied to the Qloo data"],
  "cautions": ["2-3 honest limits, including that Qloo shows group tendencies and that tariffs and import rules must be checked separately"],
  "next_steps": ["3-4 steps; you may mention ITC Export Potential Map, ITC Market Access Map and Kemendag InaExport business matching"]
}
Give 6 to 10 markets, best first. Spread them across countries: at most 2 markets in the same country.
Keep each name exactly as it appears in the qloo destinations. When both a whole city and one of its neighbourhoods are listed (for example "New York" and "SoHo"), prefer the whole city.`,
    });
  });
  if (!report) throw fail("The agent gathered Qloo data but could not write the brief. Please try again.", trace);

  // 6. Audience fit from two Qloo signals, both driven by the product's own taste signals:
  //    60% destination affinity (does this city's audience share the taste?)
  //    40% local venue match (does the city have shops and places that fit the product?)
  const pct = (a) => (typeof a === "number" ? (a <= 1 ? a * 100 : Math.min(a, 100)) : null);
  const destByName = Object.fromEntries(qlooData.destinations.map((d) => [(d.name || "").toLowerCase(), d]));
  const fit = {};
  await Promise.all((report.markets || []).slice(0, 10).map(async (m) => {
    const dest = pct(destByName[(m.name || "").toLowerCase()]?.affinity);
    let venue = null, venueCount = 0;
    if (!mocked) {
      const places = await step(trace, `Check local venues in ${m.name}`, "Qloo /v2/insights (place)", () =>
        placesFor({ location: m.name, tagIds, entityIds, take: 10 }));
      const scores = (places || []).map((p) => pct(p.affinity)).filter((v) => v !== null).sort((a, b) => b - a);
      venueCount = scores.filter((v) => v >= 60).length;
      if (scores.length) venue = scores.slice(0, 5).reduce((a, b) => a + b, 0) / Math.min(scores.length, 5);
    }
    const parts = [[dest, 0.6], [venue, 0.4]].filter(([v]) => v !== null);
    const weight = parts.reduce((a, [, w]) => a + w, 0);
    const score = weight ? parts.reduce((a, [v, w]) => a + v * w, 0) / weight : null;
    fit[m.name] = {
      score: score !== null ? Math.round(score) : null,
      destination: dest !== null ? Math.round(dest) : null,
      venues: venue !== null ? Math.round(venue) : null,
      venueCount,
    };
  }));
  qlooData.fit = fit;
  qlooData.audience = normalizeDemographics(demographics);

  // 7. Official data per country: UN Comtrade imports (with a key) and World Bank facts (no key)
  const hs = /^\d{4}(\d{2})?$/.test(String(plan.hs_code || "")) ? String(plan.hs_code) : null;
  qlooData.hs = hs ? { code: hs, label: plan.hs_label || "" } : null;
  const countries = [...new Set((report.markets || []).map((m) => m.country).filter(Boolean))].slice(0, 8);
  const trade = {}, facts = {};
  // Comtrade's free tier allows 500 calls a day; import data for the top 5 countries keeps a brief to ~20 calls.
  const tradeCountries = countries.slice(0, 5);
  if (!mocked) {
    await Promise.all(countries.map(async (country) => {
      const [tr, fa] = await Promise.all([
        hs && process.env.COMTRADE_API_KEY && tradeCountries.includes(country)
          ? step(trace, `Imports of HS ${hs} into ${country}`, "UN Comtrade", async () => {
              const r = await tradeFor(country, hs, home.name);
              if (!r) throw new Error("No Comtrade data for this country");
              return r;
            })
          : Promise.resolve(null),
        step(trace, `Population and income in ${country}`, "World Bank", async () => {
          const r = await countryFacts(country);
          if (!r) throw new Error("Country not found in World Bank data");
          return r;
        }),
      ]);
      if (tr) trade[country] = tr;
      if (fa) facts[country] = fa;
    }));
    if (hs && !process.env.COMTRADE_API_KEY) {
      trace.push({ name: "Official import data", tool: "UN Comtrade", ok: false, ms: 0, detail: "Skipped: add COMTRADE_API_KEY to include import data" });
    }
  }
  qlooData.trade = trade;
  qlooData.facts = facts;
  qlooData.retrievedAt = Date.now();
  // Best fit first
  report.markets = [...(report.markets || [])].sort((a, b) => (fit[b.name]?.score ?? -1) - (fit[a.name]?.score ?? -1));

  // 8. Verify each market against Qloo's destination list
  const destNames = new Set(qlooData.destinations.map((d) => (d.name || "").toLowerCase()));
  report.markets = (report.markets || []).map((m) => ({
    ...m,
    verified: destNames.has((m.name || "").toLowerCase()),
  }));
  // 9. Show every Qloo match: add the remaining foreign destinations after the agent's picks.
  const picked = new Set(report.markets.map((m) => (m.name || "").toLowerCase()));
  let regionName = (c) => c;
  try { const dn = new Intl.DisplayNames(["en"], { type: "region" }); regionName = (c) => (/^[A-Z]{2}$/.test(c || "") ? dn.of(c) : c) || c; } catch { /* keep codes */ }
  const extras = (qlooData.destinations || [])
    .filter((d) => d.name && !picked.has(d.name.toLowerCase()) && (d.country || "").toUpperCase() !== home.code)
    .slice(0, 30)
    .map((d) => ({
      name: d.name,
      country: regionName(d.country) || "",
      lat: d.lat, lon: d.lon,
      why: language === "id" ? "Qloo menempatkan tujuan ini tinggi untuk sinyal selera produkmu." : "Qloo ranks this destination highly for your product’s taste signals.",
      signals: [],
      verified: true,
      extra: true,
    }));
  report.markets = [...report.markets, ...extras];

  trace.push({
    name: "Check markets against Qloo results",
    tool: "FindMarket",
    ok: true,
    ms: 0,
    detail: `${report.markets.filter((m) => m.verified).length} of ${report.markets.length} markets found in Qloo destinations`,
  });

  return {
    mocked,
    report,
    signals: {
      tags: chosenTags.map((t) => ({ ...t, name: allTags.find((x) => x.id === t.id)?.name })),
      entities: chosenEntities.map((e) => ({ ...e, name: allEntities.find((x) => x.id === e.id)?.name })),
    },
    qloo: qlooData,
    trace,
  };
}
