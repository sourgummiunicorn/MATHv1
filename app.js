/* SHSAT Math Practice: game engine (needs questions.js loaded first) */

/* =====================================================================
   GAME ENGINE
   ===================================================================== */

const LETTERS = "ABCDEFGHIJ";
const PRAISE = ["Nice work!", "That's it!", "Exactly right.", "Solid reasoning.", "You got it."];
const NUDGE = ["Not quite. Here's how to see it.", "Close one. Let's walk through it.", "Good try. Here's the path to the answer."];

const $ = (sel) => document.querySelector(sel);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ---- Game state ---- */
const game = {
  set: "all",        // "all" | 1 | 2
  deck: [],          // questions for the current round, in random order
  idx: 0,            // which question we're on
  score: 0,
  streak: 0,
  results: [],       // [{ q, correct }]
  mode: "main",      // "main" or "retry"
  answered: false,
  checkFn: null      // what the "Check answer" button should do for this question
};

/* Fisher–Yates shuffle: gives every order an equal chance */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function questionPool(set) {
  return QUESTIONS.filter((q) => q.active !== false && (set === "all" || q.form === set));
}

/* Turn \( \) and \[ \] into typeset math. Safe to call before KaTeX loads. */
function renderMath(el) {
  if (window.renderMathInElement) {
    renderMathInElement(el, {
      delimiters: [
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false }
      ],
      throwOnError: false
    });
  }
}

/* Look up a picture by key in FIGURES, or treat the value as a URL */
const figSrc = (key) => (typeof FIGURES !== "undefined" && FIGURES[key]) || key;
function fillFigures(el) {
  el.querySelectorAll("img[data-fig]").forEach((img) => (img.src = figSrc(img.dataset.fig)));
}

function showScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("on"));
  $("#screen" + name).classList.add("on");
  document.body.classList.toggle("in-quiz", name === "Quiz");
  window.scrollTo({ top: 0 });
}

/* ---------------- Start screen ---------------- */
function buildStart() {
  const sets = [
    { key: "all", title: "Both forms", n: questionPool("all").length },
    { key: 1, title: "Form 1", n: questionPool(1).length },
    { key: 2, title: "Form 2", n: questionPool(2).length }
  ];
  $("#sets").innerHTML = sets.map((s) =>
    `<button class="set-btn" data-set="${s.key}" aria-pressed="${s.key === game.set}">
       <span class="num">${s.title}</span><span>${s.n} questions</span>
     </button>`).join("");
  $("#sets").querySelectorAll(".set-btn").forEach((b) => {
    b.onclick = () => {
      game.set = b.dataset.set === "all" ? "all" : Number(b.dataset.set);
      buildStart();
    };
  });
}

function startRound(questions, mode) {
  game.deck = shuffle(questions);
  game.idx = 0;
  game.score = 0;
  game.streak = 0;
  game.results = [];
  game.mode = mode;
  showScreen("Quiz");
  renderQuestion();
}

/* ---------------- Header: score, streak, progress ---------------- */
function updateHeader() {
  $("#scoreNum").textContent = game.score;
  const st = $("#streak");
  $("#streakNum").textContent = game.streak;
  st.classList.toggle("on", game.streak >= 2);
  const done = game.idx + (game.answered ? 1 : 0);
  const pct = Math.round((done / game.deck.length) * 100);
  $("#progressFill").style.width = pct + "%";
  $("#progressBar").setAttribute("aria-valuenow", pct);
}

/* ---------------- Render one question ---------------- */
const TYPE_HINT = {
  mc: "Choose one",
  multi: "Choose two",
  numeric: "Type your answer",
  dropdown: "Use the menus",
  classify: "One answer per row",
  graph: "Plot on the grid"
};

