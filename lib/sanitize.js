// Removes personal data before anything leaves the server.
// Qloo rule: never send names, emails, or device IDs to Qloo.

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE = /(\+?\d[\d\s().-]{7,}\d)/g;
const URL = /\bhttps?:\/\/\S+|\bwww\.\S+/gi;
const HANDLE = /(^|\s)@[A-Za-z0-9_.]{2,}/g;

export function sanitizeText(input) {
  if (typeof input !== "string") return "";
  return input
    .replace(EMAIL, "[removed]")
    .replace(URL, "[removed]")
    .replace(PHONE, "[removed]")
    .replace(HANDLE, "$1[removed]")
    .replace(/\s+/g, " ")
    .trim();
}
