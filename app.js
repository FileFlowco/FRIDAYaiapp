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

  /* Offline demo: chat keeps answering with airplane mode on */
  const demo = $("[data-demo]");
  if (demo) {
    const log = $(".log", demo);
    const screen = $(".screen", demo);
    const toggle = $("[data-airplane]");
    const note = $(".demo-note");
    const speed = $(".speed", demo);
    const face = $(".chat-face");
    const script = [
      ["Draft a quick text telling my landlord the rent will be two days late.", "Hi Mark, just a heads-up that this month's rent will be two days late. It'll be in your account by Friday. Thanks for understanding."],
      ["Explain what a 401(k) is in one sentence.", "A 401(k) is a retirement savings account from your employer where money comes out of your paycheck before taxes and grows until you retire."],
      ["Give me 3 dinner ideas with chicken and rice.", "1. Chicken fried rice with egg and scallions. 2. Lemon garlic chicken over rice. 3. One-pan chicken, rice and black beans with salsa."],
      ["Fix this: their going to the store tomorow", "They're going to the store tomorrow."]
    ];
    let k = 0, busy = false, started = false;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const keep = () => { while (log.children.length > 4) log.firstElementChild.remove(); };

    async function run() {
      if (busy) return; busy = true;
      const [q, a] = script[k++ % script.length];
      const me = document.createElement("div"); me.className = "msg me"; me.textContent = q; log.append(me); keep();
      await wait(calm ? 100 : 700);
      const ai = document.createElement("div"); ai.className = "msg ai"; ai.innerHTML = '<span class="txt"></span><span class="caret"></span>'; log.append(ai); keep();
      const txt = $(".txt", ai);
      const words = a.split(" ");
      const t0 = performance.now();
      for (let i = 0; i < words.length; i++) {
        txt.textContent += (i ? " " : "") + words[i];
        if (speed) speed.textContent = `${Math.round(((i + 1) * 1.3) / ((performance.now() - t0) / 1000 || 1))} tok/s · on-device`;
        await wait(calm ? 0 : 45 + Math.random() * 40);
      }
      $(".caret", ai)?.remove();
      busy = false;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) { started = true; run(); setInterval(() => { if (document.visibilityState === "visible") run(); }, 6500); }
    }, { threshold: 0.4 });
    io.observe(demo);

    toggle?.addEventListener("click", () => {
      const on = toggle.getAttribute("aria-pressed") !== "true";
      toggle.setAttribute("aria-pressed", String(on));
      screen.classList.toggle("airplane", on);
      if (note) note.textContent = on ? "Airplane mode is on. FRIDAY keeps answering." : "";
      run();
    });
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
