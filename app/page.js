"use client";

import App from "./ui/App";
import { getHome } from "./ui/geo";
import { sampleBriefs } from "./ui/samples";
import { blobToBase64 } from "./ui/photo";

async function analyze({ description, language, home, onStep }) {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description, language, home, stream: true }),
  });
  if (!res.ok || !res.body) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(new Error(json.error || "Request failed."), { trace: json.trace || [] });
  }
  // Read the live step stream line by line
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "", result = null;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line) continue;
      const msg = JSON.parse(line);
      if (msg.type === "step") onStep?.(msg.step);
      else if (msg.type === "result") result = msg.result;
      else if (msg.type === "error") throw Object.assign(new Error(msg.error), { trace: msg.trace || [] });
    }
  }
  if (!result) throw new Error("The analysis stopped before finishing, usually because the server ran out of time. Please try again; if it keeps happening, check the function logs on your host.");
  return result;
}

async function suggest({ name, blob, language }) {
  const image = blob ? await blobToBase64(blob) : undefined;
  const res = await fetch("/api/suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, image, mimeType: blob ? "image/jpeg" : undefined, language, home: getHome().name }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed.");
  return json;
}

async function exploreCity({ city, language, audience }) {
  const res = await fetch("/api/city", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city, language, audience, home: getHome() }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed.");
  return json;
}

async function marketsOverview({ cities }) {
  const res = await fetch("/api/markets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cities }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed.");
  return json;
}

async function whereToSell({ city, tagIds, entityIds }) {
  const res = await fetch("/api/where", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city, tagIds, entityIds }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed.");
  return json;
}

async function fetchBoundaries({ lat, lon }) {
  const res = await fetch("/api/boundaries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lon }),
  });
  if (!res.ok) return { areas: [] };
  return res.json();
}

export default function Home() {
  return <App analyze={analyze} suggest={suggest} exploreCity={exploreCity} marketsOverview={marketsOverview} whereToSell={whereToSell} realMaps fetchBoundaries={fetchBoundaries} sampleBriefs={sampleBriefs} />;
}
