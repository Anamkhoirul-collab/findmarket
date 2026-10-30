// Official trade and country data for export briefs.
//  - UN Comtrade (needs a free COMTRADE_API_KEY): imports of the product's HS code into each country,
//    five-year trend, top supplier countries and Indonesia's position.
//  - World Bank (no key): population and GDP per capita.
// Every call is cached in memory and fails quietly, so a brief still works without this data.

const cache = new Map();
const INDONESIA = 360; // UN M49 code used by Comtrade

// The free Comtrade tier allows about one call per second, so its calls go through a queue.
let comtradeChain = Promise.resolve();
function queued(url, fn) {
  if (!url.includes("comtradeapi.un.org/data")) return fn();
  const run = comtradeChain.then(fn, fn);
  comtradeChain = run.then(() => new Promise((r) => setTimeout(r, 1100)), () => new Promise((r) => setTimeout(r, 1100)));
  return run;
}

async function getJSON(url, init = {}, ms = 20000) {
  if (cache.has(url)) return cache.get(url);
  return queued(url, async () => {
    for (let attempt = 0; ; attempt++) {
      try {
        return await fetchJSON(url, init, ms);
      } catch (err) {
        if (/ 429$/.test(err.message) && attempt < 3) { await new Promise((r) => setTimeout(r, 1500 * (attempt + 1))); continue; }
        throw err;
      }
    }
  });
}

async function fetchJSON(url, init = {}, ms = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`${new URL(url).hostname} returned ${res.status}`);
    const json = await res.json();
    cache.set(url, json);
    return json;
  } finally {
    clearTimeout(timer);
  }
}

const norm = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z ]/g, "").trim();
const ALIASES = { "united states": "united states", usa: "united states", us: "united states", uk: "united kingdom", "great britain": "united kingdom", "south korea": "korea rep", korea: "korea rep", uae: "united arab emirates", russia: "russian federation", vietnam: "viet nam", turkey: "turkiye", "czech republic": "czechia", "hong kong": "hong kong sar china", slovakia: "slovak republic", egypt: "egypt arab rep", iran: "iran islamic rep", venezuela: "venezuela rb", laos: "lao pdr", yemen: "yemen rep", syria: "syrian arab republic", kyrgyzstan: "kyrgyz republic", gambia: "gambia the", bahamas: "bahamas the", macau: "macao sar china", macao: "macao sar china", brunei: "brunei darussalam", "north korea": "korea dem peoples rep", "ivory coast": "cote divoire", "cote d'ivoire": "cote divoire", micronesia: "micronesia fed sts", "saint lucia": "st lucia", congo: "congo rep", "dr congo": "congo dem rep", "democratic republic of the congo": "congo dem rep" };

// ---- World Bank ----
let wbCountries = null;
async function wbCountryList() {
  if (wbCountries) return wbCountries;
  const json = await getJSON("https://api.worldbank.org/v2/country?format=json&per_page=400");
  wbCountries = (json?.[1] || []).filter((c) => c.region?.id !== "NA").map((c) => ({ iso3: c.id, iso2: c.iso2Code, name: c.name }));
  return wbCountries;
}

export async function findCountry(name) {
  const list = await wbCountryList();
  const n = ALIASES[norm(name)] || norm(name);
  return list.find((c) => norm(c.name) === n)
    || list.find((c) => norm(c.name).startsWith(n) || n.startsWith(norm(c.name)))
    || list.find((c) => norm(c.name).includes(n))
    || null;
}

async function wbIndicator(iso3, code) {
  const json = await getJSON(`https://api.worldbank.org/v2/country/${iso3}/indicator/${code}?format=json&mrnev=1`);
  const row = json?.[1]?.[0];
  return row && typeof row.value === "number" ? { value: row.value, year: Number(row.date) } : null;
}

export async function countryFacts(name) {
  const c = await findCountry(name);
  if (!c) return null;
  const [pop, gdp] = await Promise.all([
    wbIndicator(c.iso3, "SP.POP.TOTL").catch(() => null),
    wbIndicator(c.iso3, "NY.GDP.PCAP.CD").catch(() => null),
  ]);
  return { country: c.name, iso3: c.iso3, population: pop, gdpPerCapita: gdp, source: "World Bank" };
}

// ---- UN Comtrade ----
let reporters = null;
async function comtradeReporters() {
  if (reporters) return reporters;
  const json = await getJSON("https://comtradeapi.un.org/files/v1/app/reference/Reporters.json");
  reporters = (json?.results || []).map((r) => ({ code: r.reporterCode ?? r.id, iso3: r.reporterCodeIsoAlpha3, name: r.reporterDesc || r.text }));
  return reporters;
}
let partners = null;
async function comtradePartners() {
  if (partners) return partners;
  const json = await getJSON("https://comtradeapi.un.org/files/v1/app/reference/partnerAreas.json");
  partners = new Map((json?.results || []).map((p) => [Number(p.PartnerCode ?? p.id), p.PartnerDesc || p.text]));
  return partners;
}

