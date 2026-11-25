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
      [/code|python|javascript|bug/i, "Paste the code and the error and I'll walk through the fix step by step, right here on your phone."]
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
