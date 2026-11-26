/* FRIDAY website: header, menu, reveal, eyes, offline demo, model picker */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header + menu */
  const head = $(".head");
  const onScroll = () => head?.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const menuBtn = $(".menu-btn");
  menuBtn?.addEventListener("click", () => {
    const open = !document.body.classList.contains("menu-open");
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$(".menu a").forEach((a) => a.addEventListener("click", () => { document.body.classList.remove("menu-open"); document.body.style.overflow = ""; }));

  /* Reveal on scroll */
  const rv = $$(".rv");
  if ("IntersectionObserver" in window && !calm) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    rv.forEach((el) => io.observe(el));
  } else rv.forEach((el) => el.classList.add("on"));

  /* Eyes: follow the pointer, blink now and then */
  const faces = $$(".face");
  if (faces.length && !calm) {
    let tx = 0, ty = 0;
    addEventListener("pointermove", (e) => {
      for (const f of faces) {
        const r = f.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
        const dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
        tx = Math.max(-1, Math.min(1, dx * 2.2)); ty = Math.max(-1, Math.min(1, dy * 2.2));
        $$(".eye", f).forEach((eye) => { eye.style.setProperty("--ex", `${tx * 9}px`); eye.style.setProperty("--ey", `${ty * 6}px`); });
      }
    }, { passive: true });
    const blink = () => {
      $$(".eye").forEach((eye) => { eye.style.setProperty("--blink", ".08"); setTimeout(() => eye.style.setProperty("--blink", "1"), 130); });
      setTimeout(blink, 2600 + Math.random() * 3200);
    };
    setTimeout(blink, 1800);
  }

  /* ---------- Live FRIDAY app replica ---------- */
  const demo = $("[data-demo]");
  if (demo) {
    const screen = $(".screen", demo);
    const log = $(".log", demo);
    const boot = $("[data-boot]", demo);
    const input = $("#fq");
    const wait = (ms) => new Promise((r) => setTimeout(r, calm ? 0 : ms));
    const clock = $("[data-clock]", demo);
    clock.textContent = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/, "");

    const ANSWERS = [
      [/landlord|rent|late/i, "Hi Mark, quick heads-up: this month's rent will be two days late. It'll be in your account by Friday. Thanks for understanding."],
      [/401|retire/i, "A 401(k) is a retirement account through your job. Money comes out of your paycheck before taxes, often gets an employer match, and grows until you retire."],
      [/dinner|cook|recipe|food|eat/i, "1. Chicken fried rice with egg and scallions.\n2. Lemon garlic pasta with spinach.\n3. Black bean tacos with avocado and lime."],
      [/fix|grammar|spell|their|tomorow/i, "They're going tomorrow."],
      [/offline|internet|wifi|airplane|signal/i, "I run entirely on this iPhone, so I work the same with or without internet. Try airplane mode below."],
      [/privacy|private|data|track|safe/i, "Everything stays on your device. No account, no servers, no tracking. I can't share what never leaves your phone."],
      [/who are you|what are you|your name|hello|^hi\b|hey/i, "I'm FRIDAY, a private AI assistant that lives on your iPhone. Ask me to write, explain, plan or summarize."],
      [/price|cost|subscription|free|pay/i, "There's no subscription. Download me from the App Store and I'm yours."],
      [/model|llama|parameter/i, "I'm running Llama 3.2 3B on your iPhone's Neural Engine. You can switch to 1B for speed in settings."],
      [/joke|funny/i, "I'd tell you a cloud joke, but I don't use the cloud."],
      [/email|write|draft/i, "Sure. Tell me who it's for and the main point, and I'll draft it in your tone."],
      [/code|python|javascript|bug|loop/i, "Paste the code and the error and I'll walk through the fix step by step, right here on your phone."]
    ];
    const answerFor = (q) => (ANSWERS.find(([re]) => re.test(q)) || [0, "That's a great one to ask the real me. On this website I'm only a preview. Download FRIDAY and ask me anything, even offline."])[1];

    let busy = false;
    async function ask(q) {
      q = q.trim(); if (!q || busy) return;
      busy = true; screen.classList.add("has-msgs");
      const me = document.createElement("div"); me.className = "msg me"; me.textContent = q; log.append(me);
      log.scrollTop = log.scrollHeight;
      demo.classList.add("thinking");
      await wait(650);
      const ai = document.createElement("div"); ai.className = "msg ai"; ai.innerHTML = '<span class="txt"></span><span class="caret"></span>'; log.append(ai);
      const txt = $(".txt", ai), a = answerFor(q), words = a.split(/(\s+)/);
      const t0 = performance.now(); let n = 0;
      for (const w of words) { txt.textContent += w; if (w.trim()) n++; log.scrollTop = log.scrollHeight; await wait(w.trim() ? 38 + Math.random() * 34 : 0); }
      $(".caret", ai)?.remove();
      demo.classList.remove("thinking");
      const secs = Math.max(.4, (performance.now() - t0) / 1000);
      const meta = document.createElement("span"); meta.className = "meta-line";
      meta.textContent = `${Math.round((n * 1.3) / secs)} tok/s · ${screen.classList.contains("airplane") ? "offline" : "on-device"} · 0 bytes sent`;
      ai.append(meta); log.scrollTop = log.scrollHeight;
      busy = false;
    }
    $$("[data-chips] button", demo).forEach((b) => b.addEventListener("click", () => ask(b.textContent)));
    $("[data-compose]", demo).addEventListener("submit", (e) => { e.preventDefault(); const v = input.value; input.value = ""; ask(v); });

    // Boot sequence when the phone first comes into view
    const blinkHello = () => { $$(".hello-eyes i", demo).forEach((i) => { i.style.setProperty("--blink", ".1"); setTimeout(() => i.style.setProperty("--blink", "1"), 120); }); if (!calm) setTimeout(blinkHello, 3000 + Math.random() * 2500); };
    let booted = false;
    const start = async () => {
      if (booted) return; booted = true;
      const text = "FRIDAY booting...";
      for (let i = 1; i <= text.length; i++) { boot.textContent = text.slice(0, i); await wait(45); }
      await wait(500);
      screen.classList.remove("booting");
      setTimeout(blinkHello, 900);
    };
    if ("IntersectionObserver" in window) new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); start(); } }, { threshold: 0.35 }).observe(demo);
    else start();

    const toggle = $("[data-airplane]");
    toggle?.addEventListener("click", () => {
      const on = toggle.getAttribute("aria-pressed") !== "true";
      toggle.setAttribute("aria-pressed", String(on));
      screen.classList.toggle("airplane", on);
      $("[data-model-pill]", demo).textContent = on ? "3B · offline" : "3B · on-device";
      $("[data-air-note]").textContent = on ? "No signal. Ask anything, it still works." : "Try it. FRIDAY keeps answering.";
      if (on && !busy) ask("Do you work offline?");
    });
  }

  /* ---------- Hero console: ask FRIDAY, the eyes think, the answer types out ---------- */
  const con = $("[data-console]");
  if (con) {
    const ANS = [
      [/gate|translate/i, "In Portuguese: \"Onde fica o meu portão?\" In Spanish: \"¿Dónde está mi puerta?\""],
      [/sleep/i, "Try this: eye mask on, 4-7-8 breathing (in for 4, hold 7, out for 8), and skip screens 20 minutes before. I'll be here when you land."],
      [/cover letter/i, "I'm excited to apply for this role because it sits right where my experience and your mission meet. Here's why I'd be a strong fit."],
      [/stretch|back/i, "Try a child's pose: kneel, sit back on your heels, reach your arms forward and breathe slowly for 30 seconds. Stop if anything hurts."],
      [/napa|weekend|\btrip\b|\bplan\b/i, "Saturday: a morning tasting in Yountville, lunch in St. Helena, sunset at a hillside winery. Sunday: brunch, then the scenic drive home."],
      [/summari|notes/i, "Paste your notes and I'll pull out the key points, decisions and next steps."],
      [/compound|interest/i, "Compound interest means you earn interest on your interest. $1,000 at 7% a year grows to about $1,967 in 10 years without adding a cent."],
      [/reply|email/i, "Paste the email and tell me the tone: friendly, firm or short. I'll write the reply."],
            [/landlord|rent|late/i, "Hi Mark, quick heads-up: this month's rent will be two days late. It'll be in your account by Friday. Thanks for understanding."],
      [/401|retire/i, "A 401(k) is a retirement account through your job. Money comes out of your paycheck before taxes, often gets an employer match, and grows until you retire."],
      [/dinner|cook|recipe|food|eat/i, "1. Chicken fried rice with egg and scallions.\n2. Lemon garlic pasta with spinach.\n3. Black bean tacos with avocado and lime."],
      [/offline|internet|wifi|wi-fi|airplane|signal/i, "Yes. I run entirely on your iPhone, so I answer the same with or without internet. Try airplane mode below."],
      [/privacy|private|data|track|safe/i, "Everything stays on your device. No account, no servers, no tracking. I can't share what never leaves your phone."],
      [/who are you|what are you|your name|hello|^hi\b|hey/i, "I'm FRIDAY, a private AI assistant that lives on your iPhone. Ask me to write, explain, plan or summarize."],
      [/price|cost|subscription|free|pay/i, "There's no subscription. Download me from the App Store and I'm yours."],
      [/model|llama|parameter/i, "I run Llama 3.2 on your iPhone's Neural Engine. 3B by default, 1B if you want it faster."],
      [/joke|funny/i, "I'd tell you a cloud joke, but I don't use the cloud."],
      [/email|write|draft|message|text/i, "Sure. Tell me who it's for and the main point, and I'll draft it in your tone."],
      [/cover letter/i, "I'm excited to apply for this role because it sits right where my experience and your mission meet. Here's why I'd be a strong fit."],
      [/stretch|back/i, "Try a child's pose: kneel, sit back on your heels, reach your arms forward and breathe slowly for 30 seconds. Stop if anything hurts."],
      [/napa|weekend|\btrip\b|\bplan\b/i, "Saturday: a morning tasting in Yountville, lunch in St. Helena, sunset at a hillside winery. Sunday: brunch, then the scenic drive home."],
      [/summari|notes/i, "Paste your notes and I'll pull out the key points, decisions and next steps."],
      [/compound|interest/i, "Compound interest means you earn interest on your interest. $1,000 at 7% a year grows to about $1,967 in 10 years without adding a cent."],
      [/reply|email/i, "Paste the email and tell me the tone: friendly, firm or short. I'll write the reply."],
      [/code|python|javascript|bug|loop/i, "Paste the code and the error and I'll walk through the fix step by step, right on your phone."]
    ];
    const answer = (q) => (ANS.find(([re]) => re.test(q)) || [0, "On this website I'm only a preview. Download FRIDAY and ask me anything, even with no signal."])[1];
    const out = $("[data-reply]", con), input = $("#ask"), faceEl = $(".hero-face");
    const wait = (ms) => new Promise((r) => setTimeout(r, calm ? 0 : ms));
    let busy = false;
    async function ask(q) {
      q = q.trim(); if (!q || busy) return; busy = true;
      out.innerHTML = ""; const qq = document.createElement("span"); qq.className = "q"; qq.textContent = "> " + q; out.append(qq);
      const txt = document.createElement("span"); const cur = document.createElement("span"); cur.className = "cur"; out.append(txt, cur);
      faceEl?.classList.remove("typing"); faceEl?.classList.add("thinking"); await wait(700); faceEl?.classList.remove("thinking");
      const words = answer(q).split(/(\s+)/), t0 = performance.now(); let n = 0;
      for (const w of words) { txt.textContent += w; if (w.trim()) n++; await wait(w.trim() ? 34 + Math.random() * 30 : 0); }
      cur.remove();
      const secs = Math.max(.4, (performance.now() - t0) / 1000);
      const meta = document.createElement("span"); meta.className = "meta";
      meta.textContent = `${Math.round((n * 1.3) / secs)} tok/s · ${document.body.classList.contains("air-on") ? "offline" : "on-device"} · 0 bytes sent`;
      out.append(meta); busy = false; window.__fridayFace?.("happy", 1400);
    }
    $("[data-prompt]", con).addEventListener("submit", (e) => { e.preventDefault(); const v = input.value; input.value = ""; ask(v); });
    $$("[data-suggest] button", con).forEach((b) => b.addEventListener("click", () => ask(b.textContent)));
    window.__fridayAsk = ask; window.__fridayAskNow = ask;
  }

  /* ---------- Duel: cloud AI vs FRIDAY, airplane mode ---------- */
  const duel = $("[data-duel]");
  if (duel) {
    const REPLIES = {
      "Summarize my meeting notes": "Here's the gist:\n• Launch moves to March 3\n• Maya owns the pricing page\n• Budget approved, pending legal",
      "Write a quick thank-you text": "Thank you so much for today. It meant a lot, and I owe you one. Dinner's on me next time!",
      "What should I pack for a hike?": "Water, a snack, sunscreen, a light layer, a charged phone and a small first-aid kit. Tell me the trail and I'll adjust."
    };
    const air = $("[data-air-toggle]", duel), tag = $("[data-net-tag]", duel);
    const bodies = { cloud: $("[data-win=cloud] [data-body]", duel), friday: $("[data-win=friday] [data-body]", duel) };
    const wait = (ms) => new Promise((r) => setTimeout(r, calm ? 0 : ms));
    const el = (cls, text) => { const d = document.createElement("div"); d.className = cls; if (text) d.textContent = text; return d; };
    const sync = () => { const on = air.getAttribute("aria-pressed") === "true"; tag.textContent = on ? "Offline" : "Online"; document.body.classList.toggle("air-on", on); const st = $("[data-status]"); if (st) st.textContent = on ? "offline" : "on-device"; };
    air.addEventListener("click", () => { air.setAttribute("aria-pressed", String(air.getAttribute("aria-pressed") !== "true")); sync(); });
    tag.textContent = "Offline";
    async function typeInto(node, text) { for (const w of text.split(/(\s+)/)) { node.textContent += w; await wait(w.trim() ? 32 + Math.random() * 28 : 0); } }
    async function cloud(q, offline) {
      const b = bodies.cloud; b.innerHTML = ""; b.append(el("bub", q));
      const s = el("spin", offline ? "Connecting to server…" : "Sending to server…"); b.append(s);
      await wait(offline ? 2200 : 1700); s.remove();
      if (offline) { b.append(el("err", "Can't connect to the server. Check your internet connection and try again.")); return; }
      const a = el("ans"); b.append(a); await typeInto(a, REPLIES[q]); b.append(el("stamp", "sent to a data center"));
    }
    async function friday(q) {
      const b = bodies.friday; b.innerHTML = ""; b.append(el("bub", q));
      await wait(350); const a = el("ans"); b.append(a); await typeInto(a, REPLIES[q]);
      b.append(el("stamp", "answered on this iPhone · 0 bytes sent"));
    }
    $$("[data-duel-qs] button", duel).forEach((btn) => btn.addEventListener("click", async () => {
      const all = $$("[data-duel-qs] button", duel); all.forEach((x) => (x.disabled = true));
      const offline = air.getAttribute("aria-pressed") === "true";
      await Promise.all([cloud(btn.textContent, offline), friday(btn.textContent)]);
      all.forEach((x) => (x.disabled = false));
    }));
  }

  /* ---------- Eye expressions: look at what you type, smile when done, doze when idle ---------- */
  const hf = $(".hero-face");
  if (hf && !calm) {
    const set = (c, ms) => { hf.classList.remove("typing", "happy", "surprised", "sleepy", "lookup"); if (c) hf.classList.add(c); if (ms) setTimeout(() => hf.classList.remove(c), ms); };
    let idle;
    const wake = () => { if (hf.classList.contains("sleepy")) set("surprised", 500); clearTimeout(idle); idle = setTimeout(() => set("sleepy"), 14000); };
    ["pointermove", "keydown", "scroll", "touchstart"].forEach((ev) => addEventListener(ev, wake, { passive: true }));
    wake();
    const inp = $("#ask");
    inp?.addEventListener("focus", () => set("typing"));
    inp?.addEventListener("blur", () => hf.classList.remove("typing"));
    hf.addEventListener("click", () => set("happy", 900));
    $$('a[href*="apps.apple.com"]').forEach((a) => a.addEventListener("pointerenter", () => set("surprised", 600)));
    window.__fridayFace = set;
    $("[data-air-toggle]")?.addEventListener("click", () => set("lookup", 900));
  }

  /* ---------- Hero: FRIDAY boots, opens its eyes; on scroll the eyes fly into the logo ---------- */
  const face0 = $(".hero-face"), bootLine = $("[data-boot-line]");
  if (face0) {
    if (!calm && !sessionStorage.getItem("fri-booted")) {
      document.body.classList.add("booting");
      const lines = ["loading model on-device", "neural engine ready", "network: not required"];
      (async () => {
        for (const l of lines) { bootLine.innerHTML = ""; for (let i = 1; i <= l.length; i++) { bootLine.innerHTML = "<b>›</b> " + l.slice(0, i); await new Promise((r) => setTimeout(r, 16)); } await new Promise((r) => setTimeout(r, 260)); }
        document.body.classList.remove("booting");
        bootLine.innerHTML = "<b>›</b> hi, I'm FRIDAY";
        try { sessionStorage.setItem("fri-booted", "1"); } catch {}
      })();
    } else if (bootLine) bootLine.innerHTML = "<b>›</b> hi, I'm FRIDAY";

    const brand = $(".head .brand-eyes");
    if (brand && !calm) {
      document.body.classList.add("has-fly");
      let raf = 0;
      const fly = () => {
        raf = 0;
        face0.style.transform = "none";
        const f = face0.getBoundingClientRect(), t = brand.getBoundingClientRect();
        const end = f.top + scrollY + f.height * .9;
        const p = Math.min(1, Math.max(0, scrollY / Math.max(1, end - t.bottom)));
        const e = p * p * (3 - 2 * p);
        const dx = (t.left + t.width / 2) - (f.left + f.width / 2), dy = (t.top + t.height / 2) - (f.top + f.height / 2);
        const s = 1 + (t.width / f.width - 1) * e;
        face0.style.transform = `translate(${dx * e}px, ${dy * e}px) scale(${s})`;
        face0.style.opacity = p >= 1 ? "0" : "1";
        document.body.classList.toggle("eyes-docked", p >= 1);
      };
      const q = () => { if (!raf) raf = requestAnimationFrame(fly); };
      addEventListener("scroll", q, { passive: true }); addEventListener("resize", q); fly();
    }

    // reading: the eyes scan left to right as you type
    const askIn = $("#ask");
    let k = 0;
    askIn?.addEventListener("input", () => {
      k = (askIn.value.length % 12) / 11;
      face0.classList.add("reading");
      $$(".eye", face0).forEach((eye) => { eye.style.setProperty("--ex", `${(k - .5) * 22}px`); eye.style.setProperty("--ey", "12px"); });
    });
  }

  /* ---------- Neural field behind the hero ---------- */
  const cv = $("[data-neural]");
  if (cv && !calm) {
    const ctx = cv.getContext("2d"); let W, H, dpr, pts = [], boost = 0;
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, (W * H) / 16000)); pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25 })); };
    size(); addEventListener("resize", size);
    let raf, visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tick); }).observe(cv);
    function tick() {
      raf = 0; if (!visible) return;
      const thinking = document.querySelector(".hero-face.thinking"); boost += ((thinking ? 1 : 0) - boost) * .06;
      ctx.clearRect(0, 0, W, H);
      const sp = 1 + boost * 4;
      for (const p of pts) { p.x += p.vx * sp; p.y += p.vy * sp; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; }
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) { ctx.strokeStyle = `rgba(61,230,230,${(1 - d / 130) * (.14 + boost * .3)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      for (const p of pts) { ctx.fillStyle = `rgba(200,240,240,${.28 + boost * .4})`; ctx.beginPath(); ctx.arc(p.x, p.y, 1.4, 0, 7); ctx.fill(); }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
  }

  /* ---------- Inside your iPhone: scroll story with real app screens ---------- */
  const ins = $("[data-inside]");
  if (ins) {
    const gb = $("[data-dv-gb]"), pct = $("[data-dv-pct]"), bar = $(".ap-bar", ins), tps = $("[data-dv-tps]"), stream = $("[data-dv-stream]");
    const SUM = "• Launch moves to March 3\n• Maya owns the pricing page\n• Budget approved, pending legal";
    const wide = matchMedia("(min-width: 861px)");
    const setDl = (v) => { bar.style.setProperty("--p", v.toFixed(3)); gb.textContent = (1.8 * v).toFixed(2) + " / 1.80 GB"; pct.textContent = Math.round(v * 100) + "%"; };
    let streaming = false;
    const runStream = async () => {
      if (streaming) return; streaming = true;
      while (true) {
        if (ins.dataset.step !== "2") { await new Promise((r) => setTimeout(r, 300)); continue; }
        stream.textContent = "";
        for (const ch of SUM) { if (ins.dataset.step !== "2") break; stream.textContent += ch; tps.textContent = (24 + Math.round(Math.random() * 12)) + " tok/s"; await new Promise((r) => setTimeout(r, calm ? 0 : 28)); }
        await new Promise((r) => setTimeout(r, 2200));
      }
    };
    const onScroll = () => {
      if (!wide.matches) return;
      const r = ins.getBoundingClientRect(); const total = r.height - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / total));
      const step = Math.min(4, Math.floor(p * 4) + 1); ins.dataset.step = String(step);
      setDl(step === 1 ? Math.min(1, p * 4 * 1.15) : 1);
    };
    addEventListener("scroll", onScroll, { passive: true });
    if (wide.matches) onScroll();
    else { let s = 1; const cycle = () => { ins.dataset.step = String(s); if (s === 1) setDl(1); s = s % 4 + 1; }; cycle(); if (!calm) setInterval(cycle, 3200); }
    runStream();
  }

  /* ---------- Prompt marquee: tap a prompt, FRIDAY answers at the top ---------- */
  $$("[data-marquee] .mq-track").forEach((t) => { t.innerHTML += t.innerHTML; });
  $$("[data-marquee] button").forEach((b) => b.addEventListener("click", () => {
    const top = $("[data-console]"); if (!top) return;
    top.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "center" });
    setTimeout(() => window.__fridayAskNow?.(b.textContent), calm ? 0 : 550);
  }));

  /* ---------- Night flight: stars, parallax, draggable shade ---------- */
  const scene = $("[data-scene]");
  if (scene) {
    const st = $("[data-stars]", scene);
    for (let i = 0; i < 46; i++) { const s = document.createElement("i"); s.style.left = Math.random() * 100 + "%"; s.style.top = Math.random() * 62 + "%"; s.style.animationDelay = (Math.random() * 3).toFixed(2) + "s"; if (Math.random() < .25) { s.style.width = s.style.height = "1px"; } st.append(s); }
    const glass = $(".glass", scene);
    if (!calm) scene.addEventListener("pointermove", (e) => { const r = scene.getBoundingClientRect(); glass.style.setProperty("--mx", ((e.clientX - r.left) / r.width - .5).toFixed(3)); glass.style.setProperty("--my", ((e.clientY - r.top) / r.height - .5).toFixed(3)); });
    const shade = $("[data-shade]", scene);
    let drag = null;
    shade.addEventListener("pointerdown", (e) => { drag = { y: e.clientY, h: shade.getBoundingClientRect().height, H: glass.getBoundingClientRect().height }; shade.setPointerCapture(e.pointerId); });
    shade.addEventListener("pointermove", (e) => { if (!drag) return; const h = Math.max(8, Math.min(drag.H * .92, drag.h + e.clientY - drag.y)); glass.style.setProperty("--shade", (h / drag.H * 100).toFixed(1) + "%"); });
    const end = () => { drag = null; }; shade.addEventListener("pointerup", end); shade.addEventListener("pointercancel", end);
    // a gentle hint: the shade lifts a little once
    if (!calm) setTimeout(() => { glass.style.setProperty("--shade", "8%"); setTimeout(() => glass.style.setProperty("--shade", "16%"), 700); }, 1800);
  }

  /* ---------- Download terminal ---------- */
  const term = $("[data-term]");
  if (term) {
    const out = $("[data-term-out]", term), bar = $("[data-term-bar]", term);
    const wait = (ms) => new Promise((r) => setTimeout(r, calm ? 0 : ms));
    const line = (h) => { out.innerHTML += h + "\n"; };
    const run = async () => {
      out.innerHTML = ""; bar.style.width = "0";
      line("<b>$</b> friday setup --model llama-3.2-3b");
      await wait(500);
      line("Connecting over Wi-Fi...");
      await wait(500);
      const prog = document.createElement("span"); out.append(prog); out.append("\n");
      for (let p = 0; p <= 100; p += 2) {
        const gb = (1.8 * p / 100).toFixed(2);
        prog.textContent = `Downloading model  ${gb} / 1.80 GB  ${String(p).padStart(3)}%`;
        bar.style.width = p + "%";
        await wait(36);
      }
      line("<em>✓</em> Model saved to this iPhone");
      await wait(400);
      line("<u>✈</u> Airplane mode on. Wi-Fi off.");
      await wait(500);
      line("<b>$</b> friday ask \"summarize my notes\"");
      await wait(500);
      line("<em>✓</em> Answered on-device · 0 bytes sent");
    };
    if ("IntersectionObserver" in window && !calm) new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); run(); } }, { threshold: 0.4 }).observe(term);
    else run();
  }

  /* Model picker */
  const picker = $("[data-picker]");
  if (picker) {
    const MODELS = {
      "1B": { name: "Llama 3.2 1B", tag: "Fastest", text: "The lightest model. Very fast replies with minimal memory use. Best for quick questions, short tasks and older iPhones.", size: "~800 MB", speed: "~50 tok/s", ram: "~1.5 GB", device: "iPhone 12 and newer", v: [18, 100, 20] },
      "3B": { name: "Llama 3.2 3B", tag: "Recommended", text: "The default. The best balance of intelligence and speed on modern iPhones. Handles reasoning, code, writing and longer conversations with ease.", size: "~1.8 GB", speed: "~25 tok/s", ram: "~3.5 GB", device: "iPhone 14 and newer", v: [40, 50, 44] },
      "8B": { name: "8B model", tag: "Coming soon", text: "Maximum on-device capability for deep reasoning, long-form writing and complex coding. Planned for iPhone 16 Pro and Apple silicon iPad.", size: "~4.5 GB", speed: "~12 tok/s", ram: "~8 GB", device: "iPhone 16 Pro and newer", v: [100, 24, 100] }
    };
    const spec = $("[data-spec]");
    const set = (id) => {
      const m = MODELS[id];
      $$("button", picker).forEach((b) => b.setAttribute("aria-selected", String(b.dataset.m === id)));
      $("h3", spec).textContent = m.name;
      $("p", spec).textContent = m.text;
      $("[data-k=size]", spec).textContent = m.size;
      $("[data-k=speed]", spec).textContent = m.speed;
      $("[data-k=ram]", spec).textContent = m.ram;
      $("[data-k=device]", spec).textContent = m.device;
      $$(".meter i", spec).forEach((el, i) => el.style.setProperty("--v", `${m.v[i]}%`));
    };
    $$("button", picker).forEach((b) => b.addEventListener("click", () => set(b.dataset.m)));
    picker.addEventListener("keydown", (e) => {
      const bs = $$("button", picker); const i = bs.findIndex((b) => b.getAttribute("aria-selected") === "true");
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); const n = bs[(i + 1) % bs.length]; n.focus(); set(n.dataset.m); }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); const n = bs[(i - 1 + bs.length) % bs.length]; n.focus(); set(n.dataset.m); }
    });
    set("3B");
  }

  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
