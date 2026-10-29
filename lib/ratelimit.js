// Simple in-memory rate limit per IP. Good enough for a hackathon demo:
// it protects your Qloo and Gemini quotas from someone spamming the button.
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 8;
const hits = new Map();

export function checkRateLimit(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_REQUESTS) {
    hits.set(ip, list);
    return { ok: false, retryAfterSec: Math.ceil((WINDOW_MS - (now - list[0])) / 1000) };
  }
  list.push(now);
  hits.set(ip, list);
  return { ok: true };
}
