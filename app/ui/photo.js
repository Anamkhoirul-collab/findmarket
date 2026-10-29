// Shrinks a photo in the browser before upload. Redrawing it on a canvas
// also drops hidden metadata such as GPS location.
export const MAX_INPUT_BYTES = 10 * 1024 * 1024;

export async function preparePhoto(file, maxSide = 1024) {
  if (!file || !file.type?.startsWith("image/")) throw Object.assign(new Error("type"), { code: "type" });
  if (file.size > MAX_INPUT_BYTES) throw Object.assign(new Error("size"), { code: "size" });
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.85));
  if (!blob) throw Object.assign(new Error("read"), { code: "read" });
  return blob;
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.onerror = () => reject(new Error("read"));
    r.readAsDataURL(blob);
  });
}

// Tiny thumbnail kept with a saved brief (stays in this browser only).
export async function makeThumb(blob, side = 96) {
  try {
    const bitmap = await createImageBitmap(blob);
    const s = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = side; canvas.height = side;
    canvas.getContext("2d").drawImage(bitmap, (bitmap.width - s) / 2, (bitmap.height - s) / 2, s, s, 0, 0, side, side);
    bitmap.close?.();
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch {
    return null;
  }
}
