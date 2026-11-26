// Live Google rating + latest reviews via Places API (New).
// Needs GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID. Without them the site shows client testimonials only.

const TTL_MS = 6 * 60 * 60 * 1000;
let cache = { at: 0, data: null };

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) return res.status(200).json({ configured: false });

  res.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate=86400");
  if (cache.data && Date.now() - cache.at < TTL_MS) return res.status(200).json(cache.data);

  try {
    const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri"
      }
    });
    if (!r.ok) throw new Error(`Places ${r.status}`);
    const p = await r.json();

    const data = {
      configured: true,
      rating: p.rating ?? null,
      count: p.userRatingCount ?? 0,
      url: p.googleMapsUri || null,
      reviewUrl: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`,
      reviews: (p.reviews || [])
        .filter((rv) => rv.rating >= 4 && rv.text?.text)
        .map((rv) => ({
          author: rv.authorAttribution?.displayName || "Google user",
          authorUrl: rv.authorAttribution?.uri || null,
          rating: rv.rating,
          text: rv.text.text,
          when: rv.relativePublishTimeDescription || ""
        }))
    };
    cache = { at: Date.now(), data };
    return res.status(200).json(data);
  } catch (err) {
    console.error("reviews failed", err);
    return res.status(200).json(cache.data || { configured: false });
  }
}
