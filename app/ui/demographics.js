// Turn Qloo demographics (whatever shape the API returns) into simple chart rows.
// Returns { age: [{label, value}], gender: [{label, value}] } with values on a 0-100 relative scale.

const AGE_LABELS = {
  "24_and_younger": "≤24", "18_to_24": "18–24", "25_to_29": "25–29", "30_to_34": "30–34", "35_to_44": "35–44",
  "45_to_54": "45–54", "55_and_older": "55+", "25_to_34": "25–34",
};
const GENDER_LABELS = { female: "Women", male: "Men" };

function findObj(node, key, depth = 0) {
  if (!node || typeof node !== "object" || depth > 6) return null;
  if (!Array.isArray(node) && node[key] && typeof node[key] === "object" && !Array.isArray(node[key])) return node[key];
  for (const v of Array.isArray(node) ? node : Object.values(node)) {
    const f = findObj(v, key, depth + 1);
    if (f) return f;
  }
  return null;
}

function scale(rows) {
  const vals = rows.map((r) => r.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  if (!rows.length) return rows;
  if (min >= 0 && max <= 1) return rows.map((r) => ({ ...r, value: (r.value / (max || 1)) * 100 }));
  if (max === min) return rows.map((r) => ({ ...r, value: 70 }));
  // Relative affinity can be negative: map the range onto 30-100 so the shape stays readable.
  return rows.map((r) => ({ ...r, value: 30 + ((r.value - min) / (max - min)) * 70 }));
}

export function normalizeDemographics(demo) {
  if (!demo) return { age: [], gender: [] };
  if (demo.age && Array.isArray(demo.age)) return demo; // already normalized
  const list = Array.isArray(demo) ? demo : [demo];
  if (list.length && list.every((d) => d && typeof d.label === "string" && typeof d.value === "number")) {
    return { age: list.map((d) => ({ label: d.label, value: d.value <= 1 ? d.value * 100 : d.value })), gender: [] };
  }
  const ageObj = findObj(demo, "age");
  const genderObj = findObj(demo, "gender");
  const toRows = (obj, labels) => Object.entries(obj || {})
    .filter(([, v]) => typeof v === "number")
    .map(([k, v]) => ({ label: labels[k] || k.replace(/_/g, " "), value: v }));
  return { age: scale(toRows(ageObj, AGE_LABELS)), gender: scale(toRows(genderObj, GENDER_LABELS)) };
}
