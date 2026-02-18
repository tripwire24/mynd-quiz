/* ════════════════════════════════════════════════════════
   Mynd Focus-Type Quiz  —  app.js
   Two-part funnel: identity quiz → brain-game puzzles
   ════════════════════════════════════════════════════════ */

// ─── DATA ────────────────────────────────────────────
const archetypes = {
  tabSwitcher: {
    name: "The Tab-Switcher",
    emoji: "🔀",
    summary: "You move fast, but context-switching burns focus fuel. You need structure to channel that speed.",
    routine: [
      "Start with 1 high-impact task before opening messages.",
      "Use 25-minute single-tab focus sprints.",
      "Take Lion's Mane with your first deep-work block.",
    ],
    product: {
      name: "The Full Focus Stack",
      url: "https://www.myndmushrooms.co.nz/products/the-full-focus-stack",
    },
  },
  friedFounder: {
    name: "The Fried Founder",
    emoji: "🔥",
    summary: "You're carrying heavy mental load and decision fatigue. Your brain needs recovery, not more hustle.",
    routine: [
      "Run a strict top-3 priority list each morning.",
      "Schedule one protected no-meeting block daily.",
      "Use steady daily brain support to reduce cognitive drag.",
    ],
    product: {
      name: "Big Brain Bundle",
      url: "https://www.myndmushrooms.co.nz/products/big-brain-bundle-1",
    },
  },
  overthinker: {
    name: "The Overthinker",
    emoji: "🌀",
    summary: "Your brain spots every edge case, then stalls execution. Clarity is your unlock.",
    routine: [
      "Use 10-minute decisions: choose, commit, move.",
      'Define "done" before starting new tasks.',
      "Pair focus nutrition with a pre-work breathing reset.",
    ],
    product: {
      name: "NZ Lion's Mane Powder",
      url: "https://www.myndmushrooms.co.nz/products/new-zealand-lions-mane-60g-powder",
    },
  },
  creativeSprinter: {
    name: "The Creative Sprinter",
    emoji: "⚡",
    summary: "You generate sparks quickly, but consistency is your real lever. Harness the bursts.",
    routine: [
      "Capture ideas fast, then batch execution windows.",
      "Use a repeatable start ritual to trigger focus mode.",
      "Anchor energy with a daily smart-mushroom stack.",
    ],
    product: {
      name: "The Focus Food Bundle",
      url: "https://www.myndmushrooms.co.nz/products/the-focus-food-bundle",
    },
  },
};

const questions = [
  {
    id: "q1",
    title: "Your workday starts. What's your first move?",
    helper: "Tap one",
    type: "single",
    options: [
      { label: "Open 8 tabs and skim everything", key: "tabSwitcher" },
      { label: "Jump into urgent fires", key: "friedFounder" },
      { label: "Plan every scenario first", key: "overthinker" },
      { label: "Follow the most exciting idea", key: "creativeSprinter" },
    ],
  },
  {
    id: "q2",
    title: "Which derails your focus most often?",
    helper: "Choose one",
    type: "single",
    options: [
      { label: "Notifications & app-hopping", key: "tabSwitcher" },
      { label: "Mental exhaustion", key: "friedFounder" },
      { label: "Second-guessing decisions", key: "overthinker" },
      { label: "Boredom with repetitive tasks", key: "creativeSprinter" },
    ],
  },
  {
    id: "q3",
    title: "Pick your current brain state",
    helper: "Best match",
    type: "single",
    options: [
      { label: "Fast but scattered", key: "tabSwitcher" },
      { label: "Flat and overloaded", key: "friedFounder" },
      { label: "Sharp but frozen", key: "overthinker" },
      { label: "Bursts of energy", key: "creativeSprinter" },
    ],
  },
  {
    id: "q4",
    title: "How often do you finish what you start?",
    helper: "Be honest",
    type: "single",
    options: [
      { label: "Rarely — I pivot fast", key: "tabSwitcher" },
      { label: "Only under pressure", key: "friedFounder" },
      { label: "After lots of overthinking", key: "overthinker" },
      { label: "When momentum is high", key: "creativeSprinter" },
    ],
  },
  {
    id: "q5",
    title: "Choose TWO words that describe your brain today",
    helper: "Pick exactly two",
    type: "multi",
    max: 2,
    options: [
      { label: "Distracted", key: "tabSwitcher" },
      { label: "Drained", key: "friedFounder" },
      { label: "Analytical", key: "overthinker" },
      { label: "Imaginative", key: "creativeSprinter" },
      { label: "Restless", key: "tabSwitcher" },
      { label: "Foggy", key: "friedFounder" },
    ],
  },
  {
    id: "q6",
    title: "Deadline in 30 minutes. Your instinct?",
    helper: "Final pick",
    type: "single",
    options: [
      { label: "Tab-switch until panic focus hits", key: "tabSwitcher" },
      { label: "Push through fatigue and finish", key: "friedFounder" },
      { label: "Rewrite the plan one more time", key: "overthinker" },
      { label: "Ride a final creative burst", key: "creativeSprinter" },
    ],
  },
];