function renderQuestion() {
  const q = game.deck[game.idx];
  game.answered = false;
  game.checkFn = null;
  updateHeader();

  const card = $("#qCard");
  const hint = q.type === "multi" ? `Choose ${q.answer.length}` : TYPE_HINT[q.type];
  card.innerHTML = `
    <div class="q-head">
      ${game.mode === "retry" ? '<span class="chip retry">Try Again</span>' : ""}
      <span class="chip">Form ${q.form} · Item ${q.item}</span>
      <span class="chip alt">${hint}</span>
      <span class="q-num">Question ${game.idx + 1} of ${game.deck.length}</span>
    </div>
    ${q.figure ? `<div class="figure"><img data-fig="${q.figure}" alt="Figure for this question"></div>` : ""}
    <div class="prompt" tabindex="-1" id="prompt">${q.prompt}</div>
    <div id="area"></div>
    <div class="actions" id="actions"></div>
    <div class="feedback" id="feedback" role="status"></div>`;

  const area = $("#area");
  const renderers = { mc: renderMC, multi: renderMulti, numeric: renderNumeric, dropdown: renderDropdown, classify: renderClassify, graph: renderGraph };
  renderers[q.type](q, area);

  // Every type except single-answer multiple choice gets a "Check answer" button
  if (q.type !== "mc") {
    $("#actions").innerHTML = `<button class="btn btn-primary" id="checkBtn" disabled>Check answer</button>`;
    $("#checkBtn").onclick = () => game.checkFn && !game.answered && game.checkFn();
  }

  fillFigures(card);
  renderMath(card);
  $("#prompt").focus({ preventScroll: true });
}

const setCheckEnabled = (on) => { const b = $("#checkBtn"); if (b) b.disabled = !on; };

/* ---- Type: multiple choice (one answer). Submits as soon as a choice is tapped. ---- */
function renderMC(q, area) {
  area.innerHTML = `<div class="choices">${q.choices.map((c, i) => choiceHTML(c, i)).join("")}</div>
    <p class="hint-line">Your first tap is your answer.</p>`;
  area.querySelectorAll(".choice").forEach((btn) => {
    btn.onclick = () => {
      if (game.answered) return;
      const chosen = btn.dataset.key;
      const correct = chosen === q.answer;
      area.querySelectorAll(".choice").forEach((b) => {
        b.disabled = true;
        if (b.dataset.key === q.answer) b.classList.add("is-correct");
        else if (b.dataset.key === chosen) b.classList.add("is-wrong");
        else b.classList.add("dim");
      });
      area.querySelector(".hint-line").remove();
      finish(q, correct);
    };
  });
}

function choiceHTML(text, i) {
  const L = LETTERS[i];
  return `<button class="choice" data-key="${L}" aria-label="Choice ${L}">
            <span class="letter">${L}</span><span class="ctext">${text}</span><span class="mark" aria-hidden="true"></span>
          </button>`;
}

/* ---- Type: choose several ---- */
function renderMulti(q, area) {
  const need = q.answer.length;
  const chosen = new Set();
  area.innerHTML = `<div class="choices">${q.choices.map((c, i) => choiceHTML(c, i)).join("")}</div>`;
  const btns = area.querySelectorAll(".choice");
  btns.forEach((btn) => {
    btn.setAttribute("aria-pressed", "false");
    btn.onclick = () => {
      if (game.answered) return;
      const k = btn.dataset.key;
      if (chosen.has(k)) chosen.delete(k);
      else if (chosen.size < need) chosen.add(k);
      btns.forEach((b) => {
        const on = chosen.has(b.dataset.key);
        b.classList.toggle("selected", on);
        b.setAttribute("aria-pressed", on);
      });
      setCheckEnabled(chosen.size === need);
    };
  });
  game.checkFn = () => {
    const correct = q.answer.every((k) => chosen.has(k)) && chosen.size === need;
    btns.forEach((b) => {
      const k = b.dataset.key, isAns = q.answer.includes(k), picked = chosen.has(k);
      b.disabled = true;
      b.classList.remove("selected");
      if (isAns && picked) b.classList.add("is-correct");
      else if (isAns) b.classList.add("is-missed");
      else if (picked) b.classList.add("is-wrong");
      else b.classList.add("dim");
    });
    finish(q, correct);
  };
}

