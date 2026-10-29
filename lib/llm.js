// Server-only AI client with automatic failover.
//
// Text steps go to the first provider that answers, in this order:
//   1. Claude    (ANTHROPIC_API_KEY) main provider
//   2. Groq      (GROQ_API_KEY)      optional backup
//   3. Cerebras  (CEREBRAS_API_KEY)  optional backup
//   4. Gemini    (GEMINI_API_KEY)    optional last resort
//
// Each provider has a main model (final brief, city ideas) and an optional fast
// model (understanding the product, choosing tags, writing description options).

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const BUSY = new Set([500, 502, 503, 504, 529]);

export function hasLLM() {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.GROQ_API_KEY || process.env.CEREBRAS_API_KEY || process.env.GEMINI_API_KEY);
}

function textProviders(fast) {
  const list = [];
  if (process.env.ANTHROPIC_API_KEY) {
    const main = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";
    const quick = process.env.ANTHROPIC_FAST_MODEL || "claude-haiku-5-5";
    list.push({ name: "Claude", kind: "anthropic", key: process.env.ANTHROPIC_API_KEY, models: [...new Set(fast ? [quick, main] : [main, quick])] });
  }
  if (process.env.GROQ_API_KEY) {
    const main = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
    const quick = process.env.GROQ_FAST_MODEL || "openai/gpt-oss-20b";
    list.push({ name: "Groq", kind: "openai", url: "https://api.groq.com/openai/v1/chat/completions", key: process.env.GROQ_API_KEY, models: [...new Set((fast ? [quick, main] : [main]).filter(Boolean))] });
  }
  if (process.env.CEREBRAS_API_KEY) {
    const main = process.env.CEREBRAS_MODEL || "llama-3.3-70b";
    const quick = process.env.CEREBRAS_FAST_MODEL || main;
    list.push({ name: "Cerebras", kind: "openai", url: "https://api.cerebras.ai/v1/chat/completions", key: process.env.CEREBRAS_API_KEY, models: [...new Set(fast ? [quick, main] : [main])] });
  }
  if (process.env.GEMINI_API_KEY) list.push(geminiProvider(fast));
  return list;
}

function geminiProvider(fast) {
  const main = process.env.GEMINI_MODEL || "gemini-3.0-flash";
  const quick = process.env.GEMINI_FAST_MODEL;
  const backup = process.env.GEMINI_FALLBACK_MODEL;
  return { name: "Gemini", kind: "gemini", key: process.env.GEMINI_API_KEY, models: [...new Set((fast ? [quick, main, backup] : [main, backup, quick]).filter(Boolean))] };
}

async function timedFetch(url, init, ms = 25000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
    return { res, text: await res.text() };
  } finally {
    clearTimeout(timer);
  }
}

// One request to one model. Returns text, or throws an error tagged with what to do next.
async function requestOnce(p, model, { system, prompt, temperature, json, image }) {
  if (p.kind === "anthropic") {
    const content = [];
    if (image) content.push({ type: "image", source: { type: "base64", media_type: image.mimeType, data: image.base64 } });
    content.push({ type: "text", text: prompt });
    // For JSON answers, force a tool call: Claude then returns structured input that is always valid JSON,
    // instead of JSON text that can break on a stray quote or comma in long answers.
    const body = {
      model,
      max_tokens: 8192,
      ...(system ? { system } : {}),
      messages: [{ role: "user", content }],
      ...(json ? {
        tools: [{ name: "respond", description: "Return the complete answer as a JSON object with exactly the fields the instructions ask for.", input_schema: { type: "object", additionalProperties: true } }],
        tool_choice: { type: "tool", name: "respond" },
      } : {}),
    };
    const { res, text } = await timedFetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": p.key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(body),
    }, 90000);
    if (res.ok) {
      const data = JSON.parse(text);
      const tool = (data.content || []).find((c) => c.type === "tool_use");
      if (tool && tool.input && typeof tool.input === "object") return JSON.stringify(tool.input);
      return (data.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
    }
    throw Object.assign(new Error(`${p.name} (${model}) returned ${res.status}: ${text.slice(0, 300)}`), { status: res.status, body: text });
  }
  if (p.kind === "openai") {
    const body = {
      model,
      temperature,
      messages: [...(system ? [{ role: "system", content: system }] : []), { role: "user", content: prompt }],
      ...(json ? { response_format: { type: "json_object" } } : {}),
      // GPT-OSS models think before answering; "low" keeps that short so responses stay fast.
      ...(/gpt-oss/i.test(model) ? { reasoning_effort: "low" } : {}),
    };
    let { res, text } = await timedFetch(p.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.key}` },
      body: JSON.stringify(body),
    });
    for (let fix = 0; fix < 3 && res.status === 400; fix++) {
      // Some models reject JSON mode, temperature or reasoning_effort; ask again without them (prompts already request JSON).
      if (body.response_format && /response_format|json_object|json mode|json_validate/i.test(text)) delete body.response_format;
      else if ("temperature" in body && /temperature/i.test(text)) delete body.temperature;
      else if ("reasoning_effort" in body && /reasoning/i.test(text)) delete body.reasoning_effort;
      else break;
      ({ res, text } = await timedFetch(p.url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.key}` }, body: JSON.stringify(body) }));
    }
    if (res.ok) return JSON.parse(text).choices?.[0]?.message?.content || "";
    throw Object.assign(new Error(`${p.name} (${model}) returned ${res.status}: ${text.slice(0, 300)}`), { status: res.status, body: text });
  }
  // Gemini
  const parts = [];
  if (image) parts.push({ inlineData: { mimeType: image.mimeType, data: image.base64 } });
  parts.push({ text: prompt });
  const body = {
    ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
    contents: [{ role: "user", parts }],
    generationConfig: { temperature, ...(json ? { responseMimeType: "application/json" } : {}) },
  };
  const { res, text } = await timedFetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": p.key },
    body: JSON.stringify(body),
  }, 30000);
  if (res.ok) return (JSON.parse(text).candidates?.[0]?.content?.parts || []).map((x) => x.text || "").join("");
  throw Object.assign(new Error(`${p.name} (${model}) returned ${res.status}: ${text.slice(0, 300)}`), { status: res.status, body: text });
}

