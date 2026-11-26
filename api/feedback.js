// Client feedback form. Submissions are emailed for approval; nothing is published automatically.
import { screenMessage } from "../lib/ai.js";
import { sendInternal } from "../lib/mail.js";
import { clean, clientIp, emailProblem, rateLimit, readBody, verifyTurnstile } from "../lib/guard.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = clientIp(req);
  if (!rateLimit(`feedback:${ip}`, { limit: 3, windowMs: 60 * 60 * 1000 })) {
    return res.status(429).json({ error: "Too many submissions. Try again later." });
  }

  const body = readBody(req);
  if (clean(body.fax, 200)) return res.status(200).json({ ok: true });

  const f = {
    name: clean(body.name, 120),
    email: clean(body.email, 200).toLowerCase(),
    project: clean(body.project, 120),
    rating: Math.round(Number(body.rating)),
    text: clean(body.text, 2000),
    publish: body.publish === true || body.publish === "on"
  };

  const errors = {};
  if (f.name.length < 2) errors.name = "Enter your name.";
  if (!(f.rating >= 1 && f.rating <= 5)) errors.rating = "Choose a rating.";
  if (f.text.length < 15) errors.text = "Write at least a sentence.";
  const emailErr = await emailProblem(f.email);
  if (emailErr) errors.email = emailErr;
  if (Object.keys(errors).length) return res.status(400).json({ error: "Check the highlighted fields.", fields: errors });

  if (!(await verifyTurnstile(body.turnstile, ip))) {
    return res.status(400).json({ error: "Verification failed. Refresh the page and try again." });
  }

  let verdict = null;
  try {
    verdict = await screenMessage({ kind: "client feedback", fields: f });
  } catch (err) {
    console.error("screening failed", err);
  }
  if (verdict && verdict.category === "spam") return res.status(200).json({ ok: true });

  try {
    await sendInternal({
      subject: `[feedback ${"★".repeat(f.rating)}] ${f.name}${f.project ? ` · ${f.project}` : ""}`,
      title: "New client feedback",
      replyTo: f.email,
      rows: [
        ["Name", f.name],
        ["Email", f.email],
        ["Project", f.project],
        ["Rating", `${f.rating}/5`],
        ["OK to publish", f.publish ? "Yes" : "No, private feedback"]
      ],
      body: `${f.text}\n\nTo publish: add it to the testimonials-data block in index.html and redeploy.`
    });
  } catch (err) {
    console.error("mail failed", err);
    return res.status(502).json({ error: "Feedback couldn't be sent. Try again later." });
  }
  return res.status(200).json({ ok: true });
}