/* ---- Type: type in a number ---- */
function renderNumeric(q, area) {
  area.innerHTML = `<div class="numeric">
      <label class="sr-only" for="numIn">Your answer</label>
      <input id="numIn" type="text" inputmode="decimal" autocomplete="off" placeholder="?">
    </div>`;
  const input = $("#numIn");
  input.oninput = () => setCheckEnabled(input.value.trim() !== "");
  input.onkeydown = (e) => { if (e.key === "Enter" && input.value.trim() !== "") { e.preventDefault(); game.checkFn(); } };
  game.checkFn = () => {
    const val = Number(input.value.replace(/,/g, "").trim());
    if (Number.isNaN(val)) {                 // not a number: ask again, don't lock
      input.classList.remove("shake"); void input.offsetWidth; input.classList.add("shake");
      return;
    }
    const correct = Math.abs(val - q.answer) < 1e-9;
    input.disabled = true;
    input.classList.add(correct ? "is-correct" : "is-wrong");
    finish(q, correct);
  };
}

/* ---- Type: drop-down menus inside sentences ---- */
function renderDropdown(q, area) {
  const html = q.blanks.replace(/\{\{(\d+)\}\}/g, (_, i) =>
    `<select data-i="${i}" aria-label="Drop-down ${Number(i) + 1}">
       <option value="">Choose…</option>
       ${q.options[i].map((o) => `<option value="${o}">${o}</option>`).join("")}
     </select>`);
  area.innerHTML = `<div class="blanks">${html}</div>`;
  const sels = area.querySelectorAll("select");
  sels.forEach((s) => (s.onchange = () => setCheckEnabled([...sels].every((x) => x.value))));
  game.checkFn = () => {
    let all = true;
    sels.forEach((s) => {
      const ok = s.value === q.answer[s.dataset.i];
      all = all && ok;
      s.disabled = true;
      s.classList.add(ok ? "is-correct" : "is-wrong");
    });
    finish(q, all);
  };
}

/* ---- Type: sort each row/graph into a category ---- */
function renderClassify(q, area) {
  const choice = q.items.map(() => null);
  const asCards = q.items.some((it) => it.figure);
  area.innerHTML = `<div class="classify ${asCards ? "cards" : ""}">
    ${q.items.map((it, r) => `
      <div class="c-row" data-r="${r}">
        ${it.figure ? `<img data-fig="${it.figure}" alt="${it.label} graph">` : ""}
        <span class="c-label">${it.label}</span>
        <div class="seg" role="group" aria-label="${it.figure ? it.label : "Row " + (r + 1)}">
          ${q.categories.map((c) => `<button data-c="${c}" aria-pressed="false">${c}</button>`).join("")}
        </div>
      </div>`).join("")}
  </div>`;
  area.querySelectorAll(".c-row").forEach((row) => {
    const r = Number(row.dataset.r);
    row.querySelectorAll(".seg button").forEach((b) => {
      b.onclick = () => {
        if (game.answered) return;
        choice[r] = b.dataset.c;
        row.querySelectorAll(".seg button").forEach((x) => x.setAttribute("aria-pressed", x === b));
        setCheckEnabled(choice.every(Boolean));
      };
    });
  });
  game.checkFn = () => {
    let all = true;
    area.querySelectorAll(".c-row").forEach((row) => {
      const r = Number(row.dataset.r), ok = choice[r] === q.answer[r];
      all = all && ok;
      row.classList.add(ok ? "is-correct" : "is-wrong");
      row.querySelectorAll("button").forEach((b) => (b.disabled = true));
      if (!ok) row.insertAdjacentHTML("beforeend", `<span class="c-fix">Correct: ${q.answer[r]}</span>`);
    });
    finish(q, all);
  };
}

/* ---- Type: plot on a coordinate grid ----
   Each tool has a fixed number of "slots". Tapping an empty spot fills the next
   open slot; tapping a point you already placed removes it. */
