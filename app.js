'use strict';

// ── DATA ────────────────────────────────────────────────────────────────────

const RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];

const POSITIONS = ['BTN','CO','HJ','UTG','SB','BB'];

const SITUATIONS = {
  BTN: [
    { id:'open',     label:'Open (premier)' },
    { id:'vs_limp',  label:'Face à un limp' },
    { id:'vs_raise', label:'Face à une relance' },
  ],
  CO: [
    { id:'open',     label:'Open (premier)' },
    { id:'vs_limp',  label:'Face à un limp' },
    { id:'vs_raise', label:'Face à une relance' },
  ],
  HJ: [
    { id:'open',     label:'Open (premier)' },
    { id:'vs_limp',  label:'Face à un limp' },
    { id:'vs_raise', label:'Face à une relance' },
  ],
  UTG: [
    { id:'open',     label:'Open (premier)' },
    { id:'vs_limp',  label:'Face à un limp' },
    { id:'vs_raise', label:'Face à une relance' },
  ],
  SB: [
    { id:'open_hu',    label:'Open HU vs BB' },
    { id:'open_multi', label:'Open (multi)' },
    { id:'vs_raise',   label:'Face à une relance' },
  ],
  BB: [
    { id:'vs_open',  label:'Face à un open' },
    { id:'vs_limp',  label:'Face à un limp (multi)' },
    { id:'vs_raise', label:'Face à une relance' },
  ],
};

const CTX = {
  open:       (antes) => antes
    ? 'Open — Antes en jeu : range plus large justifiée (+2-3 %). La dead money augmente la valeur d\'une relance.'
    : 'Open — Pas d\'antes : jouer solide. Représenter une main forte, surtout en early position.',
  open_hu:    ()      => 'SB vs BB seul — Battle de blindes. Range très large possible. Raise-or-fold recommandé.',
  open_multi: (antes) => antes
    ? 'SB multi-joueurs avec antes — Serrer légèrement vs HU, position difficile postflop.'
    : 'SB multi-joueurs sans antes — Range serrée. Tu seras hors position postflop systématiquement.',
  vs_limp:    ()      => 'Isolation raise ou fold. Objectif : jouer en tête-à-tête ou nettoyer la table. Ne pas limp derrière sans raison.',
  vs_raise:   ()      => '3-Bet ou fold — Philosophie Raise-or-Fold. 3-Bet les mains fortes, fold le reste. Pas de call sans pot odds excellents.',
  vs_open:    ()      => 'BB face à un open — Tu as déjà investi 1 BB. Défends plus large qu\'en SB. Call ou 3-bet selon ta main et la position de l\'ouvreur.',
};

// action 0 = empty (not shown in legend)
const ACTIONS = [
  { id:0, label:'Vide',         bg:'#1e1e1e', text:'#444' },
  { id:1, label:'Raise / Open', bg:'#1a3d1a', text:'#7ecc7e' },
  { id:2, label:'Call / Limp',  bg:'#3d2e08', text:'#e8c040' },
  { id:3, label:'3-Bet',        bg:'#0d2444', text:'#60b0f0' },
  { id:4, label:'Fold',         bg:'#3d0e0e', text:'#f08080' },
];

// ── STATE ───────────────────────────────────────────────────────────────────

let curPos    = 'BTN';
let curSit    = 'open';
let curAction = 1;
let mouseDown = false;
let firstAction = null;

const rangeState = {};   // { stateKey: { handKey: actionId } }
const notes      = {};   // { stateKey: string }

// ── HELPERS ─────────────────────────────────────────────────────────────────

function stateKey() {
  const suffix = document.getElementById('antesChk').checked ? '_antes' : '';
  return `${curPos}_${curSit}${suffix}`;
}

function cellKey(r, c) {
  const a = RANKS[r], b = RANKS[c];
  if (r === c) return a + a;
  if (r < c)   return a + b + 's';
  return b + a + 'o';
}

function combos(k) {
  return k[0] === k[1] ? 6 : k.endsWith('s') ? 4 : 12;
}

function situationHasHands(pos, sitId, suffix) {
  const sk = `${pos}_${sitId}${suffix}`;
  const s  = rangeState[sk];
  if (!s) return false;
  return Object.values(s).some(v => v > 0);
}

// ── BUILD UI ─────────────────────────────────────────────────────────────────

function buildPosTabs() {
  const container = document.getElementById('posTabs');
  container.innerHTML = '';
  POSITIONS.forEach(pos => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (pos === curPos ? ' pos-active' : '');
    btn.textContent = pos;
    btn.addEventListener('click', () => {
      curPos = pos;
      curSit = SITUATIONS[pos][0].id;
      buildPosTabs();
      buildSitTabs();
      buildNotesGrid();
      renderAll();
    });
    container.appendChild(btn);
  });
}

