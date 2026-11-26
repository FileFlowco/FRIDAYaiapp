/* FileFlow assistant: built-in answers. Runs entirely in the browser. */
(() => {
  "use strict";

  const PHONE = "+1 (650) 254-6117";
  const EMAIL = "fileflowinc@gmail.com";
  const QUOTE = { href: "quote.html", label: "Get a free quote" };
  const SERVICES = { href: "services.html", label: "See services and pricing" };
  const WORK = { href: "work.html", label: "See our work" };
  const BOOK = { href: "https://calendar.google.com/appointments/schedules/AcZssZ02CukuauFdq1pWzbNMr2Qpkbr-gbn-4J3Dd5_B9S95cC0pCUh0iWTGUsip1tu8x3ng7i_Ah9_M", label: "Book a 15-minute call" };
  const TERMS = { href: "terms.html", label: "Terms of service" };

  const CH = {
    start: ["Start a project", "Get a free quote"],
    team: ["Talk to the team"],
    explore: ["What do you build?", "How much does it cost?", "How long does it take?"]
  };

  /* ---------- Services ---------- */
  const S = {
    website: {
      re: /\b(web ?sites?|sites?|landing ?page|web ?page|homepage|redesign|wordpress|webflow|portfolio site)\b/,
      name: "a website",
      about: "We design and build fast, mobile-first websites that look premium and turn visitors into customers: one-page sites, full business sites with booking or contact forms, and redesigns of existing sites. Every site is set up for Google from day one.",
      price: "One-page websites start at $499. Business websites with more pages, booking or custom features are quoted after a quick look at what you need. You get a fixed price in writing before anything starts.",
      time: "A one-page site usually goes live in one to two weeks. A full business website takes about two to three weeks.",
      chips: ["How much is a website?", "Can you redesign my site?", "Start a project"]
    },
    store: {
      re: /\b(online store|e-?commerce|shop(ify)?|store|sell (online|products)|checkout|cart)\b/,
      name: "an online store",
      about: "We build online stores with product pages, secure payments, shipping and inventory you can manage yourself. We can also connect your store to the tools you already use.",
      price: "Online stores are quoted individually, since it depends on the number of products, payments and integrations. The quote is free and comes in writing.",
      time: "Most online stores launch in about three to five weeks, depending on the catalog.",
      chips: ["Get a free quote", "How do payments work?", "Talk to the team"]
    },
    assistant: {
      re: /\b(chat ?bot|ai chat|chat assistant|ai assistant|assistant (on|for) my (site|website)|answer (customer )?questions|virtual assistant|live chat)\b/,
      name: "a website AI assistant",
      about: "A website AI assistant answers your customers' questions 24/7, in your tone, using your real information. It can collect leads, book appointments and email you every important conversation. Like the one you're talking to now.",
      price: "Website AI assistants start at $499 for setup, plus a monthly plan that covers hosting, monitoring and updates.",
      time: "A website assistant usually goes live within one to two weeks.",
      chips: ["What can it do?", "How much is it?", "Start a project"]
    },
    agent: {
      re: /\b(ai agents?|agents?|automat\w*|workflows?|zapier|make\.com|follow[- ]?ups?|crm|repetitive|manual (work|tasks)|save time|integrat\w*|email automation)\b/,
      name: "AI agents and automation",
      about: "We build AI agents and automations that take repetitive work off your team: lead follow-up, booking, inbox sorting, invoices, reports and CRM updates. A person approves anything that sends, spends or publishes. We run our own company on the same technology.",
      price: "Automation is quoted per project, based on what it connects to and how much it handles. Tell us the task you want off your plate and we'll send a fixed price.",
      time: "Most AI agents and automations take one to three weeks.",
      chips: ["What could you automate for me?", "Get a free quote", "Talk to the team"]
    },
    app: {
      re: /\b(apps?|ios|android|iphone|mobile|app store|play store|react native|flutter|swift)\b/,
      name: "a mobile app",
      about: "We design and build iOS and Android apps, from the first screens to App Store release. Our own apps, FRIDAY.ai and Subitoo, are live on the App Store, so we know what shipping and maintaining an app takes.",
      price: "Apps are quoted individually, since scope varies a lot. We often suggest a focused first version so you can launch sooner and grow from there. The quote is free.",
      time: "Most apps take six to ten weeks for a first version, depending on features.",
      chips: ["Tell me about FRIDAY.ai", "Get a free quote", "Talk to the team"]
    },
    software: {
      re: /\b(software|saas|platform|dashboards?|portals?|internal tools?|web ?apps?|systems?|database|admin panel|mvp)\b/,
      name: "custom software",
      about: "We build custom software: web apps, SaaS platforms, client portals, dashboards and the internal tools a team runs on. Clean, maintainable code built to last.",
      price: "Custom software is quoted per project after a free consultation. You'll get scope, timeline and a fixed price in writing.",
      time: "A focused first version usually takes four to ten weeks. Your quote includes a real timeline.",
      chips: ["Get a free quote", "Talk to the team"]
    },
    social: {
      re: /\b(social media|instagram|tiktok|pinterest|followers|grow my (account|page|instagram)|posting|social ?bot|engagement)\b/,
      name: "social media automation",
      about: "Our social media bot grows accounts on autopilot: scheduled posts, comments, interactions and DM sequences across Instagram, TikTok and Pinterest, all controlled from Telegram. It started as a client project and now runs for several businesses.",
      price: "Social media automation is quoted based on the platforms and volume you need. The quote is free.",
      time: "Setup usually takes about a week.",
      chips: ["Get a free quote", "Talk to the team"]
    },
    seo: {
      re: /\b(seo|google (business|maps|profile|my business)|rank(ing)?|show up on google|search results|local search)\b/,
      name: "Google profile and local SEO",
      about: "We set up and optimize your Google Business Profile and local SEO so nearby customers find you on Search and Maps.",
      price: "Google Business Profile and local SEO setup starts at $199.",
      time: "Setup takes a few days. Google itself can take a few weeks to reflect changes.",
      chips: ["Start a project", "Do you build websites too?"]
    },
    menu: {
      re: /\b(menu|qr ?code|restaurant|cafe|pizzeria|food truck|bakery)\b/,
      name: "a digital menu",
      about: "We build digital menus customers open from a QR code, easy for you to update when dishes or prices change. We can add ordering, a website and Google setup around it.",
      price: "Digital menus are quoted on scope and are usually one of our smaller projects. The quote is free.",
      time: "A digital menu is usually ready within a week.",
      chips: ["Get a free quote", "Talk to the team"]
    },
    care: {
      re: /\b(care plan|maintenance|maintain|hosting|host|updates?|monitoring|keep (it|my site) (running|updated))\b/,
      name: "a care plan",
      about: "Care plans keep your website or app healthy after launch: hosting, security updates, monitoring, backups and small edits every month.",
      price: "Website care plans start at $79 per month.",
      time: "A care plan can start the same week.",
      chips: ["Start a project", "Talk to the team"]
    },
    fix: {
      re: /\b(fix|broken|bug|not working|take over|someone else built|existing (site|website|app)|current (site|website|app)|old (site|website))\b/,
      name: "fixing or updating an existing project",
      about: "Yes, we fix, update and extend existing websites and apps, including code someone else built. We start with a short review, then tell you honestly what it needs.",
      price: "Fixes and updates are quoted after a quick review of the project. Small fixes are often a fast turnaround.",
      time: "Small fixes can often be done within a few days.",
      chips: ["Talk to the team", "Get a free quote"]
    }
  };
  const SERVICE_ORDER = ["assistant", "seo", "menu", "care", "fix", "store", "social", "app", "agent", "software", "website"];

  /* ---------- Products ---------- */
  const P = [
    { re: /\bfriday\b/, text: "FRIDAY.ai is our own AI assistant for iPhone. It runs entirely on the device: no cloud, no subscription, and nothing you say leaves your phone. It's live on the App Store.", link: { href: "https://apps.apple.com/us/app/friday-ai/id6778718778", label: "View on the App Store" } },
    { re: /\b(subitoo|dayflow)\b/, text: "Subitoo is our minimal daily task app for iPhone. Add your routine once, check things off as you go, and start fresh every morning. We did the app, brand and website.", link: { href: "https://apps.apple.com/us/app/subitoo/id6762689194", label: "View on the App Store" } },
    { re: /\b(fileflow ?os|ffos)\b/, text: "FileFlowOS is the AI operations software we built to run FileFlow, and now deploy for client businesses. Agents find and follow up with leads, sort the inbox, send invoices and track projects, with a person approving anything important. One business owner told us he'd spent thousands on marketing agencies and never got close to the leads and customers FileFlowOS brought in.", link: WORK },
    { re: /\b(socialbot|social bot)\b/, text: S.social.about, link: WORK },
    { re: /\b(organizer ?py|organize\.py|file organizer)\b/, text: "OrganizerPY is one of our first products, used by hundreds of people. Point it at a messy folder and it sorts every file into Images, Documents, Videos and more in one run.", link: WORK },
    { re: /\b(leadforge|lead forge|leads generator|lead generator)\b/, text: "LeadForge finds real business leads: enter a niche and a city and get names, phones, emails, websites and addresses, ready for outreach. Our team can tell you more about access.", chips: ["Talk to the team"] },
    { re: /\b(invoicegen|invoice gen|invoice generator)\b/, text: "InvoiceGen creates branded, professional invoices with line items and taxes, exported to a clean PDF in seconds. Our team can tell you more about access.", chips: ["Talk to the team"] }
  ];

  /* ---------- General topics, checked in order ---------- */
  const T = [
    { id: "human", re: /\b(human|real person|someone real|talk to (a |the )?(person|team|someone|human)|speak (to|with)|representative|agent please|call me|contact me|reach out to me|talk to the team)\b/,
      say: () => ({ text: "Of course. I'll pass your message to our team and they'll reply by email within one business day. What's your name?", lead: true }) },
    { id: "book", re: /\b(book (a |an )?(call|meeting|consultation|appointment|time)|schedule (a |an )?(call|meeting|consultation)|set up a call|calendar|availability|available times?|free call)\b/,
      say: () => ({ text: "You can pick a time that works for you right here. It's a free 15-minute call with our team, no obligation.", link: BOOK, chips: ["Take my details here"] }) },
    { id: "terms", re: /\b(terms|terms of service|contract|agreement|legal|cancel\w*|liabilit\w*)\b/,
      say: () => ({ text: "Every project has a written quote with scope, timeline and price, and our terms cover payments, ownership, support and ending a project. You can read them anytime.", link: TERMS }) },
    { id: "results", re: /\b(results?|did it (help|work)|does it work|worth it|roi|return|success stor\w*|what changed|before and after|missed calls?|after ?hours|night calls?)\b/,
      say: () => ({ text: "A few real examples: an AI assistant that answers calls a business missed, even after hours, and books a time, so the owner just confirms it the next morning. Email, invoices and payment follow-ups that run on their own. Social media that keeps posting while the owner just approves. And one owner told us FileFlowOS brought in more leads than the marketing agencies he'd paid thousands for.", link: WORK, chips: ["Can you build something like that for me?"] }) },
    { id: "start", re: /\b(start (a|my|the)? ?project|i have (a|an) (project|idea|business)|hire you|work with you|get started|let'?s (do it|start|go|build)|sign me up|i'?m interested|ready to start|book a (call|consultation)|schedule a call|free call)\b/,
      say: () => ({ text: "Great, let's get you started. I'll collect a few details and our team will follow up within one business day. What's your name?", lead: true }) },
    { id: "quote", re: /\b(quote|estimate|proposal)\b/,
      say: () => ({ text: "Our quote form takes about a minute: five quick questions, and our team sends a fixed price in writing within one business day. Or I can take your details right here.", link: QUOTE, chips: ["Take my details here"] }) },
    { id: "price", re: /\b(price|prices|pricing|cost|costs|how much|charge|rates?|fee|fees|budget|afford|expensive|cheap|\$\s?\d)/,
      say: () => ({ text: "Every project is different, so most work is quoted individually after a free consultation. Starting points: one-page websites and website AI assistants from $499, Google profile setup from $199, care plans from $79/month. Apps, software and automation get a free custom quote, always as a fixed price in writing.", link: SERVICES, chips: ["Get a free quote", "Do you offer payment plans?"] }) },
    { id: "time", re: /\b(how long|timeline|turnaround|how fast|how quick|how soon|when can you (start|finish)|deadline|asap|urgent|rush)\b/,
      say: () => ({ text: "Most projects start within a week of approving the quote. Typical timelines: one-page sites and AI assistants in one to two weeks, business websites in two to three, AI agents in one to three, and apps or full platforms in six to ten. Tight deadline? Tell us and we'll say honestly whether we can make it.", chips: ["I have a deadline", "Get a free quote"] }) },
    { id: "process", re: /\b(process|how (does|do) (it|this|you) work|what happens|steps|how do we start|next steps|onboarding)\b/,
      say: () => ({ text: "It's simple: 1) a free 15 to 30 minute call or quick form, 2) a written quote with scope, timeline and fixed price, 3) we build while you see progress and test it with us, 4) launch, then ongoing support whenever you need it. Nothing starts until you approve the quote.", chips: ["Get a free quote", "Talk to the team"] }) },
    { id: "pay", re: /\b(pay|payment|payments|deposit|installments?|milestones?|financ\w*|payment plans?|card|paypal|zelle|venmo|bank transfer|stripe|cash ?app|credit|debit|safe to pay|secure payment)\b/,
      say: () => ({ text: "Your quote shows exactly when each payment is due. We accept credit and debit cards, Apple Pay, Google Pay, PayPal, Zelle and bank transfer. Online payments go through a secure Stripe link, so we never see or store your card details.", chips: ["Get a free quote"] }) },
    { id: "own", re: /\b(owns?|owner|ownership|source code|my code|intellectual property|ip rights|rights)\b/,
      say: () => ({ text: "It depends on the project. What you own, and when, is written into your quote before anything starts." }) },
    { id: "nda", re: /\b(ndas?|non-?disclosure|confidential\w*|secret idea|keep (it|this) private)\b/,
      say: () => ({ text: "Absolutely. We're happy to sign an NDA before you share details. Send it with your first message and the team will sign it before the call.", chips: ["Talk to the team"] }) },
    { id: "revisions", re: /\b(revisions?|changes|edits|not happy|don'?t like|refund|guarantee|money back)\b/,
      say: () => ({ text: "You see progress as we build and give feedback along the way, so there are no surprises at the end. Revisions within the agreed scope are included, and we don't call a project done until it works the way we agreed in writing." }) },
    { id: "security", re: /\b(secure|security|privacy|private|data|gdpr|hipaa|encrypt\w*|safe)\b/,
      say: () => ({ text: "We take security seriously: secure hosting, encrypted connections, least-access accounts and no selling or sharing of your data. For sensitive industries, tell us your requirements and we'll design around them." }) },
    { id: "support", re: /\b(support|after launch|help later|warranty|long term|long-term)\b/,
      say: () => ({ text: "We stay on after launch for fixes, changes and new features. Care plans start at $79/month and cover hosting, monitoring and updates. AI plans include monitoring and improvements." }) },
    { id: "where", re: /\b(where are you|located|location|based|address|office|san mateo|bay area|silicon valley|local|near me|in person)\b/,
      say: () => ({ text: "We're based in San Mateo, California. We meet Bay Area clients in person and work with clients everywhere else remotely." }) },
    { id: "remote", re: /\b(remote(ly)?|other (country|state)|international|outside (the )?(us|usa|united states)|worldwide|brazil|europe|canada|mexico)\b/,
      say: () => ({ text: "Yes, we work with clients worldwide. Everything runs smoothly online: calls, progress updates and launch." }) },
    { id: "lang", re: /\b(portuguese|portugu[eê]s|spanish|espa[nñ]ol|languages?|speak)\b/,
      say: () => ({ text: "Our team works in English, Portuguese and Spanish. Write to us in whichever you prefer.", chips: ["Talk to the team"] }) },
    { id: "tech", re: /\b(tech stack|technolog\w*|frameworks?|languages? do you use|react|next\.?js|node|python|javascript|typescript|supabase|firebase|aws|vercel|openai|claude|gpt|llm)\b/,
      say: () => ({ text: "We pick the stack that fits the project rather than forcing one. Common choices: modern JavaScript and Python on the web, Swift for iOS, cross-platform when it makes sense, and the leading AI models for agents and assistants. Everything is built to be maintainable by any good engineer later." }) },
    { id: "diy", re: /\b(wix|squarespace|godaddy|diy|do it myself|template|why (should i )?(hire|choose|pick) you|why fileflow|what makes you different|better than)\b/,
      say: () => ({ text: "Builders like Wix are fine to start. We're the right call when you want something that looks premium, loads fast, ranks on Google and actually brings in customers, without spending your weekends on it. And you get a team that keeps it running after launch.", chips: ["See our work", "Get a free quote"] }) },
    { id: "small", re: /\b(small business|just (starting|started)|starting out|new business|side (hustle|business)|solo|one person|freelancer|small budget|tight budget|low budget)\b/,
      say: () => ({ text: "We work with plenty of small businesses and new ventures. We'll recommend the simplest thing that gets results now, and you can grow from there. A one-page website or a Google profile setup is often a great first step.", chips: ["How much is a website?", "Get a free quote"] }) },
    { id: "discount", re: /\b(discount|deal|promo|coupon|nonprofit|non-profit|charity|student|cheaper|lower (the )?price)\b/,
      say: () => ({ text: "We're flexible where we can be, especially for nonprofits and early-stage businesses. Share what you need and your budget, and the team will find an option that works.", chips: ["Talk to the team"] }) },
    { id: "work", re: /\b(portfolio|examples?|previous (work|projects)|past (work|projects)|your work|case stud\w*|show me|what have you (built|made|done)|clients)\b/,
      say: () => ({ text: "Some highlights: FileFlowOS, our AI operations software that brings in leads and automates the busywork for businesses; FRIDAY.ai and Subitoo, our apps on the App Store; SocialBot, running for several businesses; and OrganizerPY, used by hundreds of people. A lot of client work is private, so the team is happy to walk you through relevant examples on a call.", link: WORK }) },
    { id: "trust", re: /\b(legit|trust|scam|real company|reviews?|testimonials?|rating)\b/,
      say: () => ({ text: "Fair question. We're a software company in San Mateo with 100+ projects shipped, two apps on the App Store and a 5.0 rating from client reviews. You also never pay for anything before you've approved a written quote.", link: { href: "index.html#voices", label: "Read client reviews" } }) },
    { id: "careers", re: /\b(jobs?|hiring|careers?|internships?|work for (you|fileflow)|join (your|the) team|apply)\b/,
      say: () => ({ text: "We're not hiring right now, but we like meeting good people. Send a short intro and what you'd love to build to " + EMAIL + ".", link: { href: "careers.html", label: "Careers" } }) },
    { id: "contact", re: /\b(phone|number|call|email|e-mail|contact|reach you|hours|open|instagram)\b/,
      say: () => ({ text: `Call or text ${PHONE}, or email ${EMAIL}. Our team replies within one business day. You can also leave your details here and we'll reach out.`, chips: ["Take my details here"] }) },
    { id: "industry", re: /\b(dentists?|dental|clinics?|doctors?|medical|salons?|barbers?|spas?|restaurants?|real estate|realtors?|law (firm|office)|lawyers?|attorneys?|gyms?|fitness|trainers?|contractors?|plumb\w*|roofing|hvac|cleaning|churche?s?|schools?|coach\w*|photograph\w*|retail|boutique|hotels?|agenc(y|ies)|accountants?|insurance|auto (shop|repair)|landscap\w*)\b/,
      say: () => ({ text: "For a business like that, the biggest wins are usually: a fast website that ranks locally and converts visitors, an AI assistant that answers questions and books appointments 24/7, and automation for follow-ups, reminders and reviews. On a free call we'll tell you which of these would actually pay off for you.", chips: ["Start a project", "How much does it cost?", "See our work"] }) },
    { id: "what", re: /\b(services|what (do|can) (you|fileflow) (do|build|offer|make)|what is fileflow|who are you|about (you|fileflow)|tell me about (you|fileflow)|what do you build)\b/,
      say: () => ({ text: "FileFlow is a software company in San Mateo, California. We build whatever a business needs to run better: websites, online stores, AI assistants and agents, automation, mobile apps and custom software. Clients range from local shops to growing companies.", link: SERVICES, chips: ["Websites", "AI and automation", "Apps and software"] }) },
    { id: "bot", re: /\b(are you (a )?(bot|ai|robot|human|real)|is this (a )?(bot|ai|human)|who am i talking to)\b/,
      say: () => ({ text: "I'm FileFlow's assistant. I can answer most questions about our services, and when you need a person, I'll pass your message straight to the team.", chips: ["Talk to the team"] }) },
    { id: "thanks", re: /\b(thanks|thank you|thx|ty|appreciate|perfect|awesome|great|cool|nice|ok(ay)?|got it|sounds good)\b/,
      say: () => ({ text: "Happy to help. Anything else I can answer?", chips: ["Start a project", "No, that's all"] }) },
    { id: "bye", re: /\b(bye|goodbye|that'?s all|no,? that'?s all|see you|have a good|nothing else|i'?m good)\b/,
      say: () => ({ text: "Thanks for stopping by. When you're ready, the quote form takes about a minute.", link: QUOTE }) },
    { id: "hi", re: /^(hi|hello|hey|hiya|yo|sup|good (morning|afternoon|evening)|greetings|howdy)\b/,
      say: () => ({ text: "Hi! What are you looking to build? I can help with services, prices, timelines or getting a project started.", chips: CH.explore }) },
    { id: "how", re: /\b(how are you|how'?s it going|what'?s up)\b/,
      say: () => ({ text: "Doing well, thanks for asking. What can I help you with today?", chips: CH.explore }) },
    { id: "name", re: /\b(what'?s your name|your name|who made you|who built you|who created you)\b/,
      say: () => ({ text: "I'm FileFlow's assistant, built by our team, the same way we build assistants for clients. What can I help you with?", chips: CH.explore }) },
    { id: "joke", re: /\b(joke|funny|make me laugh)\b/,
      say: () => ({ text: "Why did the website go to therapy? Too many unresolved issues. We fix those, by the way.", chips: CH.explore }) },
    { id: "chatgpt", re: /\b(chat ?gpt|are you gpt|openai|gemini|siri|alexa)\b/,
      say: () => ({ text: "I'm FileFlow's own assistant. I'm here for questions about our services, prices and projects, and I can pass anything else to the team.", chips: CH.explore }) },
    { id: "day", re: /\b(good night|have a (nice|good) (day|night|one)|weekend)\b/,
      say: () => ({ text: "You too! If anything comes up, I'm here anytime." }) },
    { id: "rude", re: /\b(stupid|useless|dumb|sucks|terrible|worst|wtf)\b/,
      say: () => ({ text: "Sorry I'm not getting it right. Let me pass your message to a person on our team instead. What's your name?", lead: true }) }
  ];

  const PT = /\b(oi|ol[aá]|bom dia|boa tarde|boa noite|quanto custa|pre[cç]o|or[cç]amento|obrigad[oa]|voc[eê]s|aplicativo)\b/;
  const ES = /\b(hola|buenos d[ií]as|buenas|cu[aá]nto cuesta|precio|gracias|ustedes|aplicaci[oó]n|p[aá]gina web)\b/;

  /* Short replies that only make sense after a question */
  const YES = /^(yes|yeah|yep|sure|ok(ay)?|please|go ahead|do it|y)\b/;
  const NO = /^(no|nope|nah|not now|not yet|maybe later|no thanks)\b/;

  const clean = (t) => t.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim();

  function serviceIn(t) {
    if (/^ai and automation$/.test(t)) return "agent";
    if (/^apps and software$/.test(t)) return "software";
    for (const k of SERVICE_ORDER) if (S[k].re.test(t)) return k;
    return null;
  }

  function reply(raw, ctx) {
    const t = clean(raw);
    const out = (o) => ({ chips: [], ...o });

    if (ctx.offer && YES.test(t)) { const o = ctx.offer; ctx.offer = null; return out(o); }
    if (ctx.offer && NO.test(t)) { ctx.offer = null; return out({ text: "No problem. Anything else I can help with?", chips: CH.explore }); }
    ctx.offer = null;

    if (/take my details here|i have a deadline/.test(t)) return out({ text: "Sure. What's your name?", lead: true });
    if (/^see our work$/.test(t)) return out({ text: "Here's a selection of what we've built.", link: WORK });
    if (/^(get a free quote|start a project)$/.test(t)) return out({ text: "Great. The quote form takes about a minute, or I can take your details right here.", link: QUOTE, chips: ["Take my details here"] });
    if (/^what can it do\??$/.test(t)) return out({ text: "It answers questions about your business 24/7, collects names and emails from interested customers, books appointments, and emails you every conversation that matters. It speaks in your tone and only uses your real information.", chips: ["How much is it?", "Start a project"] });
    if (/^what could you automate for me\??$/.test(t)) return out({ text: "Common wins: replying to new leads in minutes, booking and reminders, sorting the inbox, sending invoices and follow-ups, updating the CRM, and weekly reports. Tell me what eats most of your team's time and I'll pass it to the team for ideas.", chips: ["Talk to the team"] });

    if (PT.test(t) && !/\b(the|and|you|what)\b/.test(t)) return out({ text: "Olá! Nossa equipe fala português. Posso responder por aqui em inglês, ou passar sua mensagem para a equipe responder em português por email. Qual é o seu nome?", lead: true });
    if (ES.test(t) && !/\b(the|and|you|what)\b/.test(t)) return out({ text: "¡Hola! Nuestro equipo habla español. Puedo ayudarte aquí en inglés, o pasar tu mensaje al equipo para que te responda en español por email. ¿Cómo te llamas?", lead: true });

    const email = raw.match(/[^\s@]+@[^\s@]+\.[^\s@]{2,}/);
    if (email) return out({ text: "Thanks, I've got your email. What's your name, so the team knows who they're writing to?", lead: true, email: email[0] });

    for (const p of P) if (p.re.test(t)) return out({ text: p.text, link: p.link, chips: p.chips || ["Can you build something like that for me?"] });
    if (/build something like that/.test(t)) return out({ text: "Yes. That's exactly the kind of work we do for clients. Tell me a bit about your idea, or I can pass you straight to the team.", chips: ["Talk to the team", "Get a free quote"] });

    if (/\b(cash ?app|venmo|crypto|bitcoin|check|cash)\b/.test(t) && /\b(pay|take|accept|use|do you)\b/.test(t)) return out({ text: "We accept credit and debit cards, Apple Pay, Google Pay, PayPal, Zelle and bank transfer, with online payments through a secure Stripe link. For anything else, ask the team and they'll let you know.", chips: ["Talk to the team"] });

    for (const id of ["small", "discount"]) { const x = T.find((y) => y.id === id); if (x.re.test(t)) return out(x.say(ctx)); }

    const svc = serviceIn(t);
    const topic = svc || ctx.topic;
    const asksPrice = T.find((x) => x.id === "price").re.test(t);
    const asksTime = T.find((x) => x.id === "time").re.test(t) && (svc || !/\bstart\b/.test(t));
    if (svc) ctx.topic = svc;

    if (!svc && t.split(" ").length > 7) { /* long general question: answer generally below */ }
    else if (topic && asksPrice) return out({ text: S[topic].price, link: SERVICES, chips: ["Get a free quote", "How long does it take?"] });
    if (topic && asksTime && !/deadline|asap|urgent|rush/.test(t)) return out({ text: S[topic].time + " Your written quote includes a real timeline.", chips: ["Get a free quote", "How much does it cost?"] });

    const wantsIt = /\b(i (want|need|would like|'d like|am looking for|'m looking for)|looking for|can you (make|build|create|do|help|add|set up|setup)|do you (do|make|build|offer)|could you)\b/.test(t);
    if (svc && wantsIt) {
      ctx.offer = { text: "Great. What's your name?", lead: true };
      return out({ text: S[svc].about + " Want me to connect you with the team for a free quote?", chips: ["Yes, connect me", "Not yet"] });
    }
    if (svc && !T.slice(0, 4).some((x) => x.re.test(t))) return out({ text: S[svc].about, chips: S[svc].chips });

    for (const x of T) if (x.re.test(t)) {
      const r = x.say(ctx);
      if (x.id === "price" && topic) return out({ text: S[topic].price, link: SERVICES, chips: ["Get a free quote"] });
      return out(r);
    }

    if (YES.test(t)) return out({ text: "Great. What would you like to know? I can cover services, prices, timelines, or connect you with the team.", chips: CH.explore });
    if (NO.test(t)) return out({ text: "No problem. I'm here if anything comes up.", chips: CH.explore });

    ctx.offer = { text: "Sure. What's your name?", lead: true, question: raw };
    return out({ text: "Good question. That one's best answered by our team directly. Want me to pass it along? They reply within one business day.", chips: ["Yes, send it to the team", "No thanks"] });
  }

  window.FFBrain = { reply };
})();