function renderGraph(q, area) {
  const g = q.grid;
  const state = {};
  q.tools.forEach((t) => (state[t.id] = Array(t.slots).fill(null)));
  let active = q.tools[0].id;
  const tool = (id) => q.tools.find((t) => t.id === id);
  const minNeeded = (t) => t.min || t.slots;

  area.innerHTML = `<div class="graph-wrap">
      ${q.tools.length > 1 ? `<div class="tools">${q.tools.map((t) =>
        `<button class="tool" data-id="${t.id}" aria-pressed="false"><span class="sw" style="background:${t.color}"></span>${t.label} <span class="ct"></span></button>`).join("")}</div>` : ""}
      <p class="graph-hint" id="gHint"></p>
      ${g.title ? `<p class="graph-title">${g.title}</p>` : ""}
      <div class="graph-box" id="gBox"></div>
      <div class="graph-ctrl"><button id="gUndo">Undo</button><button id="gClear">Clear all</button></div>
      <div class="legend" id="gLegend" hidden><i></i>Correct answer</div>
    </div>`;

  const box = $("#gBox");
  const history = [];     // for Undo: [toolId, slotIndex]

  function refresh(solution) {
    box.innerHTML = buildGridSVG(q, state, solution);
    const svg = box.querySelector("svg");
    if (!game.answered) {
      svg.addEventListener("click", onTap);
      svg.addEventListener("pointermove", onHover);
      svg.addEventListener("pointerleave", () => svg.querySelector("#ghost").setAttribute("visibility", "hidden"));
    } else svg.classList.add("locked");

    // tool buttons + hint text
    area.querySelectorAll(".tool").forEach((b) => {
      const t = tool(b.dataset.id);
      b.setAttribute("aria-pressed", t.id === active);
      b.querySelector(".ct").textContent = `${filled(state[t.id]).length}/${t.slots}`;
      b.disabled = game.answered;
    });
    const t = tool(active), pts = state[active], open = pts.indexOf(null);
    let msg;
    if (game.answered) msg = "";
    else if (t.kind === "polygon" && open >= 0) msg = `Tap the grid to place ${t.labels[open]}.`;
    else if (t.kind === "line" && open >= 0) msg = `${t.label}: tap ${open === 0 ? "two points" : "one more point"} on the line.`;
    else if (t.kind === "point" && open >= 0) msg = `Tap the grid to plot the ${t.label.toLowerCase()} point.`;
    else if (t.kind === "path") msg = filled(pts).length < minNeeded(t) ? `Tap to plot points (at least ${minNeeded(t)}).` : "Add more points or check your answer.";
    else msg = "Tap a point to remove it" + (q.tools.length > 1 ? ", or switch tools above." : ".");
    $("#gHint").textContent = msg;
    setCheckEnabled(!game.answered && q.tools.every((tt) => filled(state[tt.id]).length >= minNeeded(tt)));
  }

  // Convert a tap on the SVG into grid coordinates, snapped to the nearest grid point
  function toGrid(evt) {
    const svg = box.querySelector("svg");
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const m = svg._map;
    let x = m.invX(p.x), y = m.invY(p.y);
    const s = g.snap || 1;
    x = Math.round((x - g.xMin) / s) * s + g.xMin;
    y = Math.round((y - g.yMin) / s) * s + g.yMin;
    if (x < g.xMin - 1e-9 || x > g.xMax + 1e-9 || y < g.yMin - 1e-9 || y > g.yMax + 1e-9) return null;
    return [+x.toFixed(4), +y.toFixed(4)];
  }

  function onHover(evt) {
    const svg = box.querySelector("svg"), ghost = svg.querySelector("#ghost");
    const p = toGrid(evt);
    if (!p) { ghost.setAttribute("visibility", "hidden"); return; }
    ghost.setAttribute("cx", svg._map.X(p[0]));
    ghost.setAttribute("cy", svg._map.Y(p[1]));
    ghost.setAttribute("visibility", "visible");
  }

  function onTap(evt) {
    if (game.answered) return;
    const p = toGrid(evt);
    if (!p) return;
    const pts = state[active];
    const hit = pts.findIndex((q2) => samePt(q2, p));
    if (hit >= 0) { pts[hit] = null; }                         // tap an existing point: remove it
    else {
      let slot = pts.indexOf(null);
      if (slot < 0) slot = pts.length - 1;                     // full: replace the last point
      pts[slot] = p;
      history.push([active, slot]);
      // when this tool is full, move on to the next tool that still needs points
      if (pts.indexOf(null) < 0 && tool(active).kind !== "path") {
        const next = q.tools.find((t) => state[t.id].indexOf(null) >= 0);
        if (next) active = next.id;
      }
    }
    refresh();
  }

  area.querySelectorAll(".tool").forEach((b) => (b.onclick = () => { active = b.dataset.id; refresh(); }));
  $("#gUndo").onclick = () => {
    while (history.length) {
      const [id, slot] = history.pop();
      if (state[id][slot]) { state[id][slot] = null; active = id; break; }
    }
    refresh();
  };
  $("#gClear").onclick = () => { q.tools.forEach((t) => state[t.id].fill(null)); history.length = 0; active = q.tools[0].id; refresh(); };

  game.checkFn = () => {
    const correct = !!q.check(state);
    game.answered = true;                       // lock the grid before redrawing
    refresh(correct ? null : q.solution);
    area.querySelector(".graph-ctrl").hidden = true;
    if (!correct) $("#gLegend").hidden = false;
    finish(q, correct);
  };

  refresh();
}