function buildSitTabs() {
  const container = document.getElementById('sitTabs');
  container.innerHTML = '';
  const antes = document.getElementById('antesChk').checked;
  const suffix = antes ? '_antes' : '';

  SITUATIONS[curPos].forEach(sit => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (sit.id === curSit ? ' sit-active' : '');
    btn.textContent = sit.label;

    if (situationHasHands(curPos, sit.id, suffix)) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = '✓';
      btn.appendChild(badge);
    }

    btn.addEventListener('click', () => {
      curSit = sit.id;
      buildSitTabs();
      renderAll();
    });
    container.appendChild(btn);
  });
}

function buildLegend() {
  const container = document.getElementById('legend');
  container.innerHTML = '';
  ACTIONS.slice(1).forEach(action => {
    const el = document.createElement('div');
    el.className = 'leg' + (action.id === curAction ? ' sel' : '');
    el.innerHTML = `<div class="dot" style="background:${action.bg};border:1px solid #444"></div>${action.label}`;
    el.addEventListener('click', () => {
      curAction = action.id;
      buildLegend();
    });
    container.appendChild(el);
  });
}

function buildGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  // top-left corner
  grid.appendChild(document.createElement('div'));

  // column headers
  RANKS.forEach(r => {
    const h = document.createElement('div');
    h.className = 'hdr';
    h.textContent = r;
    grid.appendChild(h);
  });

  // rows
  RANKS.forEach((ra, r) => {
    const rh = document.createElement('div');
    rh.className = 'hdr';
    rh.textContent = ra;
    grid.appendChild(rh);

    RANKS.forEach((_, c) => {
      const k    = cellKey(r, c);
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.key = k;

      const lbl = document.createElement('div');
      lbl.className = 'cell-lbl';
      lbl.textContent = k;
      cell.appendChild(lbl);

      cell.addEventListener('mousedown', e => {
        mouseDown = true;
        const cur = (rangeState[stateKey()] || {})[k] || 0;
        firstAction = e.button === 2 ? 0 : (cur === curAction ? 0 : curAction);
        applyCell(k, firstAction);
        e.preventDefault();
      });
      cell.addEventListener('mouseenter', () => {
        if (mouseDown) applyCell(k, firstAction);
      });
      cell.addEventListener('contextmenu', e => {
        e.preventDefault();
        applyCell(k, 0);
      });

      grid.appendChild(cell);
    });
  });

  document.addEventListener('mouseup', () => {
    mouseDown   = false;
    firstAction = null;
  });
}

function buildNotesGrid() {
  const container = document.getElementById('notesGrid');
  container.innerHTML = '';

  SITUATIONS[curPos].forEach(sit => {
    ['', '_antes'].forEach(suffix => {
      const nk   = `${curPos}_${sit.id}${suffix}`;
      const card = document.createElement('div');
      card.className = 'note-card';

      const label = document.createElement('label');
      label.textContent = sit.label + (suffix ? '  (antes)' : '');

      const ta = document.createElement('textarea');
      ta.placeholder = 'Notes, ajustements, leaks observés…';
      ta.value = notes[nk] || '';
      ta.addEventListener('input', () => { notes[nk] = ta.value; save(); });

      card.appendChild(label);
      card.appendChild(ta);
      container.appendChild(card);
    });
  });
}

// ── RENDER ───────────────────────────────────────────────────────────────────

function applyCell(k, aid) {
  const sk = stateKey();
  if (!rangeState[sk]) rangeState[sk] = {};
  rangeState[sk][k] = aid;
  renderCell(k);
  updateStat();
  buildSitTabs(); // refresh badges
  save();
}

function renderCell(k) {
  const cell = document.querySelector(`[data-key="${k}"]`);
  if (!cell) return;
  const aid    = (rangeState[stateKey()] || {})[k] || 0;
  const action = ACTIONS[aid];
  cell.style.background = action.bg;
  const lbl = cell.querySelector('.cell-lbl');
  if (lbl) lbl.style.color = action.text;
}

function renderAll() {
  RANKS.forEach((_, r) => RANKS.forEach((__, c) => renderCell(cellKey(r, c))));
  updateStat();
  updateCtx();
}

function updateStat() {
  let total = 0, sel = 0;
  RANKS.forEach((_, r) => RANKS.forEach((__, c) => {
    const k = cellKey(r, c);
    total += combos(k);
    if (((rangeState[stateKey()] || {})[k] || 0) > 0) sel += combos(k);
  }));
  document.getElementById('stat').innerHTML =
    `<strong>${((sel / total) * 100).toFixed(1)}%</strong> — <strong>${sel}</strong> combos`;
}

function updateCtx() {
  const antes = document.getElementById('antesChk').checked;
  const fn    = CTX[curSit] || CTX['open'];
  document.getElementById('ctxBox').textContent = fn(antes);
}

// ── ACTIONS ──────────────────────────────────────────────────────────────────

function clearCurrent() {
  rangeState[stateKey()] = {};
  renderAll();
  buildSitTabs();
  save();
}

function handsForAction(sk, actionId) {
  return RANKS.flatMap((_, r) =>
    RANKS.flatMap((__, c) => {
      const k = cellKey(r, c);
      return ((rangeState[sk] || {})[k] || 0) === actionId ? [k] : [];
    })
  );
}

