// Share a brief as a self-contained link: the brief is compressed into the URL itself,
// so nothing is stored on a server. Format: #shared-<base64url of deflate-raw JSON>.

const toB64url = (bytes) => {
  let bin = "";
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromB64url = (s) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

async function pipe(bytes, stream) {
  const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await res.arrayBuffer());
}

// Keep what the brief pages need; drop the agent trace and anything personal.
function slim(b) {
  const { trace, thumb, description, ...rest } = b;
  return { ...rest, id: "shared", shared: true };
}

export async function makeShareLink(brief) {
  const json = new TextEncoder().encode(JSON.stringify(slim(brief)));
  const packed = typeof CompressionStream !== "undefined" ? await pipe(json, new CompressionStream("deflate-raw")) : json;
  const base = `${window.location.origin}${window.location.pathname}${window.location.search}`;
  return `${base}#shared-${typeof CompressionStream !== "undefined" ? "z" : "p"}${toB64url(packed)}`;
}

export async function readShareLink(hash) {
  const m = /^#?shared-([zp])([A-Za-z0-9_-]+)$/.exec(hash || "");
  if (!m) return null;
  const bytes = fromB64url(m[2]);
  const raw = m[1] === "z" ? await pipe(bytes, new DecompressionStream("deflate-raw")) : bytes;
  const b = JSON.parse(new TextDecoder().decode(raw));
  return b && b.report ? { ...b, id: "shared", shared: true } : null;
}