/* Draws the grid, axes, given shapes, the student's marks, and (after a miss) the correct answer */
function buildGridSVG(q, state, solution) {
  const g = q.grid;
  const titled = !!(g.xTitle || g.yTitle);
  const P = { l: titled ? 60 : 20, r: 20, t: 14, b: titled ? 56 : 22 };
  const W = 360, H = g.height || 360;
  const sx = W / (g.xMax - g.xMin), sy = H / (g.yMax - g.yMin);
  const X = (x) => P.l + (x - g.xMin) * sx;
  const Y = (y) => P.t + (g.yMax - y) * sy;
  const VW = W + P.l + P.r, VH = H + P.t + P.b;
  const ax = g.xMin <= 0 && g.xMax >= 0 ? 0 : g.xMin;   // where the y-axis sits
  const ay = g.yMin <= 0 && g.yMax >= 0 ? 0 : g.yMin;   // where the x-axis sits
  const fmt = (v) => String(+v.toFixed(2)).replace("-", "−");
  let s = "";

  // grid lines
  for (let v = g.xMin; v <= g.xMax + 1e-9; v += g.step) {
    const major = Math.abs(v - Math.round(v)) < 1e-9;
    s += `<line x1="${X(v)}" y1="${Y(g.yMin)}" x2="${X(v)}" y2="${Y(g.yMax)}" stroke="${major ? "#cfcab9" : "#ebe7dc"}" stroke-width="1"/>`;
  }
  for (let v = g.yMin; v <= g.yMax + 1e-9; v += g.step) {
    const major = Math.abs(v - Math.round(v)) < 1e-9;
    s += `<line x1="${X(g.xMin)}" y1="${Y(v)}" x2="${X(g.xMax)}" y2="${Y(v)}" stroke="${major ? "#cfcab9" : "#ebe7dc"}" stroke-width="1"/>`;
  }
  // axes
  s += `<line x1="${X(g.xMin)}" y1="${Y(ay)}" x2="${X(g.xMax)}" y2="${Y(ay)}" stroke="#1b2040" stroke-width="2"/>`;
  s += `<line x1="${X(ax)}" y1="${Y(g.yMin)}" x2="${X(ax)}" y2="${Y(g.yMax)}" stroke="#1b2040" stroke-width="2"/>`;

  // axis numbers (white outline keeps them readable on top of grid lines)
  const lab = `font-size="15" fill="#5d6481" stroke="#fff" stroke-width="3" paint-order="stroke" font-family="Atkinson Hyperlegible, sans-serif"`;
  for (let v = g.xMin; v <= g.xMax + 1e-9; v += g.xLabelStep) {
    if (Math.abs(v - ax) < 1e-9 && ax !== g.xMin) continue;
    s += `<text x="${X(v)}" y="${Y(ay) + 17}" text-anchor="middle" ${lab}>${fmt(v)}</text>`;
  }
  for (let v = g.yMin; v <= g.yMax + 1e-9; v += g.yLabelStep) {
    if (Math.abs(v - ay) < 1e-9) continue;
    s += `<text x="${X(ax) - 5}" y="${Y(v) + 5}" text-anchor="end" ${lab}>${fmt(v)}</text>`;
  }
  if (titled) {
    s += `<text x="${P.l + W / 2}" y="${VH - 8}" text-anchor="middle" font-size="14" fill="#1b2040" font-weight="700">${g.xTitle}</text>`;
    s += `<text transform="translate(16 ${P.t + H / 2}) rotate(-90)" text-anchor="middle" font-size="14" fill="#1b2040" font-weight="700">${g.yTitle}</text>`;
  } else {
    s += `<text x="${X(g.xMax) - 4}" y="${Y(ay) - 6}" text-anchor="end" font-size="16" font-style="italic" fill="#1b2040">x</text>`;
    s += `<text x="${X(ax) + 6}" y="${Y(g.yMax) + 14}" font-size="16" font-style="italic" fill="#1b2040">y</text>`;
  }

  // shapes that come with the question (e.g. triangle ABC)
  (q.given || []).forEach((sh) => {
    const pts = sh.points.map((p) => `${X(p[0])},${Y(p[1])}`).join(" ");
    s += `<polygon points="${pts}" fill="#e2e0db" stroke="#3d4058" stroke-width="2"/>`;
    sh.points.forEach((p, i) => {
      s += `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="3.5" fill="#3d4058"/>`;
      s += pointLabel(X(p[0]), Y(p[1]), sh.labels[i], "#3d4058");
    });
  });

  // the student's marks
  const clipId = "clip" + Math.random().toString(36).slice(2, 7);
  s += `<defs><clipPath id="${clipId}"><rect x="${X(g.xMin)}" y="${Y(g.yMax)}" width="${W}" height="${H}"/></clipPath></defs>`;
  q.tools.forEach((t) => (s += drawTool(t, state[t.id], t.color, false)));
  // the correct answer, dashed green, only after a wrong answer
  if (solution) q.tools.forEach((t) => solution[t.id] && (s += drawTool(t, solution[t.id], "#11865c", true)));

  function drawTool(t, slots, color, dashed) {
    const pts = slots.filter(Boolean);
    const dash = dashed ? `stroke-dasharray="7 5"` : "";
    let out = "";
    if (t.kind === "line" && pts.length === 2 && !samePt(pts[0], pts[1])) {
      const [a, b] = pts, dx = b[0] - a[0], dy = b[1] - a[1], k = 1000;
      out += `<line clip-path="url(#${clipId})" x1="${X(a[0] - dx * k)}" y1="${Y(a[1] - dy * k)}" x2="${X(a[0] + dx * k)}" y2="${Y(a[1] + dy * k)}" stroke="${color}" stroke-width="3" ${dash}/>`;
    }
    if (t.kind === "path" && pts.length >= 2) {
      const sorted = pts.slice().sort((p, q2) => p[0] - q2[0]);
      out += `<polyline points="${sorted.map((p) => `${X(p[0])},${Y(p[1])}`).join(" ")}" fill="none" stroke="${color}" stroke-width="3" ${dash}/>`;
    }
    if (t.kind === "polygon") {
      const full = slots.every(Boolean);
      for (let i = 0; i < slots.length; i++) {
        const a = slots[i], b = slots[(i + 1) % slots.length];
        if (a && b && (full || i < slots.length - 1))
          out += `<line x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(b[0])}" y2="${Y(b[1])}" stroke="${color}" stroke-width="3" ${dash}/>`;
      }
      if (full && !dashed) out = `<polygon points="${slots.map((p) => `${X(p[0])},${Y(p[1])}`).join(" ")}" fill="${color}" fill-opacity=".18"/>` + out;
    }
    slots.forEach((p, i) => {
      if (!p) return;
      out += dashed
        ? `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="7" fill="#fff" stroke="${color}" stroke-width="3"/>`
        : `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="6.5" fill="${color}" stroke="#fff" stroke-width="2"/>`;
      if (t.labels) out += pointLabel(X(p[0]), Y(p[1]), t.labels[i], color);
    });
    return out;
  }

  s += `<circle id="ghost" r="7" fill="none" stroke="#4a3fdc" stroke-width="2" stroke-dasharray="3 3" visibility="hidden"/>`;
  const html = `<svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Coordinate grid">${s}</svg>`;

  // remember the coordinate mapping so taps can be converted back to grid values
  queueMicrotask(() => {
    const svg = document.querySelector("#gBox svg");
    if (svg) svg._map = { X, Y, invX: (px) => (px - P.l) / sx + g.xMin, invY: (py) => g.yMax - (py - P.t) / sy };
  });
  return html;
}