const puzzleProducts = [
  { name: "The Full Focus Stack", url: "https://www.myndmushrooms.co.nz/products/the-full-focus-stack" },
  { name: "Big Brain Bundle", url: "https://www.myndmushrooms.co.nz/products/big-brain-bundle-1" },
  { name: "NZ Lion's Mane Powder", url: "https://www.myndmushrooms.co.nz/products/new-zealand-lions-mane-60g-powder" },
  { name: "The Focus Food Bundle", url: "https://www.myndmushrooms.co.nz/products/the-focus-food-bundle" },
];

const PUZZLE_TIME = 120; // seconds per puzzle
const POINTS_PER_PUZZLE = 25;

// Speed-bonus thresholds (seconds remaining → bonus pts)
const SPEED_BONUS = [
  { above: 90, bonus: 15, label: "Lightning ⚡" },
  { above: 60, bonus: 10, label: "Fast 🔥" },
  { above: 30, bonus: 5,  label: "Solid 💪" },
];

function calcSpeedBonus(secsLeft) {
  for (const tier of SPEED_BONUS) {
    if (secsLeft >= tier.above) return tier;
  }
  return null;
}

// ─── STATE ───────────────────────────────────────────
const state = {
  phase: "intro", // intro | quiz | result | puzzles | final
  qi: 0,          // question index
  answers: {},
  scores: { tabSwitcher: 0, friedFounder: 0, overthinker: 0, creativeSprinter: 0 },
  focusType: null,
  pi: 0,          // puzzle index
  pts: 0,         // puzzle points
  timerId: null,
  timeLeft: PUZZLE_TIME,
  puzzleTimes: [],   // seconds taken per puzzle (PUZZLE_TIME - timeLeft)
  totalBonus: 0,     // accumulated speed bonus
};

const $ = (sel) => document.querySelector(sel);
const app = document.getElementById("app");
const topbarPill = document.getElementById("topbar-pill");

// ─── HELPERS ─────────────────────────────────────────
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resetTimer() {
  if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
}

function setPill(text) {
  if (topbarPill) topbarPill.textContent = text;
}

// ─── STEP PROGRESS (Part 1) ─────────────────────────
function stepProgressHTML() {
  const cur = state.qi + 1;
  const total = questions.length;
  const pct = Math.round((cur / total) * 100);

  let dots = "";
  for (let i = 0; i < total; i++) {
    const cls = i < state.qi ? "step-dot done" : i === state.qi ? "step-dot active" : "step-dot";
    dots += `<div class="${cls}"></div>`;
  }

  return `
    <div class="step-progress">
      <div class="step-progress-header">
        <span class="step-label">Part 1 · Identity</span>
        <span class="step-count">Question ${cur} of ${total}</span>
      </div>
      <div class="step-dots">${dots}</div>
      <div class="step-bar"><div class="step-bar-fill" style="width:${pct}%"></div></div>
    </div>`;
}

// ─── PUZZLE STATUS BAR (Part 2) ─────────────────────
function puzzleStatusHTML() {
  const cur = state.pi + 1;
  let dots = "";
  for (let i = 0; i < 4; i++) {
    const cls = i < state.pi ? "puzzle-dot done" : i === state.pi ? "puzzle-dot active" : "puzzle-dot";
    dots += `<div class="${cls}"></div>`;
  }

  return `
    <div class="puzzle-status">
      <div class="puzzle-status-block">
        <span class="ps-label">Puzzle</span>
        <span class="ps-value">${cur}/4</span>
      </div>
      <div class="puzzle-status-block center">
        <span class="ps-label">Time</span>
        <span class="ps-timer" id="ps-timer">02:00</span>
      </div>
      <div class="puzzle-status-block right">
        <span class="ps-label">Points</span>
        <span class="ps-value" id="ps-points">${state.pts}</span>
      </div>
    </div>
    <div class="puzzle-dots">${dots}</div>`;
}

function whyBannerHTML() {
  const profile = archetypes[state.focusType];
  return `<div class="why-banner">${profile.emoji} <span>You're <strong>${profile.name}</strong> — these puzzles measure how your focus holds under pressure.</span></div>`;
}

// ─── INTRO ───────────────────────────────────────────
function renderIntro() {
  state.phase = "intro";
  setPill("Focus Type Quiz");

  app.innerHTML = `
    <div class="view">
      <p class="eyebrow">Nature's Brain Food</p>
      <h1>What's your Focus Type?</h1>
      <p class="lead">Answer 6 quick questions to discover your cognitive style, then test it with 4 optional brain-game puzzles.</p>

      <div class="intro-features">
        <div class="intro-feature"><span>🧠</span> Identity quiz</div>
        <div class="intro-feature"><span>🧩</span> Brain games</div>
        <div class="intro-feature"><span>⏱</span> ~5 minutes</div>
        <div class="intro-feature"><span>🍄</span> Personalised routine</div>
      </div>

      <div class="actions">
        <button class="btn btn-primary" id="start-btn">Start Quiz</button>
      </div>
    </div>`;

  document.getElementById("start-btn").addEventListener("click", () => {
    state.phase = "quiz";
    renderQuestion();
  });
}

