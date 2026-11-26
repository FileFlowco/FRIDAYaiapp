/* FileFlow assistant: one conversation, rendered in the hero (home) and in a floating panel (all pages). */
(() => {
  const ROOT = (document.currentScript && new URL("..", document.currentScript.src).href) || "";
  "use strict";

  const STORE = "ff-chat-v2";
  const GREETING = "Hi, I'm FileFlow's assistant. Ask about services, pricing or timelines. If you have a project, I can pass it to our team.";
  const SUGGESTIONS = ["What do you charge for a website?", "Can you add an AI chat to my site?", "How fast can you start?", "I have a project"];
  const LOCAL = location.protocol === "file:";

  const load = () => {
    try { return JSON.parse(sessionStorage.getItem(STORE)) || null; } catch { return null; }
  };
  const saved = load();
  const state = {
    messages: saved?.messages || [],
    mode: saved?.mode === "ai" ? "ai" : saved?.mode ? "script" : "ai",  // "ai" or "script" (built-in answers)
    flow: saved?.flow || null,        // details flow: { step, name, email, question }
    ctx: saved?.ctx || {},
    busy: false,
    views: []
  };
  const save = () => {
    try { sessionStorage.setItem(STORE, JSON.stringify({ messages: state.messages.slice(-40), mode: state.mode, flow: state.flow, ctx: state.ctx })); } catch { /* private mode */ }
  };

  const icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function template({ closable }) {
    const el = document.createElement("section");
    el.className = "assistant";
    el.setAttribute("aria-label", "Chat with FileFlow");
    el.innerHTML = `
      <div class="assistant-head">
        <img src="${ROOT}assets/mark-white.png" alt="" width="34" height="34">
        <div>
          <div class="assistant-title">FileFlow assistant</div>
          <div class="assistant-status">Online now</div>
        </div>
        ${closable ? '<button class="assistant-close" type="button" aria-label="Close chat">&times;</button>' : ""}
      </div>
      <div class="assistant-log" role="log" aria-live="polite"></div>
      <div class="suggest"></div>
      <form class="assistant-form">
        <label class="sr" for="">Your message</label>
        <textarea rows="1" maxlength="1500" placeholder="Ask a question" autocomplete="off"></textarea>
        <button type="submit" aria-label="Send" disabled>${icon}</button>
      </form>
      <div class="assistant-foot">Prices are always confirmed in writing before any work.</div>`;
    const id = `chat-in-${state.views.length}`;
    el.querySelector("textarea").id = id;
    el.querySelector("label").setAttribute("for", id);
    return el;
  }

  function bubble(m, isLast) {
    const d = document.createElement("div");
    if (m.role === "sent") { d.className = "msg-sent"; d.textContent = "✓ Sent to the FileFlow team"; return d; }
    if (m.role === "note") { d.className = "msg-note"; d.textContent = m.content; return d; }
    if (m.role === "menu") {
      d.className = "msg-menu";
      for (const o of m.options) {
        const b = document.createElement("button");
        b.type = "button"; b.textContent = o.label; b.disabled = !isLast;
        b.addEventListener("click", () => send(o.label));
        d.append(b);
      }
      return d;
    }
    d.className = `msg ${m.role === "user" ? "msg-user" : "msg-bot"}`;
    d.textContent = m.content;
    if (m.link) {
      const a = document.createElement("a");
      a.href = m.link.href; a.textContent = m.link.label; a.className = "msg-link";
      d.append(document.createElement("br"), a);
    }
    return d;
  }

  const PLACEHOLDER = { name: "Your name", email: "Your email", message: "Your question" };

  function render() {
    for (const v of state.views) {
      const log = v.el.querySelector(".assistant-log");
      log.replaceChildren(bubble({ role: "assistant", content: GREETING }), ...state.messages.map((m, k) => bubble(m, k === state.messages.length - 1)));
      if (state.busy) {
        const t = document.createElement("div");
        t.className = "msg msg-bot typing";
        t.innerHTML = "<i></i><i></i><i></i>";
        t.setAttribute("aria-label", "Assistant is typing");
        log.append(t);
      }
      log.scrollTop = log.scrollHeight;

      const sug = v.el.querySelector(".suggest");
      sug.hidden = state.messages.some((m) => m.role === "user");
      const ta = v.el.querySelector("textarea");
      ta.placeholder = (state.flow && PLACEHOLDER[state.flow.step]) || "Ask a question";
      ta.setAttribute("inputmode", state.flow?.step === "email" ? "email" : "text");
      v.el.querySelector("button[type=submit]").disabled = state.busy || !ta.value.trim();
    }
  }

  const push = (...msgs) => { state.messages.push(...msgs); save(); render(); };
  const bot = (content, extra = {}) => ({ role: "assistant", content, ...extra });

  /* ---------- Built-in answers (no network needed) ---------- */
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  async function say(r) {
    state.busy = true; render();
    await wait(Math.min(1500, 450 + r.text.length * 6));
    state.busy = false;
    const out = [bot(r.text, r.link ? { link: r.link } : {})];
    if (r.chips?.length) out.push({ role: "menu", options: r.chips.map((label) => ({ label })) });
    push(...out);
  }

  function startFlow(r) {
    state.flow = { step: r.email ? "name" : "name", name: "", email: r.email || "", question: r.question || "" };
  }

  async function scripted(text) {
    state.messages.push({ role: "user", content: text });
    render();
    if (state.flow) return flowInput(text);
    const r = window.FFBrain ? window.FFBrain.reply(text, state.ctx) : { text: "Our team can help with that. Email fileflowinc@gmail.com or call +1 (650) 254-6117." };
    if (r.lead) startFlow(r);
    await say(r);
  }

  async function flowInput(text) {
    const f = state.flow;
    const t = text.trim();
    if (/^(cancel|never ?mind|stop|forget it|no thanks)\b/i.test(t)) {
      state.flow = null;
      return say({ text: "No problem. Anything else I can help with?", chips: ["What do you build?", "How much does it cost?"] });
    }
    if (f.step === "name") {
      const looksLikeQuestion = /\?$/.test(t) || t.split(/\s+/).length > 6;
      if (looksLikeQuestion && window.FFBrain) {
        const r = window.FFBrain.reply(t, state.ctx);
        return say({ text: r.text + " And so the team knows who to reply to, what's your name?", link: r.link });
      }
      f.name = t.replace(/^(my name is|my name's|i'?m|i am|it'?s|this is|name:?)\s+/i, "").replace(/[.!]+$/, "").slice(0, 80);
      const first = f.name.split(" ")[0];
      const nice = first.charAt(0).toUpperCase() + first.slice(1);
      if (f.email) { f.step = "message"; return say({ text: `Thanks, ${nice}. In a sentence or two, what would you like to build or ask? The more detail, the better the reply.` }); }
      f.step = "email";
      return say({ text: `Nice to meet you, ${nice}. What's the best email for the team to reply to?` });
    }
    if (f.step === "email") {
      const m = t.match(/[^\s@]+@[^\s@]+\.[^\s@]{2,}/);
      if (!m || !EMAIL_RE.test(m[0])) return say({ text: "That doesn't look like an email address. Could you check it? For example: name@company.com" });
      f.email = m[0];
      f.step = "message";
      return say({ text: f.question ? `Got it. I'll send the team your question: "${f.question.slice(0, 140)}". Anything to add? If not, just say "send".` : "Got it. In a sentence or two, what would you like to build or ask? The more detail, the better the reply." });
    }
    if (f.step === "message") {
      if (!/^(send|no|nope|that'?s it|that'?s all|nothing)\b/i.test(t) || !f.question) f.question = f.question ? `${f.question}\n\n${t}` : t;
      return submitFlow();
    }
  }

  async function submitFlow() {
    const f = state.flow;
    const recent = state.messages.filter((m) => m.role === "user").slice(-8).map((m) => `- ${m.content}`).join("\n");
    const topic = state.ctx.topic ? `Interested in: ${state.ctx.topic}\n\n` : "";
    const message = `${f.question}\n\n${topic}Conversation:\n${recent}`.slice(0, 4000);
    if (LOCAL) { state.flow = null; return push({ role: "note", content: "Preview mode: messages send once the site is live." }); }
    state.busy = true; render();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ guided: { name: f.name, email: f.email, message } })
      });
      const data = await res.json().catch(() => ({}));
      state.busy = false;
      if (res.ok) {
        const first = f.name.split(" ")[0];
        state.flow = null;
        push({ role: "sent" }, bot(`All set${first ? ", " + first.charAt(0).toUpperCase() + first.slice(1) : ""}. The team will reply to ${f.email} within one business day. Anything else in the meantime?`));
      } else if (data.field === "email") {
        f.step = "email";
        push(bot(data.error || "That email can't receive messages. Could you check it?"));
      } else {
        state.flow = null;
        push(bot("Something went wrong sending that. Please email fileflowinc@gmail.com or call +1 (650) 254-6117 and we'll reply within one business day."));
      }
    } catch {
      state.busy = false;
      push({ role: "note", content: "No connection. Check your internet and try again." });
    }
  }

  /* ---------- AI mode ---------- */
  async function send(text) {
    text = text.trim();
    if (!text || state.busy) return;
    if (state.mode === "script" || LOCAL || state.flow) { state.mode = "script"; return scripted(text); }

    state.messages.push({ role: "user", content: text });
    state.busy = true;
    render();

    const history = state.messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map(({ role, content }) => ({ role, content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history })
      });
      const data = await res.json().catch(() => ({}));
      state.busy = false;
      if (res.ok) {
        push(bot(data.reply), ...(data.sent ? [{ role: "sent" }] : []));
      } else if (res.status === 429) {
        push({ role: "note", content: data.error || "Too many messages. Wait a minute and try again." });
      } else {
        state.mode = "script";
        state.messages.pop();
        return scripted(text);
      }
    } catch {
      state.busy = false;
      state.mode = "script";
      state.messages.pop();
      return scripted(text);
    }
  }

  function mount(container, opts = {}) {
    const el = template(opts);
    container.append(el);
    const view = { el };
    state.views.push(view);

    const sug = el.querySelector(".suggest");
    for (const s of SUGGESTIONS) {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = s;
      b.addEventListener("click", () => send(s));
      sug.append(b);
    }

    const ta = el.querySelector("textarea");
    const form = el.querySelector("form");
    const grow = () => { ta.style.height = "auto"; ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`; };
    const sendBtn = el.querySelector("button[type=submit]");
    ta.addEventListener("input", () => { grow(); sendBtn.disabled = state.busy || !ta.value.trim(); });
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); }
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = ta.value;
      ta.value = ""; grow();
      send(v);
    });
    return view;
  }

  // Floating launcher + panel
  function floating() {
    const fab = document.createElement("button");
    fab.type = "button";
    fab.className = "chat-fab";
    fab.setAttribute("aria-haspopup", "dialog");
    fab.innerHTML = '<img src="' + ROOT + 'assets/mark-white.png" alt="" width="40" height="40"><span>' + (document.documentElement.lang === 'pt' ? 'Fale conosco' : document.documentElement.lang === 'es' ? 'Escríbenos' : 'Ask FileFlow') + '</span>';
    fab.setAttribute("aria-label", "Open chat with FileFlow"); fab.title = "Drag to move";

    const pop = document.createElement("div");
    pop.className = "chat-pop";
    pop.hidden = true;
    pop.setAttribute("role", "dialog");
    pop.setAttribute("aria-label", "Chat with FileFlow");
    document.body.append(fab, pop);
    const view = mount(pop, { closable: true });

    const open = () => { pop.hidden = false; fab.hidden = true; render(); view.el.querySelector("textarea").focus(); };
    const close = () => { pop.hidden = true; fab.hidden = false; fab.focus(); };
    // Drag the launcher anywhere; a short tap still opens the chat.
    const POS = "ff-fab-pos";
    let drag = null, moved = false;
    const place = (x, y) => {
      const w = fab.offsetWidth, h = fab.offsetHeight;
      x = Math.max(8, Math.min(innerWidth - w - 8, x));
      y = Math.max(8, Math.min(innerHeight - h - 8, y));
      fab.style.left = x + "px"; fab.style.top = y + "px"; fab.classList.add("placed");
      pop.classList.toggle("at-left", x + w / 2 < innerWidth / 2);
      pop.classList.toggle("at-top", y + h / 2 < innerHeight / 2);
      return { x: x / innerWidth, y: y / innerHeight };
    };
    try { const p = JSON.parse(localStorage.getItem(POS)); if (p) requestAnimationFrame(() => place(p.x * innerWidth, p.y * innerHeight)); } catch { /* none saved */ }
    addEventListener("resize", () => { if (fab.classList.contains("placed")) { const r = fab.getBoundingClientRect(); place(r.left, r.top); } });
    fab.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      const r = fab.getBoundingClientRect();
      drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, sx: e.clientX, sy: e.clientY }; moved = false;
      fab.setPointerCapture(e.pointerId);
    });
    fab.addEventListener("pointermove", (e) => {
      if (!drag) return;
      if (!moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6) return;
      moved = true; fab.classList.add("dragging");
      const p = place(e.clientX - drag.dx, e.clientY - drag.dy);
      drag.pos = p;
    });
    const end = () => {
      if (!drag) return;
      fab.classList.remove("dragging");
      if (moved && drag.pos) { try { localStorage.setItem(POS, JSON.stringify(drag.pos)); } catch { /* storage blocked */ } queue(); }
      drag = null;
    };
    fab.addEventListener("pointerup", end);
    fab.addEventListener("pointercancel", end);
    fab.addEventListener("click", (e) => { if (moved) { e.preventDefault(); moved = false; return; } open(); });
    view.el.querySelector(".assistant-close").addEventListener("click", close);
    pop.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

    // Flip the launcher to white while it sits over a dark section, so it never disappears.
    const icon = fab.querySelector("img");
    let ticking = false;
    const checkDark = () => {
      ticking = false;
      const r = fab.getBoundingClientRect();
      const y = r.top + r.height / 2;
      const dark = document.documentElement.dataset.theme !== "dark" && [...document.querySelectorAll(".band-ink, .site-foot")].some((el) => {
        const b = el.getBoundingClientRect();
        return y >= b.top && y <= b.bottom;
      });
      if (fab.classList.contains("on-dark") !== dark) {
        fab.classList.toggle("on-dark", dark);
        icon.src = ROOT + (dark ? "assets/mark-ink.png" : "assets/mark-white.png");
      }
    };
    const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(checkDark); } };
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    document.addEventListener("ff-theme", queue);
    checkDark();

    // Hide the launcher while the hero assistant is on screen.
    const hero = document.querySelector("[data-chat-inline]");
    if (hero && "IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => fab.classList.toggle("tucked", entry.isIntersecting), { threshold: 0.25 }).observe(hero);
    }

    window.FileFlowChat = {
      ask(text) {
        const inline = document.querySelector("[data-chat-inline]");
        const r = inline?.getBoundingClientRect();
        if (r && r.top >= 0 && r.bottom <= innerHeight) { send(text); return; }
        open(); send(text);
      }
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    const inline = document.querySelector("[data-chat-inline]");
    if (inline) mount(inline);
    floating();
    render();
    if (LOCAL) state.mode = "script";
    else fetch("/api/config").then((r) => r.json()).then((c) => { if (c.chat === false) { state.mode = "script"; save(); } }).catch(() => { state.mode = "script"; });
  });
})();