// Try every provider and model in order until one answers.
async function complete(providers, opts) {
  let lastError = new Error("No AI provider is configured. Add ANTHROPIC_API_KEY to .env.local.");
  for (const p of providers) {
    for (const model of p.models) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const text = await requestOnce(p, model, opts);
          return { text, provider: `${p.name} · ${model}` };
        } catch (err) {
          const why = err.name === "AbortError" ? `${p.name} (${model}) timed out` : err.message;
          lastError = new Error(why);
          console.error(why);
          const status = err.status;
          const body = err.body || "";
          if (!status) { await wait(600 * 2 ** attempt); continue; } // network problem: retry
          if (status === 429) {
            // Daily quota or "exceeded your quota": move on now. Per-minute limit: short wait.
            if (/per day|TPD|RPD|quota|exceeded your current|RESOURCE_EXHAUSTED/i.test(body)) break;
            const retryAfter = Number((body.match(/retry[- ]after["\s:]+(\d+)/i) || [])[1]);
            if (retryAfter && retryAfter <= 6) { await wait(retryAfter * 1000 + 200); continue; }
            const hint = Number((body.match(/try again in ([\d.]+)s/i) || [])[1]);
            if (hint && hint <= 6) { await wait(hint * 1000 + 200); continue; }
            break;
          }
          if (BUSY.has(status)) { await wait(600 * 2 ** attempt); continue; }
          break; // wrong key, model name or request: try the next model or provider
        }
      }
    }
  }
  throw lastError;
}

function parseJSON(out) {
  const clean = String(out || "").replace(/```json|```/g, "").trim();
  const attempts = [clean];
  const m = clean.match(/\{[\s\S]*\}/); // some models add a sentence around the JSON
  if (m) {
    attempts.push(m[0]);
    // Light repairs: smart quotes, trailing commas, raw line breaks inside strings
    attempts.push(m[0].replace(/[\u201C\u201D]/g, '\\"').replace(/,\s*([}\]])/g, "$1"));
    attempts.push(m[0].replace(/,\s*([}\]])/g, "$1").replace(/("(?:[^"\\]|\\.)*")|\n/g, (x, str) => str || " "));
  }
  for (const a of attempts) {
    try { return JSON.parse(a); } catch { /* try the next repair */ }
  }
  throw new SyntaxError("The AI did not return valid JSON");
}

// Mark which provider answered, so agent traces can show it.
function tag(obj, provider) {
  if (obj && typeof obj === "object") Object.defineProperty(obj, "__provider", { value: provider, enumerable: false });
  return obj;
}

export async function generateJSON({ system, prompt, temperature = 0.4, fast = false }) {
  const opts = { system, prompt, temperature, json: true };
  try {
    const { text, provider } = await complete(textProviders(fast), opts);
    return tag(parseJSON(text), provider);
  } catch (err) {
    if (!(err instanceof SyntaxError)) throw err;
    const { text, provider } = await complete(textProviders(fast), opts);
    return tag(parseJSON(text), provider);
  }
}

// Description options from a name and/or photo. Photos need Gemini; text-only can use any provider.
export async function generateJSONWithImage({ prompt, base64, mimeType, temperature = 0.5, fast = true }) {
  const providers = base64
    ? (process.env.GEMINI_API_KEY ? [geminiProvider(fast)] : [])
    : textProviders(fast);
  if (base64 && !providers.length) throw new Error("Reading photos needs GEMINI_API_KEY.");
  const { text, provider } = await complete(providers, { prompt, temperature, json: true, image: base64 ? { base64, mimeType } : null });
  return tag(parseJSON(text), provider);
}
