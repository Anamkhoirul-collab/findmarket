// The exporter's home country. Detected from the browser, editable in Settings and in Review.
// Coordinates are capital cities, used as the starting point of routes on maps.

export const COUNTRIES = {
  AE: [54.37, 24.45], AR: [-58.38, -34.6], AT: [16.37, 48.21], AU: [149.13, -35.28], BD: [90.41, 23.81], BE: [4.35, 50.85],
  BG: [23.32, 42.7], BR: [-47.88, -15.79], CA: [-75.7, 45.42], CH: [7.45, 46.95], CL: [-70.67, -33.45], CN: [116.4, 39.9],
  CO: [-74.07, 4.71], CZ: [14.44, 50.08], DE: [13.4, 52.52], DK: [12.57, 55.68], DZ: [3.06, 36.75], EC: [-78.47, -0.18],
  EG: [31.24, 30.04], ES: [-3.7, 40.42], ET: [38.74, 9.03], FI: [24.94, 60.17], FR: [2.35, 48.86], GB: [-0.13, 51.51],
  GH: [-0.19, 5.6], GR: [23.73, 37.98], GT: [-90.51, 14.63], HK: [114.17, 22.32], HU: [19.04, 47.5], ID: [106.85, -6.21],
  IE: [-6.26, 53.35], IL: [35.21, 31.77], IN: [77.21, 28.61], IQ: [44.37, 33.31], IR: [51.39, 35.69], IT: [12.5, 41.9],
  JO: [35.93, 31.95], JP: [139.69, 35.69], KE: [36.82, -1.29], KH: [104.92, 11.56], KR: [126.98, 37.57], KW: [47.98, 29.38],
  KZ: [71.45, 51.17], LA: [102.63, 17.98], LB: [35.5, 33.89], LK: [79.86, 6.93], MA: [-6.85, 34.02], MM: [96.13, 19.75],
  MX: [-99.13, 19.43], MY: [101.69, 3.14], NG: [7.49, 9.06], NL: [4.9, 52.37], NO: [10.75, 59.91], NP: [85.32, 27.72],
  NZ: [174.78, -41.29], OM: [58.41, 23.59], PE: [-77.04, -12.05], PH: [120.98, 14.6], PK: [73.05, 33.68], PL: [21.01, 52.23],
  PT: [-9.14, 38.72], QA: [51.53, 25.29], RO: [26.1, 44.43], RS: [20.46, 44.79], RU: [37.62, 55.76], SA: [46.68, 24.71],
  SE: [18.07, 59.33], SG: [103.82, 1.35], TH: [100.5, 13.76], TN: [10.18, 36.81], TR: [32.85, 39.93], TW: [121.56, 25.03],
  TZ: [39.27, -6.79], UA: [30.52, 50.45], UG: [32.58, 0.35], US: [-77.04, 38.91], UY: [-56.16, -34.9], UZ: [69.24, 41.3],
  VE: [-66.9, 10.48], VN: [105.85, 21.03], ZA: [28.19, -25.75], ZW: [31.05, -17.83],
};

const TZ_TO_COUNTRY = {
  "Asia/Jakarta": "ID", "Asia/Makassar": "ID", "Asia/Jayapura": "ID", "Asia/Kuala_Lumpur": "MY", "Asia/Singapore": "SG", "Asia/Bangkok": "TH",
  "Asia/Ho_Chi_Minh": "VN", "Asia/Manila": "PH", "Asia/Tokyo": "JP", "Asia/Seoul": "KR", "Asia/Shanghai": "CN", "Asia/Kolkata": "IN",
  "Asia/Dubai": "AE", "Europe/London": "GB", "Europe/Berlin": "DE", "Europe/Paris": "FR", "Europe/Amsterdam": "NL", "Europe/Madrid": "ES",
  "Europe/Rome": "IT", "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US", "America/Los_Angeles": "US",
  "America/Toronto": "CA", "America/Mexico_City": "MX", "America/Sao_Paulo": "BR", "Australia/Sydney": "AU", "Australia/Melbourne": "AU",
  "Pacific/Auckland": "NZ", "Africa/Lagos": "NG", "Africa/Nairobi": "KE", "Africa/Johannesburg": "ZA", "Africa/Cairo": "EG",
};

export function countryName(code) {
  try { return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code; } catch { return code; }
}

export function detectHome() {
  if (typeof navigator !== "undefined") {
    for (const l of navigator.languages || [navigator.language]) {
      const region = (l || "").split("-")[1];
      if (region && COUNTRIES[region.toUpperCase()]) return region.toUpperCase();
    }
  }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TZ_TO_COUNTRY[tz]) return TZ_TO_COUNTRY[tz];
  } catch { /* ignore */ }
  return "ID";
}

export function countryOptions() {
  return Object.keys(COUNTRIES).map((c) => [c, countryName(c)]).sort((a, b) => a[1].localeCompare(b[1]));
}