// ─── PART 1: QUESTIONS ──────────────────────────────
function renderQuestion() {
  const q = questions[state.qi];
  const existing = state.answers[q.id] ?? (q.type === "multi" ? [] : null);
  setPill(`Question ${state.qi + 1}/${questions.length}`);

  const hasAnswer = q.type === "multi"
    ? Array.isArray(existing) && existing.length > 0
    : existing !== null;

  app.innerHTML = `
    <div class="view">
      ${stepProgressHTML()}
      <h2>${q.title}</h2>
      <p class="helper">${q.helper}</p>
      <div class="option-grid cols-2" id="opts"></div>
      <div class="actions">
        ${state.qi > 0 ? '<button class="btn btn-secondary" id="back-btn">Back</button>' : ""}
        <button class="btn btn-primary" id="next-btn" ${hasAnswer ? "" : "disabled"}>Next</button>
      </div>
    </div>`;

  const wrap = document.getElementById("opts");
  const nextBtn = document.getElementById("next-btn");

  q.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option";
    btn.innerHTML = `<h4>${opt.label}</h4>`;

    const isSel = Array.isArray(existing) ? existing.includes(idx) : existing === idx;
    if (isSel) btn.classList.add("selected");

    btn.addEventListener("click", () => {
      if (q.type === "multi") {
        const cur = Array.isArray(state.answers[q.id]) ? [...state.answers[q.id]] : [];
        const fi = cur.indexOf(idx);
        if (fi > -1) cur.splice(fi, 1);
        else if (cur.length < q.max) cur.push(idx);
        state.answers[q.id] = cur;
      } else {
        state.answers[q.id] = idx;
      }
      renderQuestion(); // re-paint with selection state
    });

    wrap.appendChild(btn);
  });

  nextBtn.addEventListener("click", () => {
    scoreQuestion(q);
    if (state.qi < questions.length - 1) {
      state.qi++;
      renderQuestion();
    } else {
      finalizeResult();
      renderResult();
    }
  });

  document.getElementById("back-btn")?.addEventListener("click", () => {
    // undo scoring for current question if going back
    state.qi--;
    renderQuestion();
  });
}

function scoreQuestion(q) {
  const ans = state.answers[q.id];
  if (ans === undefined || ans === null) return;
  if (q.type === "multi") {
    ans.forEach((i) => { state.scores[q.options[i].key]++; });
  } else {
    state.scores[q.options[ans].key]++;
  }
}

function finalizeResult() {
  const sorted = Object.entries(state.scores).sort((a, b) => b[1] - a[1]);
  state.focusType = sorted[0][0];
}

// ─── PART 1 RESULT ──────────────────────────────────
function renderResult() {
  state.phase = "result";
  const p = archetypes[state.focusType];
  setPill(p.name);

  // full progress bar at 100%
  let dots = "";
  for (let i = 0; i < questions.length; i++) dots += '<div class="step-dot done"></div>';

  app.innerHTML = `
    <div class="view">
      <div class="step-progress">
        <div class="step-progress-header">
          <span class="step-label">Part 1 · Complete ✓</span>
          <span class="step-count">6/6</span>
        </div>
        <div class="step-dots">${dots}</div>
        <div class="step-bar"><div class="step-bar-fill" style="width:100%"></div></div>
      </div>

      <div class="result-card">
        <p class="eyebrow">Your Focus Type</p>
        <h2 class="result-name">${p.emoji} ${p.name}</h2>
        <p class="result-summary">${p.summary}</p>
        <div class="badge-row">
          <span class="badge">Personalised</span>
          <span class="badge">Science-backed</span>
        </div>
      </div>

      <h3 style="margin-top:16px;">Your recommended routine</h3>
      <ul class="checklist">
        ${p.routine.map((s) => `<li>${s}</li>`).join("")}
      </ul>

      <div class="notice">
        🍄 Suggested stack: <a class="product-link" target="_blank" rel="noopener noreferrer" href="${p.product.url}">${p.product.name}</a>
      </div>

      <div class="actions">
        <button class="btn btn-primary" id="deeper-btn">Go Deeper → 4 Puzzles</button>
        <button class="btn btn-secondary" id="restart-btn">Restart</button>
      </div>
    </div>`;

  document.getElementById("deeper-btn").addEventListener("click", () => {
    state.phase = "puzzles";
    state.pi = 0;
    state.pts = 0;
    renderPuzzle();
  });

  document.getElementById("restart-btn").addEventListener("click", resetAll);
}

// ─── PUZZLE TIMER ───────────────────────────────────
function startPuzzleTimer(onTimeout) {
  resetTimer();
  state.timeLeft = PUZZLE_TIME;

  state.timerId = setInterval(() => {
    state.timeLeft--;
    const timerEl = document.getElementById("ps-timer");
    if (!timerEl) return;

    const m = String(Math.floor(state.timeLeft / 60)).padStart(2, "0");
    const s = String(state.timeLeft % 60).padStart(2, "0");
    timerEl.textContent = `${m}:${s}`;

    if (state.timeLeft <= 20) timerEl.classList.add("is-low");
    if (state.timeLeft <= 0) { resetTimer(); onTimeout(); }
  }, 1000);
}

