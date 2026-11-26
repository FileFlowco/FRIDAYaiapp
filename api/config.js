// Public, non-secret config for the browser.
export default function handler(req, res) {
  res.setHeader("Cache-Control", "public, s-maxage=300");
  res.status(200).json({
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || null,
    chat: Boolean(process.env.ANTHROPIC_API_KEY)
  });
}
