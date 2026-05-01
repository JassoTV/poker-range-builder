'use strict';

// ── SHARED DATA (mirrors app.js — no import in vanilla JS) ───────────────────

const FR = navigator.language?.startsWith('fr');

const RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];

const POSITIONS = ['BTN','CO','HJ','UTG','SB','BB'];

const SITUATIONS = {
  BTN: [
    { id:'open',     label: FR ? 'Open (1er)'      : 'Open (1st in)' },
    { id:'vs_limp',  label: 'vs Limp' },
    { id:'vs_raise', label: 'vs Raise' },
  ],
  CO: [
    { id:'open',     label: FR ? 'Open (1er)'      : 'Open (1st in)' },
    { id:'vs_limp',  label: 'vs Limp' },
    { id:'vs_raise', label: 'vs Raise' },
  ],
  HJ: [
    { id:'open',     label: FR ? 'Open (1er)'      : 'Open (1st in)' },
    { id:'vs_limp',  label: 'vs Limp' },
    { id:'vs_raise', label: 'vs Raise' },
  ],
  UTG: [
    { id:'open',     label: FR ? 'Open (1er)'      : 'Open (1st in)' },
    { id:'vs_limp',  label: 'vs Limp' },
    { id:'vs_raise', label: 'vs Raise' },
  ],
  SB: [
    { id:'open_hu',    label: 'Open HU vs BB' },
    { id:'open_multi', label: FR ? 'Open (multi)'  : 'Open (multi)' },
    { id:'vs_raise',   label: 'vs Raise' },
  ],
  BB: [
    { id:'vs_open',  label: 'vs Open' },
    { id:'vs_limp',  label: FR ? 'vs Limp (multi)' : 'vs Limp (multi)' },
    { id:'vs_raise', label: 'vs Raise' },
  ],
};

const ACTIONS = [
  { id:0, label: '',              bg:'#1e1e1e', text:'#444' },
  { id:1, label: 'Raise / Open', bg:'#1a3d1a', text:'#7ecc7e' },
  { id:2, label: 'Call / Limp',  bg:'#3d2e08', text:'#e8c040' },
  { id:3, label: '3-Bet',        bg:'#0d2444', text:'#60b0f0' },
  { id:4, label: 'Fold',         bg:'#3d0e0e', text:'#f08080' },
];

// ── QUIZ STATE ────────────────────────────────────────────────────────────────

let Q_TOTAL      = 10;
let infiniteMode = false;
let questions    = [];
let currentQ     = 0;
let score        = 0;
let answered     = false;
let missed       = [];   // { q, chosenId }

// ── POOL ─────────────────────────────────────────────────────────────────────

function buildPool() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('prb_state') || '{}'); } catch (_) {}
  const pool = [];
  POSITIONS.forEach(pos => {
    SITUATIONS[pos].forEach(sit => {
      const hands = saved[`${pos}_${sit.id}`];
      if (!hands) return;
      Object.entries(hands).forEach(([hand, actionId]) => {
        if (actionId > 0) pool.push({ pos, sit, hand, actionId });
      });
    });
  });
  return pool;
}

function drawQuestions(pool) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const count = infiniteMode ? Math.max(60, pool.length * 4) : Q_TOTAL;
  const out = [];
  for (let i = 0; i < count; i++) out.push(shuffled[i % shuffled.length]);
  return out;
}

// ── SCREENS ───────────────────────────────────────────────────────────────────

function show(id) {
  ['quizStart','quizQuestion','quizResults','quizEmpty'].forEach(s => {
    const el = document.getElementById(s);
    if (el) el.style.display = (s === id) ? '' : 'none';
  });
}

// ── START ─────────────────────────────────────────────────────────────────────

function startQuiz() {
  const pool = buildPool();
  if (pool.length === 0) { show('quizEmpty'); return; }
  questions = drawQuestions(pool);
  currentQ  = 0;
  score     = 0;
  missed    = [];
  answered  = false;
  renderQuestion();
}

// ── QUESTION ──────────────────────────────────────────────────────────────────

function renderQuestion() {
  answered = false;
  const q  = questions[currentQ];

  // Progress + live score
  const prog = infiniteMode
    ? `${currentQ + 1} / ∞`
    : `${currentQ + 1} / ${Q_TOTAL}`;
  document.getElementById('qProgress').textContent = prog;
  document.getElementById('qScoreLive').textContent = `${score} ✓`;

  // Context
  document.getElementById('qContext').innerHTML =
    `<strong>${q.pos}</strong> — ${q.sit.label}`;

  // Hand (large, coloured by type)
  const handEl   = document.getElementById('qHand');
  handEl.textContent = q.hand;
  handEl.className   = 'quiz-hand '
    + (q.hand.length === 2   ? 'hand-pair'
     : q.hand.endsWith('s') ? 'hand-suited'
     :                        'hand-offsuit');

  // Prompt
  document.getElementById('qPrompt').textContent =
    FR ? 'Quelle action ?' : 'What action?';

  // Action buttons
  const wrap = document.getElementById('qActions');
  wrap.innerHTML = '';
  ACTIONS.slice(1).forEach(action => {
    const btn = document.createElement('button');
    btn.className = 'quiz-action-btn';
    btn.textContent = action.label;
    btn.dataset.id  = action.id;
    btn.style.setProperty('--abg',  action.bg);
    btn.style.setProperty('--atxt', action.text);
    btn.addEventListener('click', () => handleAnswer(action.id));
    wrap.appendChild(btn);
  });

  // Hide feedback + next/stop
  document.getElementById('qFeedback').style.display = 'none';
  document.getElementById('btnNext').style.display   = 'none';
  const stopBtn = document.getElementById('btnStop');
  if (stopBtn) stopBtn.style.display = infiniteMode ? '' : 'none';

  show('quizQuestion');
}