// ─── PUZZLE ROUTING ─────────────────────────────────
function renderPuzzle() {
  setPill(`Puzzle ${state.pi + 1}/4`);
  [renderSequencePuzzle, renderMathPuzzle, renderWordPuzzle, renderOddOneOutPuzzle][state.pi]();
}

function advancePuzzle() {
  state.pi++;
  if (state.pi > 3) { renderFinalScore(); return; }
  renderPuzzle();
}

// ─── PUZZLE COMPLETE / TIMEOUT ──────────────────────
function completePuzzle(pts) {
  resetTimer();

  // Track time taken
  const secsTaken = PUZZLE_TIME - state.timeLeft;
  const secsLeft = state.timeLeft;
  state.puzzleTimes.push(secsTaken);

  // Speed bonus
  const bonus = calcSpeedBonus(secsLeft);
  const bonusPts = bonus ? bonus.bonus : 0;
  state.pts += pts + bonusPts;
  state.totalBonus += bonusPts;

  // update points display live
  const ptsEl = document.getElementById("ps-points");
  if (ptsEl) ptsEl.textContent = state.pts;

  const isLast = state.pi >= 3;
  const bonusHTML = bonus
    ? `<p class="helper" style="margin-top:4px;color:var(--brand-deep);">🏆 Speed bonus: +${bonusPts} (${bonus.label} — ${secsTaken}s)</p>`
    : `<p class="helper" style="margin-top:4px;">Completed in ${secsTaken}s</p>`;

  app.innerHTML = `
    <div class="view">
      ${puzzleStatusHTML()}
      ${whyBannerHTML()}

      <div style="text-align:center; padding:20px 0;">
        <p class="score-label">Points earned</p>
        <p class="score-big">+${pts}${bonusPts ? ` <span style="font-size:22px;">+${bonusPts} bonus</span>` : ""}</p>
        ${bonusHTML}
        <p class="helper" style="margin-top:8px;">Total: ${state.pts}</p>
      </div>

      <div class="actions">
        <button class="btn btn-primary" id="next-puzzle">${isLast ? "See Final Results" : "Next Puzzle →"}</button>
      </div>
    </div>`;

  document.getElementById("next-puzzle").addEventListener("click", advancePuzzle);
}

function showTimeoutRecommendation() {
  resetTimer();
  // Record full time used (timed out = used all PUZZLE_TIME)
  state.puzzleTimes.push(PUZZLE_TIME);

  const rec = puzzleProducts[state.pi];
  const isLast = state.pi >= 3;

  app.innerHTML = `
    <div class="view">
      ${puzzleStatusHTML()}
      ${whyBannerHTML()}

      <h2>⏱ Time's up</h2>
      <p class="helper">No worries — your brain might just need a boost.</p>

      <div class="notice warn">
        Try this: <a class="product-link" href="${rec.url}" target="_blank" rel="noopener noreferrer">${rec.name}</a> — designed for exactly this kind of focus challenge.
      </div>

      <div class="actions">
        <button class="btn btn-primary" id="next-puzzle">${isLast ? "See Final Results" : "Next Puzzle →"}</button>
      </div>
    </div>`;

  document.getElementById("next-puzzle").addEventListener("click", advancePuzzle);
}

