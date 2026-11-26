# FileFlow website v2: setup

Static site + Vercel serverless functions in `/api`. No build step.

## 1. Environment variables (Vercel > Project > Settings > Environment Variables)

| Variable | Needed for | Where to get it |
|---|---|---|
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | All emails (already set on the current site) | Google Account > Security > App passwords |
| `ANTHROPIC_API_KEY` | AI chat + AI spam screening | console.anthropic.com > API keys |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Invisible bot check on forms | dash.cloudflare.com > Turnstile > Add site (domain: fileflowco.com) |
| `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID` | Live Google rating + reviews | console.cloud.google.com > enable "Places API (New)" > create key. Place ID: developers.google.com/maps/documentation/places/web-service/place-id |
| `LEADS_TO` | Optional. Inbox for leads (default fileflowinc@gmail.com) | |
| `SPAM_TO` | Optional. Get a copy of filtered junk instead of dropping it | |
| `AUTO_REPLY` | Optional. `off` disables the "we got your message" email | |

Everything degrades safely: without Anthropic the chat shows "offline, email us" and forms skip AI screening; without Turnstile the form works with the other checks; without Google keys only client testimonials show.

## 2. How the contact form filters junk

1. Hidden honeypot field + minimum fill time (bots get a fake success).
2. Cloudflare Turnstile (invisible for real people).
3. Required project type, budget, timeline and a real description (30+ characters).
4. Email must have a real mail server (MX lookup); throwaway inboxes rejected.
5. More than 3 links = dropped.
6. AI screening: sales pitches, SEO offers, gibberish and tests never reach the inbox. Real leads arrive tagged, e.g. `[project lead · 88] Ana Lima · Website · $1,500 – $3,500`.
7. Rate limit per connection.

## 3. Chat assistant

Answers from `lib/company.js` only (prices, services, contact). Edit that file when anything changes. When a visitor wants a quote, it collects name + email + request and emails it with the full transcript. It can only send to an email the visitor actually typed.

## 4. Testimonials

Edit the `testimonials-data` block near the "From our clients" section in `index.html`. Feedback from the "Share your feedback" form is emailed to you; nothing publishes automatically.

## 5. Deploy

Point the existing Vercel project at this folder (or replace the old files with these) and redeploy.
