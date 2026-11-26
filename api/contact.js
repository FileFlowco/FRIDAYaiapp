import { screenMessage } from "../lib/ai.js";
import { sendInternal, sendAutoReply } from "../lib/mail.js";
import { clean, clientIp, countLinks, emailProblem, rateLimit, readBody, verifyTurnstile } from "../lib/guard.js";

const SERVICES = ["Website", "Online store", "AI assistant or agent", "Custom software", "Mobile app", "Social media bot", "Care plan or fix existing", "Something else"];
const BUDGETS = ["Under $500", "$500 – $1,500", "$1,500 – $5,000", "$5,000+", "Not sure yet"];
const TIMELINES = ["As soon as possible", "Within a month", "1–3 months", "Just exploring"];

const TOPICS = ["General question", "Existing project or support", "Partnership", "Press or media", "Other"];

const MIN_FILL_MS = 4000;
const SPAM_THRESHOLD = 30;

// Bots get a normal-looking success so they don't learn what tripped them.
const silentOk = (res) => res.status(200).json({ ok: true });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = clientIp(req);
  if (!rateLimit(`contact:${ip}`, { limit: 4, windowMs: 10 * 60 * 1000 })) {
    return res.status(429).json({ error: "Too many messages from this connection. Try again in a few minutes or email fileflowinc@gmail.com." });
  }

  const body = readBody(req);

  if (clean(body.fax, 200)) return silentOk(res);
  const elapsed = Number(body.elapsed) || 0;
  if (elapsed && elapsed < MIN_FILL_MS) return silentOk(res);

  const isContact = body.kind === "contact";

  const f = {
    name: clean(body.name, 120),
    email: clean(body.email, 200).toLowerCase(),
    phone: clean(body.phone, 40),
    business: clean(body.business, 160),
    service: clean(body.service, 80),
    budget: clean(body.budget, 40),
    timeline: clean(body.timeline, 40),
    topic: clean(body.topic, 60),
    message: clean(body.message, 5000),
    plan: clean(body.plan, 40)
  };

  const errors = {};
  if (f.name.length < 2) errors.name = "Enter your name.";
  if (isContact) {
    if (!TOPICS.includes(f.topic)) errors.topic = "Choose a topic.";
    if (f.message.length < 10) errors.message = "Write a short message.";
  } else {
    if (!SERVICES.includes(f.service)) errors.service = "Pick what you need.";
    if (!BUDGETS.includes(f.budget)) errors.budget = "Pick a budget range.";
    if (!TIMELINES.includes(f.timeline)) errors.timeline = "Pick a timeline.";
    if (f.message.length < 30) errors.message = "Tell us a bit more, at least a couple of sentences.";
  }
  if (f.phone && !/^[+()\d\s.-]{7,}$/.test(f.phone)) errors.phone = "Enter a valid phone number or leave it empty.";
  const emailErr = await emailProblem(f.email);
  if (emailErr) errors.email = emailErr;
  if (Object.keys(errors).length) return res.status(400).json({ error: "Check the highlighted fields.", fields: errors });

  if (!(await verifyTurnstile(body.turnstile, ip))) {
    return res.status(400).json({ error: "Verification failed. Refresh the page and try again." });
  }

  if (countLinks(f.message) > 3) return silentOk(res);

  let verdict = null;
  try {
    verdict = await screenMessage({ kind: isContact ? "contact form" : "quote request", fields: f });
  } catch (err) {
    console.error("screening failed", err);
  }

  const isSpam = verdict && (verdict.category === "spam" || verdict.quality < SPAM_THRESHOLD);

  if (isSpam) {
    console.log("contact screened out", { email: f.email, verdict });
    if (process.env.SPAM_TO) {
      await sendInternal({
        to: process.env.SPAM_TO,
        subject: `[Filtered] ${f.name} · ${verdict.summary}`,
        title: "Filtered by AI screening",
        rows: [["Name", f.name], ["Email", f.email], ["Reason", verdict.red_flags.join(", ")]],
        body: f.message
      }).catch(() => {});
    }
    return silentOk(res);
  }

  const tag = verdict ? `${verdict.category.replace("_", " ")} · ${verdict.quality}` : "unscreened";

  try {
    await sendInternal({
      subject: isContact ? `[contact · ${tag}] ${f.name} · ${f.topic}` : `[quote · ${tag}] ${f.name} · ${f.service} · ${f.budget}`,
      title: verdict ? verdict.summary : "New contact form submission",
      replyTo: f.email,
      rows: [
        ["Name", f.name],
        ["Email", f.email],
        ["Phone", f.phone],
        ["Business", f.business],
        ["Topic", f.topic],
        ["Needs", f.service],
        ["Package", f.plan],
        ["Budget", f.budget],
        ["Timeline", f.timeline],
        ["Screening", verdict ? `${verdict.category} (quality ${verdict.quality}/100)${verdict.red_flags.length ? ` · flags: ${verdict.red_flags.join(", ")}` : ""}` : "AI screening off"]
      ],
      body: f.message
    });
  } catch (err) {
    console.error("mail failed", err);
    return res.status(502).json({ error: "Your message couldn't be sent. Email fileflowinc@gmail.com or call +1 (650) 254-6117." });
  }

  await sendAutoReply({ to: f.email, name: f.name }).catch((err) => console.error("auto-reply failed", err));

  return res.status(200).json({ ok: true });
}