// ─── PUZZLE 1: SEQUENCE RECALL ──────────────────────
function renderSequencePuzzle() {
  const sequence = [1, 3, 2, 4, 1];
  const player = [];
  const tileLabels = ["🟢", "🔵", "🟡", "🟣"];
  let fails = 0;
  const MAX_FAILS = 5;
  let hintUsed = false;
  let hintActive = false;

  const patternStr = sequence.map(v => tileLabels[v - 1]).join("  →  ");

  app.innerHTML = `
    <div class="view">
      ${puzzleStatusHTML()}
      ${whyBannerHTML()}

      <h2>Sequence Recall</h2>
      <p class="helper">Memorise the pattern below, then tap it back in order.</p>
      <div class="notice" id="seq-notice">Pattern: <strong>${patternStr}</strong><br><small>Disappears in 5 seconds…</small></div>
      <div class="option-grid cols-2" id="seq-grid"></div>
      <p class="helper" id="seq-status">Tapped: 0 / ${sequence.length}</p>
      <div class="actions">
        <button class="btn btn-secondary" id="clear-seq">Reset Input</button>
        <button class="btn btn-secondary" id="hint-btn">💡 Hint</button>
      </div>
    </div>`;

  const grid = document.getElementById("seq-grid");
  const statusEl = document.getElementById("seq-status");
  const noticeEl = document.getElementById("seq-notice");
  const hintBtn = document.getElementById("hint-btn");

  function showPattern(duration) {
    hintActive = true;
    noticeEl.innerHTML = `Pattern: <strong>${patternStr}</strong><br><small>Disappears in ${Math.round(duration / 1000)} seconds…</small>`;
    setTimeout(() => {
      if (noticeEl) noticeEl.innerHTML = "Pattern hidden — tap from memory!";
      hintActive = false;
    }, duration);
  }

  // Hint button — one-time use, re-shows pattern for 5 seconds
  hintBtn.addEventListener("click", () => {
    if (hintUsed || hintActive) return;
    hintUsed = true;
    hintBtn.disabled = true;
    hintBtn.textContent = "Hint used";
    player.length = 0;
    statusEl.textContent = `Tapped: 0 / ${sequence.length}`;
    showPattern(5000);
  });

  for (let i = 1; i <= 4; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option";
    btn.style.textAlign = "center";
    btn.innerHTML = `<h4>${tileLabels[i - 1]}</h4>`;
    btn.addEventListener("click", () => {
      player.push(i);
      btn.classList.add("selected");
      setTimeout(() => btn.classList.remove("selected"), 200);
      statusEl.textContent = `Tapped: ${player.length} / ${sequence.length}`;

      if (player.length === sequence.length) {
        if (player.every((v, idx) => v === sequence[idx])) {
          completePuzzle(POINTS_PER_PUZZLE);
        } else {
          fails++;
          player.length = 0;

          if (fails >= MAX_FAILS) {
            // Too many wrong attempts — record time, skip ahead
            const secsTaken = PUZZLE_TIME - state.timeLeft;
            state.puzzleTimes.push(secsTaken);
            resetTimer();
            statusEl.textContent = "";
            noticeEl.innerHTML = "";
            app.innerHTML = `
              <div class="view">
                ${puzzleStatusHTML()}
                ${whyBannerHTML()}
                <h2>Oops — wrong sequence</h2>
                <p class="helper">No worries, let's move on to the next challenge.</p>
                <div class="actions">
                  <button class="btn btn-primary" id="next-puzzle">Next Puzzle →</button>
                </div>
              </div>`;
            document.getElementById("next-puzzle").addEventListener("click", advancePuzzle);
            return;
          }

          statusEl.textContent = `Wrong pattern — try again! (${fails}/${MAX_FAILS})`;
          grid.classList.add("flash-wrong");
          setTimeout(() => grid.classList.remove("flash-wrong"), 400);
        }
      }
    });
    grid.appendChild(btn);
  }

  document.getElementById("clear-seq").addEventListener("click", () => {
    player.length = 0;
    statusEl.textContent = `Tapped: 0 / ${sequence.length}`;
  });

  // Initial display — hide pattern after 5 seconds
  showPattern(5000);

  startPuzzleTimer(showTimeoutRecommendation);
}

// ─── PUZZLE 2: SPEED MATH ───────────────────────────
function renderMathPuzzle() {
  let cur = makeMathQ();
  let hits = 0;
  const needed = 5;

  app.innerHTML = `
    <div class="view">
      ${puzzleStatusHTML()}
      ${whyBannerHTML()}

      <h2>Speed Math</h2>
      <p class="helper">Solve ${needed} quick equations as fast as you can.</p>
      <h3 id="math-q" style="text-align:center;font-size:24px;margin:8px 0 14px;"></h3>
      <div class="option-grid cols-2" id="math-opts"></div>
      <p class="helper" id="math-status">Solved: 0/${needed}</p>
    </div>`;

  const qEl = document.getElementById("math-q");
  const optsEl = document.getElementById("math-opts");
  const statusEl = document.getElementById("math-status");

  function paint() {
    qEl.textContent = `${cur.a} ${cur.op} ${cur.b} = ?`;
    optsEl.innerHTML = "";
    cur.choices.forEach((c) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      btn.style.textAlign = "center";
      btn.innerHTML = `<h4>${c}</h4>`;
      btn.addEventListener("click", () => {
        if (c === cur.answer) {
          hits++;
          if (hits >= needed) { completePuzzle(POINTS_PER_PUZZLE); return; }
          cur = makeMathQ();
          statusEl.textContent = `Solved: ${hits}/${needed}`;
          paint();
        } else {
          btn.classList.add("flash-wrong");
          setTimeout(() => btn.classList.remove("flash-wrong"), 350);
          statusEl.textContent = `Solved: ${hits}/${needed} — not quite`;
        }
      });
      optsEl.appendChild(btn);
    });
  }

  paint();
  startPuzzleTimer(showTimeoutRecommendation);
}

function makeMathQ() {
  const a = rand(3, 19);
  const b = rand(2, 9);
  const op = Math.random() > 0.5 ? "+" : "−";
  const answer = op === "+" ? a + b : a - b;
  const wrong = new Set();
  while (wrong.size < 3) {
    const w = answer + rand(-5, 5);
    if (w !== answer) wrong.add(w);
  }
  const choices = [answer, ...wrong].sort(() => Math.random() - 0.5);
  return { a, b, op, answer, choices };
}

