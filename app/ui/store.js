// Saved briefs and settings live only in this browser (localStorage).
// Nothing here is sent to Qloo or to any server.
const BRIEFS = "findmarket:briefs:v1";
const SETTINGS = "findmarket:settings:v1";
const MAX_BRIEFS = 50;

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const loadBriefs = () => {
  const list = read(BRIEFS, []);
  return Array.isArray(list) ? list : [];
};
export const saveBriefs = (list) => write(BRIEFS, list.slice(0, MAX_BRIEFS));
export const loadSettings = () => ({ lang: "en", reportLang: "same", theme: "light", ...read(SETTINGS, {}) });
export const saveSettings = (s) => write(SETTINGS, s);
export const clearAll = () => { try { window.localStorage.removeItem(BRIEFS); } catch { /* ignore */ } };

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Guess a category from text when the agent did not give one.
export function guessCategory(text = "") {
  const t = text.toLowerCase();
  if (/kopi|coffee|teh|tea|cokelat|chocolate|sambal|keripik|snack|madu|honey|rempah|spice|makanan|food|minuman|drink/.test(t)) return "food";
  if (/batik|tenun|songket|kain|fabric|textile|syal|scarf|baju|shirt|dress|fashion|tas|bag|sepatu|shoe/.test(t)) return "fashion";
  if (/rotan|rattan|kayu|wood|lampu|lamp|keramik|ceramic|anyam|woven|dekor|decor|furnitur|furniture|kerajinan|craft/.test(t)) return "craft";
  if (/sabun|soap|lulur|scrub|minyak|oil|skincare|kosmetik|cosmetic|spa|aroma/.test(t)) return "beauty";
  return "other";
}

// City taste profiles are cached in this browser so revisiting a city is instant.
const CITIES = "findmarket:cities:v2";
const MAX_CITIES = 12;

export function citySlug(name = "") {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}
export function loadCities() {
  const c = read(CITIES, []);
  return Array.isArray(c) ? c : [];
}
export function saveCity(profile, lang) {
  const slug = citySlug(profile.city);
  const list = loadCities().filter((c) => !(c.slug === slug && c.lang === lang));
  list.unshift({ slug, lang, profile });
  write(CITIES, list.slice(0, MAX_CITIES));
  return list.slice(0, MAX_CITIES);
}
export function findCity(slug, lang) {
  return loadCities().find((c) => c.slug === slug && c.lang === lang)?.profile || null;
}
export function clearCities() { try { window.localStorage.removeItem(CITIES); } catch { /* ignore */ } }

// Light market overviews, cached for a day so the Markets page opens instantly.
const OVERVIEW = "findmarket:overview:v2";
const DAY = 24 * 3600 * 1000;
export function loadOverviews() {
  const o = read(OVERVIEW, {});
  const now = Date.now();
  const fresh = {};
  for (const [k, v] of Object.entries(o || {})) if (v && now - (v.at || 0) < DAY) fresh[k] = v;
  return fresh;
}
export function saveOverviews(map) { write(OVERVIEW, map); }
export function clearOverviews() { try { window.localStorage.removeItem(OVERVIEW); } catch { /* ignore */ } }

// Export checklist ticks, kept in this browser.
const CHECK = "findmarket:checklist:v1";
export const loadChecklist = () => read(CHECK, {}) || {};
export const saveChecklist = (c) => write(CHECK, c);
