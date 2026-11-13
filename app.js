(function () {
  "use strict";

  const STORE = {
    progress: "ppf.progress.v1",
    custom: "ppf.custom.v1",
    selection: "ppf.selection.v1",
  };
  // Leitner boxes: days until a card is due again.
  const INTERVALS = [0, 1, 2, 4, 8, 16, 32];

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const load = (k, d) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; }
  };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  let progress = load(STORE.progress, {});
  let custom = load(STORE.custom, { decks: [], cards: {} });

  // ---------- data ----------
  function hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  function allDecks() {
    const decks = [
      ...window.BUILTIN_DECKS.map((d) => ({ ...d, custom: false })),
      ...custom.decks.map((d) => ({ ...d, cards: [], custom: true })),
    ];
    return decks.map((d) => {
      const cards = [...d.cards, ...(custom.cards[d.id] || [])].map((c) => ({
        ...c,
        deckId: d.id,
        id: d.id + ":" + hash(c.q),
      }));
      return { ...d, cards };
    });
  }

  function isDue(card) {
    const p = progress[card.id];
    if (!p) return true;
    return Date.now() >= p.last + INTERVALS[p.box] * 86400000;
  }

  function mastery(deck) {
    if (!deck.cards.length) return 0;
    const pts = deck.cards.reduce((s, c) => s + Math.min((progress[c.id]?.box || 0), 4), 0);
    return Math.round((pts / (deck.cards.length * 4)) * 100);
  }

  // ---------- rendering helpers ----------
  function esc(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function inline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }

  // Minimal markdown: ``` or ~~~ blocks, - bullets, paragraphs, `code`, **bold**.
  function md(text) {
    const out = [];
    const parts = text.split(/(?:```|~~~)(?:\w+)?\n?/);
    parts.forEach((part, i) => {
      if (i % 2 === 1) {
        out.push("<pre><code>" + esc(part.replace(/\n$/, "")) + "</code></pre>");
        return;
      }
      let list = null;
      part.split("\n").forEach((line) => {
        const m = line.match(/^\s*[-*]\s+(.*)/);
        if (m) {
          if (!list) list = [];
          list.push("<li>" + inline(m[1]) + "</li>");
          return;
        }
        if (list) { out.push("<ul>" + list.join("") + "</ul>"); list = null; }
        if (line.trim()) out.push("<p>" + inline(line) + "</p>");
      });
      if (list) out.push("<ul>" + list.join("") + "</ul>");
    });
    return out.join("");
  }

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.add("hidden"), 2200);
  }

  // ---------- tabs ----------
  $$(".tab").forEach((btn) =>
    btn.addEventListener("click", () => {
      $$(".tab").forEach((b) => b.classList.toggle("active", b === btn));
      $$(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + btn.dataset.view));
      if (btn.dataset.view === "browse") renderBrowse();
      if (btn.dataset.view === "manage") renderManage();
    })
  );

  // ---------- study ----------
  let selection = new Set(load(STORE.selection, null) || window.BUILTIN_DECKS.map((d) => d.id));

  function renderChips() {
    const decks = allDecks();
    $("#deck-chips").innerHTML = decks
      .map((d) => {
        const due = d.cards.filter(isDue).length;
        const on = selection.has(d.id);
        return `<button class="chip ${on ? "on" : ""}" data-id="${esc(d.id)}" title="${esc(d.description || "")}">
          <span class="chip-title">${esc(d.title)}</span>
          <span class="chip-meta">${d.cards.length} card${d.cards.length === 1 ? "" : "s"} · ${due} due · ${mastery(d)}%</span>
          <span class="meter"><span style="width:${mastery(d)}%"></span></span>
        </button>`;
      })
      .join("");
    $$(".chip").forEach((c) =>
      c.addEventListener("click", () => {
        const id = c.dataset.id;
        selection.has(id) ? selection.delete(id) : selection.add(id);
        save(STORE.selection, [...selection]);
        renderChips();
      })
    );
  }

  $("#select-all").onclick = () => {
    selection = new Set(allDecks().map((d) => d.id));
    save(STORE.selection, [...selection]);
    renderChips();
  };
  $("#select-none").onclick = () => {
    selection = new Set();
    save(STORE.selection, []);
    renderChips();
  };

  let queue = [];
  let idx = 0;
  let revealed = false;
  let stats = { again: 0, hard: 0, good: 0 };

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startSession() {
    const decks = allDecks().filter((d) => selection.has(d.id));
    let cards = decks.flatMap((d) => d.cards.map((c) => ({ ...c, deckTitle: d.title })));
    if (!cards.length) return toast("Select at least one theme with cards");
    if ($("#opt-due").checked) {
      const due = cards.filter(isDue);
      if (!due.length) return toast("Nothing due 🎉 — uncheck “Due cards only” to review anyway");
      cards = due;
    }
    if ($("#opt-shuffle").checked) shuffle(cards);
    // Weakest cards first, shuffled within the same box.
    cards.sort((a, b) => (progress[a.id]?.box || 0) - (progress[b.id]?.box || 0));
    queue = cards;
    idx = 0;
    stats = { again: 0, hard: 0, good: 0 };
    $("#done").classList.add("hidden");
    $("#setup").classList.add("hidden");
    $("#session").classList.remove("hidden");
    showCard();
  }

  function showCard() {
    const c = queue[idx];
    revealed = false;
    $("#card-q").innerHTML = md(c.q);
    $("#card-a").innerHTML = md(c.a);
    $(".front .hint").classList.remove("hidden");
    $(".back").classList.add("hidden");
    $("#grade").classList.add("hidden");
    $("#reveal").classList.remove("hidden");
    $("#session-count").textContent = `Card ${idx + 1} / ${queue.length}`;
    $("#session-deck").textContent = c.deckTitle;
    $("#progress-bar").style.width = (idx / queue.length) * 100 + "%";
    $("#card").focus();
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    $(".front .hint").classList.add("hidden");
    $(".back").classList.remove("hidden");
    $("#grade").classList.remove("hidden");
    $("#reveal").classList.add("hidden");
  }

  function grade(g) {
    if (!revealed) return;
    const c = queue[idx];
    const p = progress[c.id] || { box: 0, last: 0 };
    if (g === "again") p.box = 0;
    else if (g === "good") p.box = Math.min(p.box + 1, INTERVALS.length - 1);
    p.last = Date.now();
    progress[c.id] = p;
    save(STORE.progress, progress);
    stats[g]++;
    // "Again" cards come back later in the same session.
    if (g === "again") queue.push(c);
    idx++;
    if (idx >= queue.length) endSession();
    else showCard();
  }

  function endSession() {
    $("#session").classList.add("hidden");
    $("#setup").classList.remove("hidden");
    $("#done").classList.remove("hidden");
    $("#done-summary").textContent = `Good: ${stats.good} · Hard: ${stats.hard} · Again: ${stats.again}`;
    renderChips();
  }

  $("#start").onclick = startSession;
  $("#reveal").onclick = reveal;
  $("#card").onclick = reveal;
  $("#stop").onclick = endSession;
  $$("#grade button").forEach((b) => (b.onclick = () => grade(b.dataset.grade)));

  document.addEventListener("keydown", (e) => {
    if ($("#session").classList.contains("hidden")) return;
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    if (e.code === "Space") { e.preventDefault(); reveal(); }
    if (e.key === "1") grade("again");
    if (e.key === "2") grade("hard");
    if (e.key === "3") grade("good");
  });

  // ---------- browse ----------
  function renderBrowse() {
    const decks = allDecks();
    const sel = $("#browse-deck");
    const current = sel.value;
    sel.innerHTML = `<option value="">All themes</option>` +
      decks.map((d) => `<option value="${esc(d.id)}">${esc(d.title)}</option>`).join("");
    sel.value = current;
    const q = $("#browse-search").value.toLowerCase();
    const cards = decks
      .filter((d) => !sel.value || d.id === sel.value)
      .flatMap((d) => d.cards.map((c) => ({ ...c, deckTitle: d.title })))
      .filter((c) => !q || (c.q + " " + c.a).toLowerCase().includes(q));
    $("#browse-list").innerHTML = cards.length
      ? cards.map((c) => {
          const box = progress[c.id]?.box || 0;
          return `<details class="browse-item">
            <summary><span class="pill">${esc(c.deckTitle)}</span> <span class="level l${Math.min(box, 4)}">L${box}</span> ${inline(c.q.split("\n")[0])}</summary>
            <div class="content">${md(c.a)}</div>
          </details>`;
        }).join("")
      : `<p class="muted center-text">No cards found.</p>`;
  }
  $("#browse-deck").onchange = renderBrowse;
  $("#browse-search").oninput = renderBrowse;

  // ---------- manage ----------
  function renderManage() {
    $("#card-deck").innerHTML = allDecks()
      .map((d) => `<option value="${esc(d.id)}">${esc(d.title)}${d.custom ? " (custom)" : ""}</option>`)
      .join("");
  }

  $("#form-deck").onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const title = f.get("title").trim();
    const id = "custom-" + hash(title + Date.now());
    custom.decks.push({ id, title, description: f.get("description").trim() });
    save(STORE.custom, custom);
    selection.add(id);
    save(STORE.selection, [...selection]);
    e.target.reset();
    renderManage();
    renderChips();
    $("#card-deck").value = id;
    toast(`Theme “${title}” added`);
  };

  $("#form-card").onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const deck = f.get("deck");
    (custom.cards[deck] ||= []).push({ q: f.get("q").trim(), a: f.get("a").trim() });
    save(STORE.custom, custom);
    e.target.q.value = "";
    e.target.a.value = "";
    renderChips();
    toast("Card added");
  };

  $("#export").onclick = () => {
    const blob = new Blob([JSON.stringify({ custom, progress }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `flashcards-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  $("#import").onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (data.custom) {
        const ids = new Set(custom.decks.map((d) => d.id));
        data.custom.decks.forEach((d) => ids.has(d.id) || custom.decks.push(d));
        Object.entries(data.custom.cards || {}).forEach(([deck, cards]) => {
          const existing = new Set((custom.cards[deck] ||= []).map((c) => c.q));
          cards.forEach((c) => existing.has(c.q) || custom.cards[deck].push(c));
        });
        save(STORE.custom, custom);
      }
      if (data.progress) {
        progress = { ...progress, ...data.progress };
        save(STORE.progress, progress);
      }
      renderChips();
      renderManage();
      toast("Import complete");
    } catch {
      toast("Invalid JSON file");
    }
    e.target.value = "";
  };

  $("#reset-progress").onclick = () => {
    if (!confirm("Reset all study progress? Your custom themes and cards are kept.")) return;
    progress = {};
    save(STORE.progress, progress);
    renderChips();
    toast("Progress reset");
  };

  renderChips();
})();