// ─── PUZZLE 3: WORD UNSCRAMBLE ──────────────────────
function renderWordPuzzle() {
  const rounds = [
    ["FOCUS", "CUSFO"],
    ["CALM",  "LMAC"],
    ["MIND",  "NDIM"],
    ["FLOW",  "WLFO"],
  ];
  let ri = 0;

  app.innerHTML = `
    <div class="view">
      ${puzzleStatusHTML()}
      ${whyBannerHTML()}

      <h2>Word Unscramble</h2>
      <p class="helper">Unscramble all 4 brain-related words.</p>
      <p class="scramble-display" id="scramble"></p>
      <input class="word-input" id="word-in" placeholder="Type your answer" autocomplete="off" autocapitalize="characters" />
      <p class="helper" id="word-status" style="margin-top:8px;">Word 1/4</p>
      <div class="actions">
        <button class="btn btn-primary" id="word-go">Submit</button>
      </div>
    </div>`;

  const scrambleEl = document.getElementById("scramble");
  const inputEl = document.getElementById("word-in");
  const statusEl = document.getElementById("word-status");

  function paint() {
    scrambleEl.textContent = rounds[ri][1];
    inputEl.value = "";
    inputEl.focus();
  }

  function submit() {
    if (inputEl.value.trim().toUpperCase() === rounds[ri][0]) {
      ri++;
      if (ri >= rounds.length) { completePuzzle(POINTS_PER_PUZZLE); return; }
      statusEl.textContent = `Word ${ri + 1}/4`;
      paint();
    } else {
      statusEl.textContent = `Word ${ri + 1}/4 — try again`;
      inputEl.classList.add("flash-wrong");
      setTimeout(() => inputEl.classList.remove("flash-wrong"), 350);
    }
  }

  document.getElementById("word-go").addEventListener("click", submit);
  inputEl.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });

  paint();
  startPuzzleTimer(showTimeoutRecommendation);
}

// ─── PUZZLE 4: ODD ONE OUT ──────────────────────────
function renderOddOneOutPuzzle() {
  const rounds = [
    ["🍄", "🍄", "🍄", "🍎", 3],
    ["🧠", "🧠", "💧", "🧠", 2],
    ["⚡", "⚡", "⚡", "🌙", 3],
    ["📘", "📘", "📘", "🎵", 3],
    ["☕", "☕", "🥤", "☕", 2],
  ];
  let solved = 0;

  app.innerHTML = `
    <div class="view">
      ${puzzleStatusHTML()}
      ${whyBannerHTML()}

      <h2>Odd One Out</h2>
      <p class="helper">Tap the icon that doesn't belong. 5 rounds.</p>
      <div class="option-grid cols-2" id="odd-grid"></div>
      <p class="helper" id="odd-status">Round 1/${rounds.length}</p>
    </div>`;

  const grid = document.getElementById("odd-grid");
  const statusEl = document.getElementById("odd-status");

  function loadRound() {
    const r = rounds[solved];
    grid.innerHTML = "";
    r.slice(0, 4).forEach((icon, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      btn.style.textAlign = "center";
      btn.innerHTML = `<h4 style="font-size:30px;">${icon}</h4>`;
      btn.addEventListener("click", () => {
        if (idx === r[4]) {
          solved++;
          if (solved >= rounds.length) { completePuzzle(POINTS_PER_PUZZLE); return; }
          statusEl.textContent = `Round ${solved + 1}/${rounds.length}`;
          loadRound();
        } else {
          btn.classList.add("flash-wrong");
          setTimeout(() => btn.classList.remove("flash-wrong"), 350);
          statusEl.textContent = `Round ${solved + 1}/${rounds.length} — not that one`;
        }
      });
      grid.appendChild(btn);
    });
  }

  loadRound();
  startPuzzleTimer(showTimeoutRecommendation);
}

// ─── SHARE HELPERS ──────────────────────────────────
const SHARE_URL = "https://www.myndmushrooms.co.nz";

function buildShareText(opts = {}) {
  const p = archetypes[state.focusType];
  const totalTime = state.puzzleTimes.reduce((a, b) => a + b, 0);
  const tier = getPerformanceTier();
  const nl = opts.newline || "\n";
  return [
    `${p.emoji} I'm ${p.name}!`,
    `Brain Performance: ${tier}`,
    `Score: ${state.pts} pts · ${totalTime}s total`,
    state.totalBonus > 0 ? `Speed bonus: +${state.totalBonus} pts` : null,
    ``,
    `Take the Mynd Focus Type Quiz to find yours:`,
    SHARE_URL,
  ].filter(Boolean).join(nl);
}

function getPerformanceTier() {
  return state.pts >= 140 ? "Locked In 🔒"
    : state.pts >= 100 ? "Sharp & Steady 🎯"
    : state.pts >= 60  ? "Building Momentum 🚀"
    : "Reset Mode 🔄";
}

