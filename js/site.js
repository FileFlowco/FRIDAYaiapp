/* FileFlow — page behavior and motion */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const LOCAL = location.protocol === "file:";
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: hide on scroll down, show on scroll up ---------- */
  const head = $(".site-head");
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    head?.classList.toggle("scrolled", y > 8);
    if (!document.body.classList.contains("menu-open")) head?.classList.toggle("hide", y > 160 && y > lastY + 4);
    if (y < lastY - 4 || y < 160) head?.classList.remove("hide");
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const menuBtn = $(".menu-btn");
  const panel = $("#menu-panel");
  const setMenu = (open) => {
    panel?.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    menuBtn?.setAttribute("aria-expanded", String(open));
    menuBtn?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
    if (open) head?.classList.remove("hide");
  };
  menuBtn?.addEventListener("click", () => setMenu(!panel.classList.contains("open")));
  panel?.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && panel?.classList.contains("open")) { setMenu(false); menuBtn.focus(); } });
  addEventListener("resize", () => { if (innerWidth > 880 && panel?.classList.contains("open")) setMenu(false); });

  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  $$("[data-ask]").forEach((b) => b.addEventListener("click", () => window.FileFlowChat?.ask(b.dataset.ask)));

  /* ---------- Careers duck ---------- */
  const duck = $("[data-duck]");
  if (duck) {
    const LOOP = 18000, REST_IN = 0.40 * LOOP, REST_OUT = 0.62 * LOOP;
    const bubble = $(".duck-bubble", duck);
    let timers = [];
    const talk = (text, ms = 1600) => { bubble.textContent = text; duck.classList.add("talk"); clearTimeout(talk.t); talk.t = setTimeout(() => duck.classList.remove("talk"), ms); };
    const cycle = () => {
      timers.forEach(clearTimeout);
      timers = [
        setTimeout(() => { duck.classList.add("rest"); talk("Phew.", 1400); }, REST_IN),
        setTimeout(() => talk("Hiring soon!", 2000), REST_IN + 2000),
        setTimeout(() => duck.classList.remove("rest"), REST_OUT)
      ];
    };
    if (!calm) {
      duck.classList.add("go");
      duck.addEventListener("animationstart", (e) => { if (e.target === duck) cycle(); });
      duck.addEventListener("animationiteration", (e) => { if (e.target === duck) cycle(); });
    }
    const quips = ["Quack.", "Almost there.", "Heavy box.", "Not now, I'm working.", "Quack quack.", "This is fine."];
    let q = 0;
    duck.addEventListener("click", () => {
      talk(quips[q++ % quips.length]);
      duck.classList.remove("hop"); void duck.offsetWidth; duck.classList.add("hop"); setTimeout(() => duck.classList.remove("hop"), 460);
    });
  }

  /* ---------- Home work index: small preview follows the cursor ---------- */
  const wiThumb = $("[data-wi-thumb]");
  if (wiThumb && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let x = 0, y = 0, raf = 0;
    const move = () => { raf = 0; wiThumb.style.left = `${x + 200}px`; wiThumb.style.top = `${y}px`; };
    $$("[data-work-index] a").forEach((a) => {
      a.addEventListener("pointerenter", () => { if (a.dataset.thumb) { wiThumb.src = a.dataset.thumb; wiThumb.classList.add("on"); } else wiThumb.classList.remove("on"); });
      a.addEventListener("pointerleave", () => wiThumb.classList.remove("on"));
      a.addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(move); });
    });
  }

  /* ---------- Home: problem picker ---------- */
  const needTabs = $$(".need-list button");
  if (needTabs.length) {
    // Phones: each answer opens right under its question. Desktop: answers live in the side stage.
    const stage = $(".need-stage"), phone = matchMedia("(max-width: 760px)");
    const place = () => needTabs.forEach((b) => { const p = $("#" + b.getAttribute("aria-controls")); if (phone.matches) b.after(p); else stage.append(p); });
    place(); phone.addEventListener?.("change", place);
    const pick = (b, focus) => {
      needTabs.forEach((x) => { const on = x === b; x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1; $("#" + x.getAttribute("aria-controls")).hidden = !on; });
      if (focus) b.focus();
      if (phone.matches && !focus) requestAnimationFrame(() => { const r = b.getBoundingClientRect(); if (r.top < 70) scrollBy({ top: r.top - 80, behavior: "smooth" }); });
    };
    needTabs.forEach((b, i) => {
      b.tabIndex = i === 0 ? 0 : -1;
      b.addEventListener("click", () => pick(b));
      b.addEventListener("keydown", (e) => {
        const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
        if (d) { e.preventDefault(); pick(needTabs[(i + d + needTabs.length) % needTabs.length], true); }
      });
    });
  }

  /* ---------- FAQ search ---------- */
  const faqBox = $("[data-faq]"), faqIn = $("[data-faq-search]");
  if (faqBox && faqIn) {
    const items = $$("details", faqBox).map((d) => ({ d, s: d.querySelector("summary"), text: d.textContent.toLowerCase(), label: d.querySelector("summary").textContent }));
    const empty = $(".faq-empty", faqBox);
    const esc = (t) => t.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
    faqIn.addEventListener("input", () => {
      const q = faqIn.value.trim().toLowerCase();
      let shown = 0;
      for (const it of items) {
        const hit = !q || q.split(/\s+/).every((w) => it.text.includes(w));
        it.d.hidden = !hit; if (hit) shown++;
        const k = q ? it.label.toLowerCase().indexOf(q) : -1;
        it.s.innerHTML = "<span>" + (k < 0 ? esc(it.label) : esc(it.label.slice(0, k)) + "<mark>" + esc(it.label.slice(k, k + q.length)) + "</mark>" + esc(it.label.slice(k + q.length))) + "</span>";
      }
      empty.hidden = shown > 0;
    });
    $("[data-ask-search]", faqBox)?.addEventListener("click", () => window.FileFlowChat?.ask(faqIn.value.trim() || "I have a question."));
  }

  /* ---------- Hero entrance ---------- */
  const h1 = $(".hero h1");
  if (h1 && !calm) {
    const words = h1.textContent.trim().split(/\s+/);
    h1.setAttribute("aria-label", h1.textContent.trim());
    h1.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true"><span style="transition-delay:${(i * 0.06).toFixed(2)}s">${esc(w)}</span></span>`).join(" ");
  }
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("is-in")));

  /* ---------- Scroll reveal ---------- */
  if (!calm && "IntersectionObserver" in window) {
    const groups = [
      [".section-head", false], [".rows", false], [".faq", false], [".offers", false],
      [".offers article", true], [".steps li", true], [".promises > div", true], [".products article", true],
      [".principles > div", true], [".menu-cat", false], [".story", false], [".feature", false],
      [".tiles .tile", true], [".reviews-head", false], [".ledger-scroll", false], [".plans-m", false], [".closing .wrap", false]
    ];
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) { en.target.classList.add("on"); io.unobserve(en.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    for (const [sel, stagger] of groups) {
      $$(sel).forEach((el) => {
        if (el.closest(".hero")) return;
        el.classList.add("rv");
        if (stagger) {
          const sibs = [...el.parentElement.children];
          el.style.setProperty("--d", `${Math.min(sibs.indexOf(el), 5) * 0.08}s`);
        }
        io.observe(el);
      });
    }
  }

  /* ---------- Hero demo conversation ---------- */
  const demo = $(".demo-chat");
  if (demo) {
    const msgs = $$(".m", demo);
    const toast = $(".demo-toast");
    if (calm) { msgs.forEach((m) => m.classList.add("show")); toast?.classList.add("show"); }
    else {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      (async function loop() {
        await wait(1200);
        for (;;) {
          for (const m of msgs) { m.classList.add("show"); await wait(m.classList.contains("in") ? 1100 : 1600); }
          toast?.classList.add("show");
          await wait(3600);
          msgs.forEach((m) => m.classList.remove("show")); toast?.classList.remove("show");
          await wait(900);
        }
      })();
    }
  }

  /* ---------- Process line: static, circle to circle ---------- */
  $$(".steps").forEach((ol) => { ol.classList.add("track"); ol.style.setProperty("--n", ol.children.length); });

  /* ---------- Count-up for proof numbers ---------- */
  if (!calm) {
    $$(".proof strong").forEach((el) => {
      const m = el.textContent.match(/^(\d+(?:\.\d+)?)(.*)$/);
      if (!m) return;
      const target = parseFloat(m[1]), suffix = m[2], dec = (m[1].split(".")[1] || "").length;
      if (target >= 1000) return;
      const start = performance.now() + 700, dur = 1400;
      el.textContent = (0).toFixed(dec) + suffix;
      const tick = (t) => {
        const p = Math.min(1, Math.max(0, (t - start) / dur));
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * e).toFixed(dec) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ---------- Turnstile (only when configured) ---------- */
  let configP;
  const config = () => (configP ||= LOCAL ? Promise.resolve({}) : fetch("/api/config").then((r) => r.json()).catch(() => ({})));
  let tsP;
  const turnstile = () =>
    (tsP ||= new Promise((resolve) => {
      if (window.turnstile) return resolve(window.turnstile);
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = () => resolve(window.turnstile);
      s.onerror = () => resolve(null);
      document.head.append(s);
    }));
  async function protect(form) {
    const slot = $("[data-turnstile]", form);
    if (!slot || LOCAL) return;
    const { turnstileSiteKey } = await config();
    if (!turnstileSiteKey) return;
    const ts = await turnstile();
    if (ts) form._tsId = ts.render(slot, { sitekey: turnstileSiteKey, appearance: "interaction-only", theme: "light" });
  }
  const tsToken = (form) => (form._tsId !== undefined && window.turnstile ? window.turnstile.getResponse(form._tsId) : "");
  const tsReset = (form) => form._tsId !== undefined && window.turnstile?.reset(form._tsId);

  async function post(endpoint, payload) {
    if (LOCAL) return { ok: false, data: { error: "Preview mode: forms send once the site is deployed." } };
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      return { ok: res.ok, data: await res.json().catch(() => ({})) };
    } catch {
      return { ok: false, data: { error: "No connection. Check your internet and try again." } };
    }
  }

  /* ---------- Quote wizard (contact page) ---------- */
  const wiz = $("#quote");
  if (wiz) {
    const started = Date.now();
    const steps = $$(".step", wiz);
    const total = steps.length - 1;
    const back = $(".wiz-back", wiz);
    const count = $(".wiz-count", wiz);
    const bar = $(".wiz-bar i", wiz);
    const status = $(".wiz-status", wiz);
    let i = 0;
    protect(wiz);

    let firstPaint = true;
    const show = (n, dir = 1) => {
      steps[i].classList.remove("active", "back");
      i = Math.max(0, Math.min(n, steps.length - 1));
      const s = steps[i];
      s.classList.toggle("back", dir < 0);
      s.classList.add("active");
      const done = s.dataset.step === "done";
      back.hidden = i === 0 || done;
      count.textContent = done ? "Sent" : `Step ${i + 1} of ${total}`;
      bar.style.width = `${done ? 100 : (i / total) * 100}%`;
      if (s.dataset.step === "message") renderChips();
      const focusEl = done ? s : s.querySelector("input:checked, textarea, input[type=text]") || s.querySelector("input");
      if (!firstPaint) setTimeout(() => focusEl?.focus({ preventScroll: true }), 60);
      firstPaint = false;
      if (wiz.getBoundingClientRect().top < 0) scrollTo({ top: scrollY + wiz.getBoundingClientRect().top - 100, behavior: calm ? "auto" : "smooth" });
    };

    // Number keys pick an option; the summary panel fills in as you go.
    $$(".step", wiz).forEach((st) => $$(".choice label", st).forEach((lab, k) => lab.setAttribute("data-key", k + 1)));
    addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) && document.activeElement.type !== "radio") return;
      const n = parseInt(e.key, 10);
      if (!n) return;
      const opts = $$(".choice input", steps[i]);
      if (opts[n - 1]) { e.preventDefault(); opts[n - 1].checked = true; opts[n - 1].dispatchEvent(new Event("change", { bubbles: true })); }
    });
    const sum = $("[data-qsum]");
    const fillSum = () => {
      if (!sum) return;
      const fd = new FormData(wiz);
      for (const row of $$("[data-k]", sum)) {
        let v = String(fd.get(row.dataset.k) || "").trim();
        if (row.dataset.k === "message" && v.length < 3) v = "";
        const dd = $("dd", row);
        const next = v || (row.dataset.k === "message" ? "Not written yet" : "Not chosen yet");
        if (dd.textContent !== next) { dd.textContent = next; row.classList.toggle("set", Boolean(v)); }
      }
    };
    wiz.addEventListener("change", fillSum);
    wiz.addEventListener("input", fillSum);

    const renderChips = () => {
      const fd = new FormData(wiz);
      $(".summary-chips", wiz).innerHTML = ["service", "budget", "timeline"].map((k) => fd.get(k)).filter(Boolean).map((v) => `<span>${esc(v)}</span>`).join("");
    };

    // Choice steps advance automatically once picked.
    $$(".choices input", wiz).forEach((inp) =>
      inp.addEventListener("change", () => setTimeout(() => show(i + 1), calm ? 0 : 280))
    );
    // Clicking an already-selected option also advances.
    $$(".choices label", wiz).forEach((lab) =>
      lab.addEventListener("click", () => { const inp = $(`#${lab.htmlFor}`); if (inp.checked) setTimeout(() => show(i + 1), 150); })
    );
    back.addEventListener("click", () => show(i - 1, -1));

    const msg = $("#w-msg");
    const counter = $("[data-count]", wiz);
    msg.addEventListener("input", () => { counter.textContent = msg.value.trim().length; setErr("message", ""); });

    const setErr = (name, text) => {
      const f = $(`[data-field="${name}"]`, wiz);
      if (!f) return;
      f.classList.toggle("invalid", Boolean(text));
      const e = $(".wiz-err", f);
      if (e) e.textContent = text;
    };

    $("[data-next]", wiz).addEventListener("click", () => {
      if (msg.value.trim().length < 30) { setErr("message", "A couple of sentences helps us give you an accurate quote."); msg.focus(); return; }
      show(i + 1);
    });
    msg.addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) $("[data-next]", wiz).click(); });

    // Prefill from links like contact.html?plan=growth or ?service=Website
    const params = new URLSearchParams(location.search);
    const planNames = { assistant: "Website AI assistant", starter: "Starter Agent", growth: "Growth", custom: "Custom", onepage: "One-page website", business: "Business website", gbp: "Google Business Profile + local SEO", care: "Website care plan", store: "Online store", app: "Web app or SaaS", mobile: "Mobile app" };
    const planService = { onepage: "Website", business: "Website", gbp: "Website", care: "Care plan or fix existing", store: "Online store", app: "Custom software", mobile: "Mobile app" };
    const plan = params.get("plan");
    const svc = planNames[plan] ? planService[plan] || "AI assistant or agent" : params.get("service");
    if (planNames[plan]) wiz.elements.plan.value = planNames[plan];
    const pre = svc && wiz.querySelector(`input[name="service"][value="${CSS.escape(svc)}"]`);
    if (pre) { pre.checked = true; i = 0; steps[0].classList.add("active"); show(1); }
    else show(0);
    fillSum();

    const stepOf = { service: 0, budget: 1, timeline: 2, message: 3 };

    wiz.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (steps[i].dataset.step !== "contact") return;
      ["name", "email", "phone"].forEach((n) => setErr(n, ""));
      status.textContent = "";
      const fd = new FormData(wiz);
      let bad = false;
      if ((fd.get("name") || "").trim().length < 2) { setErr("name", "Enter your name."); bad = true; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((fd.get("email") || "").trim())) { setErr("email", "Enter a valid email address."); bad = true; }
      if (bad) { wiz.querySelector(".invalid input")?.focus(); return; }

      const btn = $("button[type=submit]", wiz);
      btn.disabled = true;
      const label = btn.textContent;
      btn.textContent = "Sending…";
      const { ok, data } = await post("/api/contact", { ...Object.fromEntries(fd.entries()), elapsed: Date.now() - started, turnstile: tsToken(wiz) });
      btn.disabled = false;
      btn.textContent = label;

      if (ok) {
        const first = (fd.get("name") || "").trim().split(" ")[0];
        $("[data-first]", wiz).textContent = first ? `, ${first}` : "";
        show(steps.length - 1);
        return;
      }
      const fields = data.fields || {};
      const earlier = Object.keys(fields).map((k) => stepOf[k]).filter((n) => n !== undefined);
      for (const [k, v] of Object.entries(fields)) setErr(k, v);
      if (earlier.length) { show(Math.min(...earlier), -1); return; }
      status.textContent = data.error || "Something went wrong. Try again.";
      tsReset(wiz);
    });
  }

  /* ---------- Contact form ---------- */
  /* ---------- Contact: availability, copy buttons, topic hints ---------- */
  const avail = $("[data-avail]");
  if (avail) {
    try {
      const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", weekday: "short", hour: "numeric", hourCycle: "h23" }).formatToParts(new Date()).map((p) => [p.type, p.value]));
      const h = parseInt(parts.hour, 10), wd = parts.weekday;
      const weekday = !["Sat", "Sun"].includes(wd);
      const open = weekday && h >= 9 && h < 18;
      avail.classList.toggle("on", open);
      $("[data-avail-text]", avail).textContent = open ? "Our team is in. Expect a reply today." : weekday && h < 9 ? "Back at 9 AM Pacific. We'll reply today." : wd === "Fri" || wd === "Sat" || (wd === "Sun" && h < 24) ? "Back Monday at 9 AM Pacific." : "Back tomorrow at 9 AM Pacific.";
    } catch { /* keep default text */ }
  }
  $$("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); } catch { return; }
    b.classList.add("done"); setTimeout(() => b.classList.remove("done"), 1400);
  }));
  const topicHints = { "General question": "How can we help?", "Existing project or support": "Which project is it, and what's happening?", "Partnership": "Tell us about you and the partnership you have in mind.", "Press or media": "Your publication, your deadline and what you're working on.", "Other": "How can we help?" };
  $("#c-topic")?.addEventListener("change", (e) => { const m = $("#c-msg"); if (m) m.placeholder = topicHints[e.target.value] || "How can we help?"; e.target.closest(".field")?.classList.remove("invalid"); });
  $$('input[name="topic"]').forEach((r) => r.addEventListener("change", () => { const m = $("#c-msg"); if (m) m.placeholder = topicHints[r.value] || "How can we help?"; const f = r.closest(".field"); f?.classList.remove("invalid"); }));

  const cform = $("#contact-form");
  if (cform) {
    const started = Date.now();
    const status = $(".form-status", cform);
    protect(cform);
    cform.addEventListener("submit", async (e) => {
      e.preventDefault();
      $$(".field", cform).forEach((f) => { f.classList.remove("invalid"); const er = $(".err", f); if (er) er.textContent = ""; });
      status.textContent = ""; status.className = "form-status";
      const fd = new FormData(cform);
      const btn = $("button[type=submit]", cform);
      btn.disabled = true;
      const label = btn.textContent;
      btn.textContent = "Sending…";
      const { ok, data } = await post("/api/contact", { ...Object.fromEntries(fd.entries()), elapsed: Date.now() - started, turnstile: tsToken(cform) });
      btn.disabled = false;
      btn.textContent = label;
      if (ok) {
        cform.hidden = true;
        const done = $("#contact-done");
        done.hidden = false;
        done.focus();
        return;
      }
      status.textContent = data.error || "Something went wrong. Try again.";
      status.classList.add("bad");
      for (const [name, msg] of Object.entries(data.fields || {})) {
        const field = cform.querySelector(`[name="${name}"]`)?.closest(".field");
        if (!field) continue;
        field.classList.add("invalid");
        const er = $(".err", field);
        if (er) er.textContent = msg;
      }
      cform.querySelector(".invalid input, .invalid select, .invalid textarea")?.focus();
      tsReset(cform);
    });
  }

  /* ---------- Feedback dialog ---------- */
  const dlg = $("#feedback");
  if (dlg) {
    $$("[data-open-feedback]").forEach((b) => b.addEventListener("click", () => dlg.showModal()));
    $$("[data-close]", dlg).forEach((b) => b.addEventListener("click", () => dlg.close()));
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

    const form = $("form", dlg);
    const status = $(".form-status", form);
    const stars = $$(".rating label", form);
    const paint = (n) => stars.forEach((l, k) => l.classList.toggle("on", k < n));
    $$(".rating input", form).forEach((inp) => inp.addEventListener("change", () => paint(+inp.value)));
    stars.forEach((l, k) => {
      l.addEventListener("mouseenter", () => paint(k + 1));
      l.addEventListener("mouseleave", () => paint(+(form.elements.rating.value || 0)));
    });
    const started = Date.now();
    let armed = false;
    dlg.addEventListener("toggle", () => { if (dlg.open && !armed) { armed = true; protect(form); } });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      $$(".field", form).forEach((f) => { f.classList.remove("invalid"); const er = $(".err", f); if (er) er.textContent = ""; });
      status.textContent = ""; status.className = "form-status";
      const fd = new FormData(form);
      const btn = $("button[type=submit]", form);
      btn.disabled = true;
      const { ok, data } = await post("/api/feedback", { ...Object.fromEntries(fd.entries()), publish: fd.get("publish") === "on", elapsed: Date.now() - started, turnstile: tsToken(form) });
      btn.disabled = false;
      if (ok) { form.hidden = true; $("#feedback-done", dlg).hidden = false; return; }
      status.textContent = data.error || "Something went wrong. Try again.";
      status.classList.add("bad");
      for (const [name, msg] of Object.entries(data.fields || {})) {
        const field = form.querySelector(`[name="${name}"]`)?.closest(".field");
        if (!field) continue;
        field.classList.add("invalid");
        const er = $(".err", field);
        if (er) er.textContent = msg;
      }
      tsReset(form);
    });
  }

  /* ---------- Client reviews (scrolling marquee) ---------- */
  const voices = $("#voices");
  if (voices) {
    const track = $("#review-track");
    let items = [];
    try { items = JSON.parse($("#testimonials-data")?.textContent || "[]"); } catch { items = []; }
    if (track && items.length) {
      // Plain, even list: the clients' own words, no hero quote
      const who = (t) => `<div class="rv-who"><span class="av" aria-hidden="true">${esc(t.name.trim()[0] || "")}</span><div><strong>${esc(t.name)}</strong><span>${esc(t.project)} client</span></div></div>`;
      track.innerHTML = items.map((t) => `<figure class="rv-card"><blockquote>${esc(t.quote)}</blockquote>${who(t)}</figure>`).join("");
    }

    if (!LOCAL) fetch("/api/reviews")
      .then((r) => r.json())
      .then((g) => {
        if (!g.configured) return;
        const score = $("#google-score");
        if (g.rating && g.count) {
          const num = $(".score-num"); if (num) num.textContent = g.rating.toFixed(1);
          score.innerHTML = `${g.rating.toFixed(1)} ★ on Google · <a class="link" href="${esc(g.url)}" target="_blank" rel="noopener">${g.count} review${g.count === 1 ? "" : "s"}</a>`;
          score.hidden = false;
        }
        $$("[data-google-review]").forEach((a) => (a.href = g.reviewUrl));
        const wrap = $("#google-reviews");
        if (g.reviews?.length) {
          wrap.innerHTML = g.reviews.slice(0, 6)
            .map((r) => `<article><span class="stars" aria-label="${r.rating} out of 5">${"★".repeat(r.rating)}</span><p>${esc(r.text)}</p><div class="small"><strong>${esc(r.author)}</strong> on Google${r.when ? `, ${esc(r.when)}` : ""}</div></article>`)
            .join("");
          wrap.hidden = false;
        }
      })
      .catch(() => {});
  }

  /* ---------- Pricing: stacked version of the ledger for small screens ---------- */
  const ledger = $(".ledger");
  if (ledger) {
    const heads = $$("thead th", ledger).slice(1);
    const rows = $$("tbody tr", ledger);
    const ctas = $$("tfoot td", ledger).slice(1);
    const wrap = document.createElement("div");
    wrap.className = "plans-m";
    heads.forEach((th, k) => {
      const card = document.createElement("article");
      card.className = "plan-m" + (th.classList.contains("pick") ? " pick" : "");
      const dl = rows.map((tr) => `<dt>${tr.cells[0].innerHTML}</dt><dd>${tr.cells[k + 1].innerHTML}</dd>`).join("");
      card.innerHTML = `${th.innerHTML}<dl>${dl}</dl>${ctas[k]?.innerHTML || ""}`;
      wrap.append(card);
    });
    $(".ledger-scroll").after(wrap);
  }
})();

/* Theme toggle (light / dark) */
(() => {
  const root = document.documentElement, KEY = "ff-theme";
  const isDark = () => root.dataset.theme === "dark";
  function setTheme(dark) {
    if (dark) root.dataset.theme = "dark"; else delete root.dataset.theme;
    try { localStorage.setItem(KEY, dark ? "dark" : "light"); } catch { /* storage blocked */ }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? "#0a0b0d" : "#e8eaed";
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
      b.setAttribute("aria-pressed", String(dark));
      b.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    });
    document.dispatchEvent(new CustomEvent("ff-theme"));
  }
  const init = () => {
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => b.addEventListener("click", () => setTheme(!isDark())));
    setTheme(isDark());
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