function pointLabel(x, y, text, color) {
  return `<text x="${x + 8}" y="${y - 8}" font-size="18" font-weight="700" fill="${color}" stroke="#fff" stroke-width="4" paint-order="stroke">${text}</text>`;
}

/* ---------------- After an answer is submitted ---------------- */
function correctAnswerHTML(q) {
  switch (q.type) {
    case "mc": return `${q.answer}. ${q.choices[LETTERS.indexOf(q.answer)]}`;
    case "multi": return q.answer.map((k) => `${k}. ${q.choices[LETTERS.indexOf(k)]}`).join("<br>");
    case "numeric": return String(q.answer);
    case "dropdown": return q.answer.map((a, i) => `Menu ${i + 1}: ${a}`).join(" &nbsp;·&nbsp; ");
    case "classify": return q.items.map((it, i) => `${it.label}: ${q.answer[i]}`).join("<br>");
    case "graph": return q.answerText;
  }
}

function finish(q, correct) {
  game.answered = true;
  game.results.push({ q, correct });
  if (correct) { game.score++; game.streak++; } else game.streak = 0;
  updateHeader();
  if (correct && game.streak >= 2) { const st = $("#streak"); st.classList.remove("pop"); void st.offsetWidth; st.classList.add("pop"); }

  setCheckEnabled(false);
  const actions = $("#actions");
  if (actions) actions.innerHTML = "";

  const last = game.idx === game.deck.length - 1;
  const fb = $("#feedback");
  const icon = correct
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
  const streakMsg = correct && game.streak >= 3 ? ` <span style="font-size:15px;color:#8a5a00">${game.streak} in a row</span>` : "";

  fb.className = "feedback on " + (correct ? "good" : "bad");
  fb.innerHTML = `
    <p class="fb-title"><span class="fb-icon">${icon}</span>${correct ? pick(PRAISE) : pick(NUDGE)}${streakMsg}</p>
    ${correct ? "" : `<div class="fb-answer"><small>Correct answer</small>${correctAnswerHTML(q)}</div>`}
    ${correct
      ? `<details class="explain"><summary>See the solution</summary>${q.explanation}</details>`
      : `<div class="explain"><h3>How to solve it</h3>${q.explanation}</div>`}
    <button class="btn btn-primary btn-wide fb-next" id="nextBtn">${last ? "See my results" : "Next question"}</button>`;
  fillFigures(fb);
  renderMath(fb);
  $("#nextBtn").onclick = next;
  fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function next() {
  if (game.idx < game.deck.length - 1) {
    game.idx++;
    renderQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else showResults();
}

/* ---------------- Results screen ---------------- */
function showResults() {
  const total = game.results.length;
  const right = game.results.filter((r) => r.correct).length;
  const wrong = total - right;
  const pct = total ? Math.round((right / total) * 100) : 0;
  const missed = game.results.filter((r) => !r.correct).map((r) => r.q);

  let headline, sub;
  if (game.mode === "retry" && wrong === 0) { headline = "You cleared every miss."; sub = "Those questions that tripped you up? Solved. That's how skills stick."; }
  else if (pct >= 90) { headline = "Outstanding work."; sub = "You're reading these problems carefully and it shows."; }
  else if (pct >= 70) { headline = "Strong showing."; sub = "A few to tighten up. Try Again is the fastest way to lock them in."; }
  else if (pct >= 50) { headline = "Good progress."; sub = "You've got the foundation. Review the solutions, then take another pass at the misses."; }
  else { headline = "Every review counts."; sub = "Go through the missed questions with the solutions. That's where the learning happens."; }

  const R = 64, C = 2 * Math.PI * R;
  const ring = `<div class="ring" aria-hidden="true">
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r="${R}" fill="none" stroke="#ebe7dc" stroke-width="14"/>
        <circle cx="75" cy="75" r="${R}" fill="none" stroke="url(#rg)" stroke-width="14" stroke-linecap="round"
                stroke-dasharray="${C}" stroke-dashoffset="${C}" id="ringArc" style="transition: stroke-dashoffset 1s ease"/>
        <defs><linearGradient id="rg"><stop offset="0" stop-color="#4a3fdc"/><stop offset="1" stop-color="#0f9b9b"/></linearGradient></defs>
      </svg>
      <div class="pct">${pct}%</div>
    </div>`;

  $("#resultsCard").innerHTML = `
    <div class="results-top">
      ${ring}
      <div>
        <div class="eyebrow">${game.mode === "retry" ? "Try Again round" : "Results"}</div>
        <h2>${headline}</h2>
        <p class="lead" style="margin:0">${sub}</p>
      </div>
    </div>
    <div class="tiles">
      <div class="tile"><span class="num">${right}/${total}</span><span>Score</span></div>
      <div class="tile g"><span class="num">${right}</span><span>Correct</span></div>
      <div class="tile b"><span class="num">${wrong}</span><span>Incorrect</span></div>
    </div>
    <div class="eyebrow" style="margin-bottom:8px">Question by question</div>
    <ul class="review-list">
      ${game.results.slice().sort((a, b) => a.q.form - b.q.form || a.q.item - b.q.item)
        .map((r) => `<li class="${r.correct ? "ok" : "no"}">${r.correct ? "✓" : "✗"} F${r.q.form} · ${r.q.item}</li>`).join("")}
    </ul>
    <div class="result-actions">
      ${missed.length ? `<button class="btn btn-sun" id="retryBtn">Try Again: ${missed.length} missed</button>` : ""}
      <button class="btn btn-primary" id="restartBtn" ${missed.length ? "" : 'style="grid-column:1/-1"'}>Restart Test</button>
    </div>
    <div style="text-align:center;margin-top:8px"><button class="link-btn" id="homeBtn">Change question set</button></div>`;

  showScreen("Results");
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $("#ringArc").style.strokeDashoffset = C * (1 - pct / 100);
  }));
  if (missed.length) $("#retryBtn").onclick = () => startRound(missed, "retry");
  $("#restartBtn").onclick = () => startRound(questionPool(game.set), "main");
  $("#homeBtn").onclick = () => { buildStart(); showScreen("Start"); };
}

/* ---------------- Keyboard shortcuts ----------------
   A–E picks a choice, Enter checks or moves to the next question. */
document.addEventListener("keydown", (e) => {
  if (!$("#screenQuiz").classList.contains("on")) return;
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "select" || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "Enter") {
    if (tag === "button" || tag === "summary") return;   // let the focused button handle it
    const nb = $("#nextBtn"), cb = $("#checkBtn");
    if (game.answered && nb) { e.preventDefault(); nb.click(); }
    else if (cb && !cb.disabled) { e.preventDefault(); cb.click(); }
    return;
  }
  const k = e.key.toUpperCase();
  if (!game.answered && LETTERS.slice(0, 5).includes(k)) {
    const btn = document.querySelector(`.choice[data-key="${k}"]`);
    if (btn) btn.click();
  }
});

/* ---------------- Boot ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  buildStart();
  $("#startBtn").onclick = () => startRound(questionPool(game.set), "main");
});
