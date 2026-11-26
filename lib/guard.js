import { promises as dns } from "node:dns";

export const clientIp = (req) =>
  String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "")
    .split(",")[0]
    .trim();

// Best-effort per-instance limiter. Serverless instances are short-lived, so this
// stops bursts; Turnstile and AI screening handle the rest.
const buckets = new Map();
export function rateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) buckets.clear();
  return hits.length <= limit;
}

export async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured yet
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip })
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch {
    return false;
  }
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const DISPOSABLE = new Set([
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com", "temp-mail.org",
  "yopmail.com", "trashmail.com", "getnada.com", "sharklasers.com", "dispostable.com",
  "maildrop.cc", "fakeinbox.com", "throwawaymail.com", "mintemail.com", "emailondeck.com",
  "mohmal.com", "tempmailo.com", "burnermail.io", "moakt.com", "spamgourmet.com"
]);

export async function emailProblem(email) {
  if (!EMAIL_RE.test(email)) return "Enter a valid email address.";
  const domain = email.split("@")[1].toLowerCase();
  if (DISPOSABLE.has(domain)) return "Use a permanent email address so we can reply.";
  try {
    const mx = await dns.resolveMx(domain);
    if (!mx || mx.length === 0) return "That email domain can't receive mail. Check for typos.";
  } catch (err) {
    if (err?.code === "ENOTFOUND" || err?.code === "ENODATA") {
      return "That email domain can't receive mail. Check for typos.";
    }
  }
  return null;
}

export const clean = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export const countLinks = (text) => (String(text).match(/https?:\/\/|www\./gi) || []).length;

export function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try {
    return JSON.parse(req.body || "{}");
  } catch {
    return {};
  }
}
