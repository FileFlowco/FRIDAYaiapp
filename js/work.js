/* FileFlow — Selected work: project switcher, tilt, SocialBot and OrganizerPY demos */
(() => {
  "use strict";

  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Project switcher ---------- */
  document.querySelectorAll("[data-wk]").forEach((wk) => {
    const tabs = [...wk.querySelectorAll(".wk-tab")];
    const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));
    const ROT = 8000;
    let cur = 0, timer = null, inView = false, userTook = false;

    const show = (i, focus) => {
      cur = (i + tabs.length) % tabs.length;
      tabs.forEach((t, k) => {
        const on = k === cur;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        panels[k].hidden = !on;
        panels[k].classList.toggle("is-on", on);
      });
      if (focus) tabs[cur].focus();
      if (innerWidth <= 900) tabs[cur].scrollIntoView({ block: "nearest", inline: "center", behavior: calm ? "auto" : "smooth" });
      panels[cur].dispatchEvent(new CustomEvent("wk-show"));
      schedule();
    };

    const schedule = () => {
      clearTimeout(timer);
      wk.classList.remove("auto");
      if (calm || userTook || !inView) return;
      void wk.offsetWidth;
      wk.classList.add("auto");
      timer = setTimeout(() => show(cur + 1), ROT);
    };

    wk.style.setProperty("--wk-rot", `${ROT}ms`);
    tabs.forEach((t, k) => t.addEventListener("click", () => { userTook = true; show(k); }));
    wk.querySelector(".wk-list").addEventListener("keydown", (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      userTook = true;
      show(cur + keys[e.key], true);
    });
    wk.addEventListener("pointerenter", () => { wk.classList.add("paused"); clearTimeout(timer); });
    wk.addEventListener("pointerleave", () => { wk.classList.remove("paused"); schedule(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([en]) => { inView = en.isIntersecting; schedule(); if (inView) panels[cur].dispatchEvent(new CustomEvent("wk-show")); }, { threshold: 0.35 }).observe(wk);
    }
    tabs.forEach((t, k) => (t.tabIndex = k === 0 ? 0 : -1));
  });

  /* Case rows on the Work page: start each demo when it scrolls into view */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) { en.target.dispatchEvent(new CustomEvent("wk-show")); io.unobserve(en.target); }
    }, { threshold: 0.45 });
    document.querySelectorAll(".case").forEach((c) => io.observe(c));
  }

  /* ---------- SocialBot illustration ---------- */
  document.querySelectorAll(".sb").forEach((sb) => {
    const panel = sb.closest(".wk-panel, .case");
    const log = sb.querySelector(".sb-log");
    const mods = Object.fromEntries([...sb.querySelectorAll("[data-m]")].map((m) => [m.dataset.m, m]));
    const lines = [
      ["sch", "<b>scheduler</b> 3 posts queued for tomorrow, 9:00 / 13:00 / 19:30"],
      ["ig", "<b>instagram</b> posted reel, caption + 12 hashtags"],
      ["eng", "<b>engagement</b> replied to 8 comments, liked 40 posts in niche"],
      ["tt", "<b>tiktok</b> uploaded video, cover frame set"],
      ["pin", "<b>pinterest</b> 5 pins created from today's content"],
      ["eng", "<b>engagement</b> DM sequence sent to 6 new followers"],
      ["rep", "<b>reports</b> daily summary sent to Telegram"]
    ];
    let i = 0, timer = null;
    const step = () => {
      const [m, text] = lines[i % lines.length];
      Object.values(mods).forEach((el) => el.classList.remove("on"));
      mods[m]?.classList.add("on");
      const li = document.createElement("li");
      li.innerHTML = text;
      log.append(li);
      while (log.children.length > 8) log.firstElementChild.remove();
      i++;
    };
    const run = () => {
      clearInterval(timer);
      if (calm) { for (let k = 0; k < lines.length; k++) step(); return; }
      if (!log.children.length) step();
      timer = setInterval(() => { if (panel && panel.hidden) { clearInterval(timer); return; } step(); }, 1400);
    };
    (panel || sb).addEventListener("wk-show", run);
    if (!panel || !panel.hidden) run();
  });

  /* ---------- OrganizerPY demo ---------- */
  document.querySelectorAll("[data-org]").forEach((org) => {
    const files = [...org.querySelectorAll(".f")];
    const dirs = Object.fromEntries([...org.querySelectorAll("[data-dir]")].map((d) => [d.dataset.dir, d]));
    const area = org.querySelector(".org-files");
    const btn = org.querySelector(".org-run");
    const panel = org.closest(".wk-panel, .case");
    let sorted = false, ran = false;

    // Scatter files in a messy pile
    const seeds = files.map((_, k) => ({ x: ((k * 37) % 100) / 100, y: ((k * 53) % 100) / 100, r: ((k * 29) % 13) - 6 }));
    const scatter = () => {
      const w = area.clientWidth, h = area.clientHeight;
      files.forEach((f, k) => {
        const s = seeds[k];
        const fx = s.x * Math.max(0, w - f.offsetWidth), fy = s.y * Math.max(0, h - f.offsetHeight);
        f.style.transform = `translate(${fx}px, ${fy}px) rotate(${s.r}deg)`;
        f.style.opacity = "1";
      });
      Object.values(dirs).forEach((d) => { d.classList.remove("hit"); d.dataset.count = "0 files"; });
      sorted = false;
      btn.textContent = "Run organize.py";
    };

    const sort = () => {
      const base = area.getBoundingClientRect();
      const counts = {};
      files.forEach((f, k) => {
        const d = dirs[f.dataset.to];
        const r = d.getBoundingClientRect();
        counts[f.dataset.to] = (counts[f.dataset.to] || 0) + 1;
        const n = counts[f.dataset.to] - 1;
        const x = r.left - base.left + 12 + n * 10;
        const y = r.top - base.top + r.height - 22 - f.offsetHeight * 0.6 + n * 2;
        setTimeout(() => {
          f.style.transform = `translate(${x}px, ${y}px) rotate(${(n % 2 ? 3 : -3)}deg) scale(.6)`;
          f.style.transformOrigin = "left top";
          f.style.opacity = "0";
          setTimeout(() => {
            d.classList.add("hit");
            const c = [...files].filter((g) => g.dataset.to === f.dataset.to).indexOf(f) + 1;
            d.dataset.count = `${c} file${c > 1 ? "s" : ""}`;
          }, calm ? 0 : 700);
        }, calm ? 0 : k * 140);
      });
      sorted = true;
      btn.textContent = "Reset folder";
    };

    btn.addEventListener("click", () => (sorted ? scatter() : sort()));
    addEventListener("resize", () => { if (!sorted) scatter(); });
    const autoRun = () => {
      scatter();
      if (!ran && !calm) { ran = true; setTimeout(() => { if (!sorted && !(panel && panel.hidden)) sort(); }, 900); }
    };
    (panel || org).addEventListener("wk-show", () => requestAnimationFrame(autoRun));
    if (!panel || !panel.hidden) requestAnimationFrame(scatter);
  });

  /* ---------- Work page filter ---------- */
  const bar = document.querySelector("[data-filter]");
  if (bar) {
    const cases = [...document.querySelectorAll(".case[data-tags]")];
    const btns = [...bar.querySelectorAll("button")];
    for (const b of btns) {
      const f = b.dataset.f;
      b.querySelector("span").textContent = f === "all" ? cases.length : cases.filter((c) => c.dataset.tags.split(" ").includes(f)).length;
    }
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      const f = b.dataset.f;
      cases.forEach((c) => {
        const show = f === "all" || c.dataset.tags.split(" ").includes(f);
        if (show) { c.hidden = false; requestAnimationFrame(() => c.classList.remove("out")); }
        else { c.classList.add("out"); setTimeout(() => { if (c.classList.contains("out")) c.hidden = true; }, 300); }
      });
    });
  }

  /* ---------- Live website previews: the real site in the frame (desktop); click opens it ---------- */
  const lives = [...document.querySelectorAll("[data-live]")];
  if (lives.length && matchMedia("(min-width: 900px)").matches && location.protocol !== "file:") {
    const fit = (box) => { const f = box.querySelector("iframe"); if (f) f.style.transform = `scale(${box.clientWidth / 1440})`; };
    const load = (box) => {
      if (box.dataset.loaded || !box.clientWidth) return;
      box.dataset.loaded = "1";
      const f = document.createElement("iframe");
      f.src = box.dataset.live;
      f.title = "Live preview of " + box.dataset.live;
      f.tabIndex = -1;
      f.setAttribute("aria-hidden", "true");
      f.setAttribute("referrerpolicy", "no-referrer");
      Object.assign(f.style, { position: "absolute", top: "0", left: "0", width: "1440px", height: "810px", border: "0", transformOrigin: "0 0", pointerEvents: "none" });
      f.addEventListener("load", () => box.classList.add("ready"));
      box.append(f); fit(box);
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) load(e.target); }), { rootMargin: "300px" });
    lives.forEach((b) => io.observe(b));
    new MutationObserver(() => lives.forEach((b) => { if (b.clientWidth) { load(b); fit(b); } }))
      .observe(document.body, { subtree: true, attributes: true, attributeFilter: ["hidden"] });
    addEventListener("resize", () => lives.forEach(fit));
  }
})();