// ─── CANVAS SHARE-CARD GENERATOR ────────────────────
function generateShareCard() {
  const p = archetypes[state.focusType];
  const totalTime = state.puzzleTimes.reduce((a, b) => a + b, 0);
  const tier = getPerformanceTier();
  const W = 1080, H = 1080;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");

  // Background
  ctx.fillStyle = "#375555";
  ctx.fillRect(0, 0, W, H);

  // Decorative circles
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = "#b5cfbc";
  ctx.beginPath(); ctx.arc(860, 180, 260, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(200, 880, 200, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Top pill — measure text first so pill fits
  ctx.font = "bold 20px Inter, system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  const pillText = "MYND FOCUS TYPE QUIZ";
  const pillW = ctx.measureText(pillText).width + 40;
  ctx.fillStyle = "#b5cfbc";
  roundRect(ctx, 60, 50, pillW, 48, 24);
  ctx.fill();
  ctx.fillStyle = "#375555";
  ctx.fillText(pillText, 80, 74);

  // --- Reset alignment for centered content ---
  ctx.textAlign = "center";

  // Emoji (large)
  ctx.textBaseline = "alphabetic";
  ctx.font = "120px system-ui, sans-serif";
  ctx.fillText(p.emoji, W / 2, 240);

  // Focus type name
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 56px Inter, system-ui, sans-serif";
  ctx.fillText(p.name, W / 2, 320);

  // Tier
  ctx.fillStyle = "#b5cfbc";
  ctx.font = "600 32px Inter, system-ui, sans-serif";
  ctx.fillText(tier, W / 2, 370);

  // Divider
  ctx.strokeStyle = "rgba(181,207,188,0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(240, 410); ctx.lineTo(W - 240, 410); ctx.stroke();

  // Score card area
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  roundRect(ctx, 140, 450, W - 280, 280, 24);
  ctx.fill();

  // Score number
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 110px Inter, system-ui, sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(`${state.pts}`, W / 2, 580);

  // POINTS label — well below the number
  ctx.fillStyle = "#b5cfbc";
  ctx.font = "bold 24px Inter, system-ui, sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText("POINTS", W / 2, 592);

  // Stats row
  ctx.textBaseline = "middle";
  ctx.font = "500 24px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  const statsY = 680;
  ctx.fillText(`${totalTime}s total`, W / 2 - 180, statsY);
  ctx.fillText("·", W / 2, statsY);
  ctx.fillText(`+${state.totalBonus} bonus`, W / 2 + 180, statsY);

  // Summary (wrapped)
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "italic 24px Inter, system-ui, sans-serif";
  const lines = wrapText(ctx, p.summary, W - 240);
  let sy = 790;
  lines.forEach((line) => { ctx.fillText(line, W / 2, sy); sy += 34; });

  // Bottom CTA pill
  ctx.textBaseline = "middle";
  const ctaText = "myndmushrooms.co.nz";
  ctx.font = "bold 22px Inter, system-ui, sans-serif";
  const ctaW = ctx.measureText(ctaText).width + 48;
  ctx.fillStyle = "#b5cfbc";
  roundRect(ctx, (W - ctaW) / 2, H - 100, ctaW, 52, 26);
  ctx.fill();
  ctx.fillStyle = "#375555";
  ctx.fillText(ctaText, W / 2, H - 74);

  return c;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = []; let line = "";
  words.forEach((word) => {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth) {
      lines.push(line); line = word;
    } else { line = test; }
  });
  if (line) lines.push(line);
  return lines;
}

function downloadShareCard() {
  const canvas = generateShareCard();
  const link = document.createElement("a");
  link.download = "mynd-focus-result.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

async function nativeShare() {
  try {
    const canvas = generateShareCard();
    const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
    const file = new File([blob], "mynd-focus-result.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "My Mynd Focus Type Result",
        text: buildShareText(),
        files: [file],
      });
      return;
    }
  } catch (_) { /* user cancelled or unsupported */ }
  // Fallback: just download
  downloadShareCard();
}

function copyResultsToClipboard(btn) {
  navigator.clipboard.writeText(buildShareText()).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = "✅ Copied!";
    setTimeout(() => { btn.innerHTML = orig; }, 2000);
  });
}

// ─── TOAST ───────────────────────────────────────
function showToast(msg, duration = 3500) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  container.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 300);
  }, duration);
}

// ─── SOCIAL SHARE (download card + copy + open platform) ───
function socialShare(platform) {
  // Step 1: download the result card
  downloadShareCard();

  // Step 2: copy text to clipboard
  const text = buildShareText({ newline: platform === "x" ? " | " : "\n" });
  navigator.clipboard.writeText(text).catch(() => {});

  // Step 3: open the platform
  const shareUrl = encodeURIComponent(SHARE_URL);
  const urls = {
    fb: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    x:  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    li: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
  };
  if (urls[platform]) window.open(urls[platform], "_blank", "noopener");

  // Step 4: toast
  showToast("✅ Result card downloaded & text copied — attach the image to your post!");
}

