import { fitFor } from "./geo";
import { normalizeDemographics } from "./demographics";

export const usd = (v) => (typeof v === "number" ? new Intl.NumberFormat("en", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(v) : "–");
export const compact = (v) => (typeof v === "number" ? new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v) : "–");

export function tradeOf(brief, country) {
  const t = brief?.qloo?.trade || {};
  return t[country] || Object.entries(t).find(([k]) => k.toLowerCase() === String(country || "").toLowerCase())?.[1] || null;
}
export function factsOf(brief, country) {
  const f = brief?.qloo?.facts || {};
  return f[country] || Object.entries(f).find(([k]) => k.toLowerCase() === String(country || "").toLowerCase())?.[1] || null;
}

// How much independent evidence backs a market recommendation.
export function confidenceFor(t, brief, m) {
  const fit = fitFor(brief, m.name);
  const trade = tradeOf(brief, m.country);
  const facts = factsOf(brief, m.country);
  const demo = normalizeDemographics(brief?.qloo?.audience);
  const checks = [
    { key: "taste", ok: fit.destination !== null && fit.destination !== undefined, label: t.evTaste, detail: fit.destination != null ? `${Math.round(fit.destination)}%` : t.evMissing },
    { key: "signals", ok: (m.signals || []).length >= 2, label: t.evSignals, detail: (m.signals || []).length ? (m.signals || []).join(", ") : t.evMissing },
    { key: "venues", ok: (fit.venueCount || 0) >= 3, label: t.evVenues, detail: fit.venues != null ? t.evVenuesDetail(fit.venueCount || 0, fit.venues) : t.evMissing },
    { key: "imports", ok: !!(trade && trade.latestValue > 0), label: t.evImports, detail: trade?.latestValue ? t.evImportsDetail(usd(trade.latestValue), trade.latestYear) : t.evImportsMissing },
    { key: "demand", ok: !!(trade && typeof trade.growth === "number" && trade.growth > 0), label: t.evGrowth, detail: typeof trade?.growth === "number" ? `${trade.growth > 0 ? "+" : ""}${trade.growth.toFixed(1)}% / yr` : t.evMissing },
    { key: "economy", ok: !!facts?.gdpPerCapita, label: t.evEconomy, detail: facts?.gdpPerCapita ? `${usd(facts.gdpPerCapita.value)} GDP per person` : t.evMissing },
    { key: "audience", ok: demo.age.length > 0, label: t.evAudience, detail: demo.age.length ? t.evAudienceDetail : t.evMissing },
  ];
  const score = checks.filter((c) => c.ok).length;
  const level = score >= 5 ? "high" : score >= 3 ? "medium" : "low";
  return { level, score, total: checks.length, checks };
}