function buildExportLines(sk, titleLine) {
  const lines = [titleLine];
  ACTIONS.slice(1).forEach(a => {
    const hands = handsForAction(sk, a.id);
    if (hands.length) lines.push(`${a.label} : ${hands.join(', ')}`);
  });
  if (notes[sk]) lines.push(`\nNotes : ${notes[sk]}`);
  return lines;
}

function showExport(lines) {
  const area = document.getElementById('exportArea');
  document.getElementById('exportText').textContent = lines.join('\n');
  area.style.display = 'block';
  area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function toggleExport() {
  const area = document.getElementById('exportArea');
  if (area.style.display === 'block') { area.style.display = 'none'; return; }
  const antes    = document.getElementById('antesChk').checked;
  const sitLabel = SITUATIONS[curPos].find(x => x.id === curSit)?.label || curSit;
  const title    = `## Ranges — ${curPos} / ${sitLabel}${antes ? ' (antes)' : ''}`;
  showExport(buildExportLines(stateKey(), title));
}

function exportAll() {
  const lines = ['# Toutes mes ranges poker\n'];
  POSITIONS.forEach(pos => {
    lines.push(`## ${pos}`);
    SITUATIONS[pos].forEach(sit => {
      ['', '_antes'].forEach(suffix => {
        const sk    = `${pos}_${sit.id}${suffix}`;
        const title = `### ${sit.label}${suffix ? ' (antes)' : ''}`;
        const sub   = buildExportLines(sk, title);
        if (sub.length > 1) { lines.push(''); lines.push(...sub); }
      });
    });
    lines.push('');
  });
  showExport(lines);
}

function copyExport() {
  const text = document.getElementById('exportText').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('btnCopy');
    btn.textContent = 'Copié ✓';
    setTimeout(() => { btn.textContent = 'Copier'; }, 1500);
  });
}

// ── PNG EXPORT ────────────────────────────────────────────────────────────────

function exportPNG() {
  const CELL  = 44;
  const HDR   = 22;
  const GAP   = 2;
  const N     = 13;
  const W     = HDR + N * (CELL + GAP);
  const H     = HDR + N * (CELL + GAP);

  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f0f0f';
  ctx.fillRect(0, 0, W, H);

  ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign   = 'center';
  ctx.textBaseline = 'middle';

  // headers
  ctx.fillStyle = '#555';
  RANKS.forEach((r, i) => {
    const cx = HDR + i * (CELL + GAP) + CELL / 2;
    const cy = HDR + i * (CELL + GAP) + CELL / 2;
    ctx.fillText(r, cx, HDR / 2);
    ctx.fillText(r, HDR / 2, cy);
  });

  // cells
  const sk = stateKey();
  RANKS.forEach((_, r) => {
    RANKS.forEach((__, c) => {
      const k      = cellKey(r, c);
      const aid    = (rangeState[sk] || {})[k] || 0;
      const action = ACTIONS[aid];
      const x      = HDR + c * (CELL + GAP);
      const y      = HDR + r * (CELL + GAP);

      // background
      ctx.fillStyle = action.bg;
      ctx.beginPath();
      ctx.roundRect(x, y, CELL, CELL, 2);
      ctx.fill();

      // label
      ctx.font      = '9px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillStyle = action.text;
      ctx.fillText(k, x + CELL / 2, y + CELL / 2);
    });
  });

  const antes    = document.getElementById('antesChk').checked;
  const sitLabel = SITUATIONS[curPos].find(x => x.id === curSit)?.label || curSit;
  const filename = `range_${curPos}_${curSit}${antes ? '_antes' : ''}.png`;

  const link    = document.createElement('a');
  link.download = filename;
  link.href     = canvas.toDataURL('image/png');
  link.click();
}

// ── SAVE / LOAD ───────────────────────────────────────────────────────────────

function save() {
  try {
    localStorage.setItem('prb_state', JSON.stringify(rangeState));
    localStorage.setItem('prb_notes', JSON.stringify(notes));
    const t = new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
    document.getElementById('saveStatus').textContent = 'Sauvegardé à ' + t;
  } catch (_) {}
}

function load() {
  try {
    const s = localStorage.getItem('prb_state');
    const n = localStorage.getItem('prb_notes');
    if (s) Object.assign(rangeState, JSON.parse(s));
    if (n) Object.assign(notes, JSON.parse(n));
    document.getElementById('saveStatus').textContent = 'Ranges chargées ✓';
  } catch (_) {
    document.getElementById('saveStatus').textContent = 'Nouveau fichier';
  }
}

// ── INIT ──────────────────────────────────────────────────────────────────────

load();
buildPosTabs();
buildSitTabs();
buildLegend();
buildGrid();
buildNotesGrid();
renderAll();

document.getElementById('antesChk').addEventListener('change', () => {
  buildSitTabs();
  renderAll();
});
document.getElementById('btnClear').addEventListener('click', clearCurrent);
document.getElementById('btnExport').addEventListener('click', toggleExport);
document.getElementById('btnExportAll').addEventListener('click', exportAll);
document.getElementById('btnPng').addEventListener('click', exportPNG);
document.getElementById('btnCopy').addEventListener('click', copyExport);
