import { MAP } from "./worldMap";

// Same Natural Earth projection that drew the map, so city dots line up.
export function project(lon, lat) {
  const l = (lon * Math.PI) / 180, p = (lat * Math.PI) / 180;
  const p2 = p * p, p4 = p2 * p2;
  const x = l * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4)));
  const y = p * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)));
  return [MAP.tx + MAP.scale * x, MAP.ty - MAP.scale * y];
}

// Coordinates for common cities, used when Qloo or the brief has none.
const CITIES = {
  jakarta: [106.85, -6.21], tokyo: [139.69, 35.69], kyoto: [135.77, 35.01], osaka: [135.5, 34.69], seoul: [126.98, 37.57], busan: [129.08, 35.18],
  singapore: [103.82, 1.35], "kuala lumpur": [101.69, 3.14], bangkok: [100.5, 13.76], "ho chi minh city": [106.63, 10.82], hanoi: [105.85, 21.03],
  manila: [120.98, 14.6], "hong kong": [114.17, 22.32], taipei: [121.56, 25.03], shanghai: [121.47, 31.23], beijing: [116.4, 39.9],
  sydney: [151.21, -33.87], melbourne: [144.96, -37.81], brisbane: [153.03, -27.47], perth: [115.86, -31.95], auckland: [174.76, -36.85],
  dubai: [55.27, 25.2], "abu dhabi": [54.37, 24.45], doha: [51.53, 25.29], riyadh: [46.68, 24.71], istanbul: [28.98, 41.01], "tel aviv": [34.78, 32.09],
  london: [-0.13, 51.51], paris: [2.35, 48.86], amsterdam: [4.9, 52.37], berlin: [13.4, 52.52], munich: [11.58, 48.14], hamburg: [9.99, 53.55],
  copenhagen: [12.57, 55.68], stockholm: [18.07, 59.33], oslo: [10.75, 59.91], helsinki: [24.94, 60.17], brussels: [4.35, 50.85], zurich: [8.54, 47.38],
  vienna: [16.37, 48.21], milan: [9.19, 45.46], rome: [12.5, 41.9], madrid: [-3.7, 40.42], barcelona: [2.17, 41.39], lisbon: [-9.14, 38.72],
  dublin: [-6.26, 53.35], prague: [14.44, 50.08], warsaw: [21.01, 52.23],
  "new york": [-74.01, 40.71], "los angeles": [-118.24, 34.05], "san francisco": [-122.42, 37.77], seattle: [-122.33, 47.61], portland: [-122.68, 45.52],
  chicago: [-87.63, 41.88], austin: [-97.74, 30.27], miami: [-80.19, 25.76], boston: [-71.06, 42.36], toronto: [-79.38, 43.65], vancouver: [-123.12, 49.28],
  montreal: [-73.57, 45.5], "mexico city": [-99.13, 19.43], "sao paulo": [-46.63, -23.55], "buenos aires": [-58.38, -34.6],
  "cape town": [18.42, -33.92], johannesburg: [28.05, -26.2], nairobi: [36.82, -1.29], lagos: [3.38, 6.52], cairo: [31.24, 30.04],
  mumbai: [72.88, 19.08], delhi: [77.21, 28.61], bangalore: [77.59, 12.97],
};

export function coordsFor(name, fallback) {
  if (fallback && typeof fallback.lat === "number" && typeof fallback.lon === "number") return [fallback.lon, fallback.lat];
  const key = String(name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  return CITIES[key] || null;
}

export const ORIGIN = CITIES.jakarta;

// Starting point of routes: the exporter's home country (set by the app from Settings).
import { COUNTRIES, countryName } from "./home";
let HOME = "ID";
export function setHome(code) { if (COUNTRIES[code]) HOME = code; }
export function getHome() { return { code: HOME, name: countryName(HOME) }; }
export function getOrigin(code) { return COUNTRIES[code || HOME] || CITIES.jakarta; }
export function homeName(code) { return countryName(code || HOME); }

// Audience fit for a market: the combined score when available, otherwise destination affinity.
export function fitFor(brief, name) {
  const key = (name || "").toLowerCase();
  const f = Object.entries(brief?.qloo?.fit || {}).find(([k]) => k.toLowerCase() === key)?.[1];
  const d = (brief?.qloo?.destinations || []).find((x) => (x.name || "").toLowerCase() === key);
  const dest = d && typeof d.affinity === "number" ? (d.affinity <= 1 ? d.affinity * 100 : Math.min(d.affinity, 100)) : null;
  if (f && typeof f.score === "number") return { fit: f.score, destination: f.destination ?? dest, venues: f.venues, venueCount: f.venueCount || 0, dest: d };
  return { fit: dest, destination: dest, venues: null, venueCount: 0, dest: d };
}