// ── ANSWER ────────────────────────────────────────────────────────────────────

function handleAnswer(chosenId) {
  if (answered) return;
  answered = true;

  const q       = questions[currentQ];
  const correct = chosenId === q.actionId;
  if (correct) score++;
  else         missed.push({ q, chosenId });

  // Update live score immediately
  document.getElementById('qScoreLive').textContent = `${score} ✓`;

  // Mark buttons
  document.querySelectorAll('.quiz-action-btn').forEach(btn => {
    btn.disabled = true;
    const id = parseInt(btn.dataset.id);
    if (id === q.actionId)    btn.classList.add('btn-correct');
    else if (id === chosenId) btn.classList.add('btn-wrong');
  });

  // Feedback banner
  const fb    = document.getElementById('qFeedback');
  const label = ACTIONS[q.actionId].label;
  fb.className  = 'quiz-feedback ' + (correct ? 'fb-correct' : 'fb-wrong');
  fb.textContent = correct
    ? (FR ? `✓ Correct — ${label}` : `✓ Correct — ${label}`)
    : (FR ? `✗ Incorrect — Bonne réponse : ${label}` : `✗ Wrong — Correct answer: ${label}`);
  fb.style.display = '';

  // Next / finish button
  const nxt  = document.getElementById('btnNext');
  nxt.style.display = '';
  const isLast = !infiniteMode && currentQ === Q_TOTAL - 1;
  nxt.textContent = isLast
    ? (FR ? 'Voir le résultat →' : 'See results →')
    : (FR ? 'Suivant →'          : 'Next →');
}

// ── RESULTS ───────────────────────────────────────────────────────────────────

function showResults() {
  const total = infiniteMode ? currentQ : Q_TOTAL;
  const pct   = total > 0 ? score / total : 0;

  document.getElementById('qScoreNum').textContent = `${score} / ${total}`;

  let msg;
  if (pct >= 1)        msg = FR ? 'Parfait — tu connais tes ranges par cœur.' : 'Perfect — you know your ranges cold.';
  else if (pct >= 0.8) msg = FR ? 'Très bien — quelques spots à revoir.'     : 'Great — a few spots to review.';
  else if (pct >= 0.6) msg = FR ? 'Pas mal, continue à travailler.'           : 'Not bad, keep drilling.';
  else                  msg = FR ? 'Retourne configurer tes ranges et réessaie.' : 'Go configure your ranges and try again.';
  document.getElementById('qScoreMsg').textContent = msg;

  // Missed hands list
  const missedEl = document.getElementById('qMissed');
  if (missedEl) {
    if (missed.length === 0) {
      missedEl.innerHTML = `<p class="missed-none">${FR ? 'Aucune erreur 🎉' : 'No mistakes 🎉'}</p>`;
    } else {
      const header = FR
        ? `<p class="missed-header">${missed.length} erreur${missed.length > 1 ? 's' : ''} :</p>`
        : `<p class="missed-header">${missed.length} mistake${missed.length > 1 ? 's' : ''} :</p>`;
      const items = missed.map(m => {
        const correctLabel = ACTIONS[m.q.actionId].label;
        const handClass    = m.q.hand.length === 2 ? 'hand-pair'
                           : m.q.hand.endsWith('s') ? 'hand-suited'
                           : 'hand-offsuit';
        return `<div class="missed-item">
          <span class="missed-hand ${handClass}">${m.q.hand}</span>
          <span class="missed-ctx">${m.q.pos} — ${m.q.sit.label}</span>
          <span class="missed-answer">→ ${correctLabel}</span>
        </div>`;
      }).join('');
      missedEl.innerHTML = header + `<div class="missed-list">${items}</div>`;
    }
  }

  show('quizResults');
}

// ── COUNT SELECTOR ────────────────────────────────────────────────────────────

document.querySelectorAll('.quiz-count-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.quiz-count-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const val = parseInt(btn.dataset.count, 10);
    if (val === 0) {
      infiniteMode = true;
      Q_TOTAL      = Infinity;
    } else {
      infiniteMode = false;
      Q_TOTAL      = val;
    }
  });
});

// ── INIT ─────────────────────────────────────────────────────────────────────

document.getElementById('btnStartQuiz').addEventListener('click', startQuiz);

document.getElementById('btnNext').addEventListener('click', () => {
  currentQ++;
  if (!infiniteMode && currentQ >= Q_TOTAL) {
    showResults();
  } else if (currentQ >= questions.length) {
    showResults(); // end of infinite batch
  } else {
    renderQuestion();
  }
});

document.getElementById('btnStop')?.addEventListener('click', showResults);

document.getElementById('btnRestart').addEventListener('click', startQuiz);