// ─── FINAL SCORE ────────────────────────────────────
function renderFinalScore() {
  resetTimer();
  state.phase = "final";
  const p = archetypes[state.focusType];
  const totalTime = state.puzzleTimes.reduce((a, b) => a + b, 0);
  const maxPossible = (POINTS_PER_PUZZLE * 4) + (SPEED_BONUS[0].bonus * 4); // 160
  const tier = getPerformanceTier();
  setPill("Results");

  let dots = "";
  for (let i = 0; i < 4; i++) dots += '<div class="puzzle-dot done"></div>';

  // Leaderboard rows
  const puzzleNames = ["Sequence Recall", "Speed Math", "Word Unscramble", "Odd One Out"];
  let boardRows = "";
  for (let i = 0; i < 4; i++) {
    const t = state.puzzleTimes[i];
    if (t !== undefined) {
      const b = calcSpeedBonus(PUZZLE_TIME - t);
      boardRows += `<tr><td>${puzzleNames[i]}</td><td>${t}s</td><td>${b ? "+" + b.bonus + " " + b.label : "—"}</td></tr>`;
    } else {
      boardRows += `<tr><td>${puzzleNames[i]}</td><td>—</td><td>—</td></tr>`;
    }
  }

  app.innerHTML = `
    <div class="view">
      <div class="puzzle-status">
        <div class="puzzle-status-block">
          <span class="ps-label">Status</span>
          <span class="ps-value">Done ✓</span>
        </div>
        <div class="puzzle-status-block center">
          <span class="ps-label">Focus Type</span>
          <span class="ps-value" style="font-size:14px;">${p.name}</span>
        </div>
        <div class="puzzle-status-block right">
          <span class="ps-label">Score</span>
          <span class="ps-value">${state.pts}</span>
        </div>
      </div>
      <div class="puzzle-dots">${dots}</div>

      <div style="text-align:center;padding:8px 0 12px;">
        <p class="score-label">Your brain performance tier</p>
        <p class="score-big">${tier}</p>
        <p class="helper">${state.pts} points · ${totalTime}s total${state.totalBonus > 0 ? " · " + state.totalBonus + " bonus pts" : ""}</p>
      </div>

      <!-- Leaderboard -->
      <div class="leaderboard">
        <h3>🏆 Your Scorecard</h3>
        <table class="lb-table">
          <thead><tr><th>Puzzle</th><th>Time</th><th>Bonus</th></tr></thead>
          <tbody>${boardRows}</tbody>
          <tfoot><tr><td><strong>Total</strong></td><td><strong>${totalTime}s</strong></td><td><strong>+${state.totalBonus}</strong></td></tr></tfoot>
        </table>
      </div>

      <div class="result-card" style="margin-top:14px;">
        <h3 style="color:var(--brand-deep);">${p.emoji} ${p.name} — Next steps</h3>
        <p class="result-summary">${p.summary}</p>
        <ul class="checklist">
          ${p.routine.map((s) => `<li>${s}</li>`).join("")}
        </ul>
      </div>

      <div class="notice">
        🍄 Product recommendation: <a class="product-link" target="_blank" rel="noopener noreferrer" href="${p.product.url}">${p.product.name}</a>
      </div>

      <!-- Share card preview -->
      <div class="share-section">
        <p class="share-heading">Share your result</p>
        <div id="share-card-preview"></div>

        <div class="share-actions">
          <button class="btn btn-primary" id="share-native-btn">📤 Share Result</button>
          <button class="btn btn-outline" id="download-card-btn">⬇️ Download Result Card</button>
          <button class="btn btn-outline" id="copy-result-btn">📋 Copy Results</button>
        </div>

        <p class="share-or">or post on</p>
        <div class="share-buttons">
          <button class="share-btn share-fb" data-platform="fb" title="Share on Facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </button>
          <button class="share-btn share-x" data-platform="x" title="Share on X">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </button>
          <button class="share-btn share-li" data-platform="li" title="Share on LinkedIn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </button>
          <a class="share-btn share-email" href="mailto:?subject=${encodeURIComponent('My Mynd Focus Type Result')}&body=${encodeURIComponent(buildShareText())}" title="Share via Email">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
          </a>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-primary" id="restart-btn">Retake Quiz</button>
      </div>
    </div>`;

  document.getElementById("restart-btn").addEventListener("click", resetAll);

  // Render share card preview
  const preview = document.getElementById("share-card-preview");
  if (preview) {
    const card = generateShareCard();
    card.style.width = "100%";
    card.style.height = "auto";
    card.style.borderRadius = "12px";
    preview.appendChild(card);
  }

  // Wire share actions
  const dlBtn = document.getElementById("download-card-btn");
  if (dlBtn) dlBtn.addEventListener("click", downloadShareCard);

  const nativeBtn = document.getElementById("share-native-btn");
  if (nativeBtn) nativeBtn.addEventListener("click", nativeShare);

  const copyBtn = document.getElementById("copy-result-btn");
  if (copyBtn) copyBtn.addEventListener("click", () => copyResultsToClipboard(copyBtn));

  // Wire social share buttons (FB, X, LinkedIn)
  document.querySelectorAll(".share-btn[data-platform]").forEach((btn) => {
    btn.addEventListener("click", () => socialShare(btn.dataset.platform));
  });
}

// ─── RESET ──────────────────────────────────────────
function resetAll() {
  resetTimer();
  Object.assign(state, {
    phase: "intro", qi: 0, answers: {},
    scores: { tabSwitcher: 0, friedFounder: 0, overthinker: 0, creativeSprinter: 0 },
    focusType: null, pi: 0, pts: 0, timeLeft: PUZZLE_TIME,
    puzzleTimes: [], totalBonus: 0,
  });
  renderIntro();
}

// ─── BOOT ───────────────────────────────────────────
window.addEventListener("beforeunload", resetTimer);
renderIntro();