// Comtrade returns many breakdown rows per period (transport mode, customs procedure, second partner).
// Keep only the overall total rows, then one value per key.
function totals(rows, keyOf) {
  const isTotal = (d) => (d.partner2Code == null || Number(d.partner2Code) === 0)
    && (d.motCode == null || Number(d.motCode) === 0)
    && (d.customsCode == null || d.customsCode === "C00");
  const pick = new Map();
  for (const d of rows || []) {
    const v = Number(d.primaryValue);
    if (!(v > 0)) continue;
    const k = keyOf(d);
    const cur = pick.get(k);
    const better = !cur || (isTotal(d) && !cur.total) || (isTotal(d) === cur.total && v > cur.value);
    if (better) pick.set(k, { value: v, total: isTotal(d) });
  }
  return pick;
}

export async function tradeFor(countryName, hs, homeName = "Indonesia") {
  const key = process.env.COMTRADE_API_KEY;
  if (!key || !/^\d{4}(\d{2})?$/.test(hs || "")) return null;
  const c = await findCountry(countryName);
  if (!c) return null;
  const reps = await comtradeReporters();
  const rep = reps.find((r) => r.iso3 === c.iso3);
  const homeCountry = await findCountry(homeName).catch(() => null);
  const homeCode = Number(reps.find((r) => r.iso3 === homeCountry?.iso3)?.code ?? INDONESIA);
  if (!rep) return null;
  const headers = { "Ocp-Apim-Subscription-Key": key };
  const now = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => now - 6 + i).join(",");
  const base = "https://comtradeapi.un.org/data/v1/get/C/A/HS";

  // Total imports from the world, per year
  const totalsJson = await getJSON(`${base}?reporterCode=${rep.code}&period=${years}&partnerCode=0&partner2Code=0&motCode=0&customsCode=C00&cmdCode=${hs}&flowCode=M&includeDesc=true`, { headers });
  let series = [...totals(totalsJson?.data, (d) => Number(d.period ?? d.refYear)).entries()]
    .map(([year, r]) => ({ year, value: r.value }))
    .filter((d) => d.year)
    .sort((a, b) => a.year - b.year);
  if (!series.length) return { country: c.name, hs, imports: [], note: "No imports reported for this product." };
  const hsLabel = totalsJson?.data?.[0]?.cmdDesc || "";
  // The newest year is often only partly reported; if it is far below the year before, mark it and
  // measure growth up to the last complete year.
  let partialYear = null;
  if (series.length >= 2 && series[series.length - 1].value < series[series.length - 2].value * 0.5) {
    partialYear = series[series.length - 1].year;
  }
  const complete = partialYear ? series.slice(0, -1) : series;
  const latest = complete[complete.length - 1];
  const first = complete[0];
  const span = latest.year - first.year;
  const growth = span > 0 && first.value > 0 ? (Math.pow(latest.value / first.value, 1 / span) - 1) * 100 : null;

  // Supplier breakdown for the latest year
  let topSuppliers = [], indonesia = null;
  try {
    const byPartner = await getJSON(`${base}?reporterCode=${rep.code}&period=${latest.year}&partner2Code=0&motCode=0&customsCode=C00&cmdCode=${hs}&flowCode=M`, { headers });
    const names = await comtradePartners().catch(() => new Map());
    const rows = [...totals(byPartner?.data, (d) => Number(d.partnerCode)).entries()]
      .map(([code, r]) => ({ code, value: r.value }))
      .filter((d) => d.code !== 0)
      .sort((a, b) => b.value - a.value);
    const total = latest.value;
    topSuppliers = rows.slice(0, 5).map((r) => ({ name: names.get(r.code) || String(r.code), value: r.value, share: (r.value / total) * 100 }));
    const idx = rows.findIndex((r) => r.code === homeCode);
    if (idx >= 0) indonesia = { value: rows[idx].value, share: (rows[idx].value / total) * 100, rank: idx + 1, of: rows.length };
    else indonesia = { value: 0, share: 0, rank: null, of: rows.length };
  } catch { /* supplier breakdown is optional */ }

  // Monthly imports for the last 24 months (Comtrade has no weekly data)
  let monthly = [];
  try {
    const now = new Date();
    const months = Array.from({ length: 24 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 24 + i, 1);
      return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
    });
    const mBase = "https://comtradeapi.un.org/data/v1/get/C/M/HS";
    const parts = await Promise.all([months.slice(0, 12), months.slice(12)].map((ps) =>
      getJSON(`${mBase}?reporterCode=${rep.code}&period=${ps.join(",")}&partnerCode=0&partner2Code=0&motCode=0&customsCode=C00&cmdCode=${hs}&flowCode=M`, { headers }).catch(() => null)));
    const merged = parts.flatMap((p) => p?.data || []);
    monthly = [...totals(merged, (d) => String(d.period ?? `${d.refYear}${String(d.refMonth).padStart(2, "0")}`)).entries()]
      .map(([period, r]) => ({ period, value: r.value }))
      .filter((d) => /^\d{6}$/.test(d.period))
      .sort((a, b) => a.period.localeCompare(b.period));
  } catch { /* monthly data is optional */ }

  return { country: c.name, home: homeCountry?.name || homeName, hs, hsLabel, imports: series, monthly, partialYear, latestYear: latest.year, latestValue: latest.value, growth, topSuppliers, indonesia, source: "UN Comtrade" };
}
