'use strict';

// ── I18N ─────────────────────────────────────────────────────────────────────

const FR = navigator.language?.startsWith('fr');

const T = {
  headerSubtitle:   FR ? 'Construis et mémorise tes ranges préflop par position'
                       : 'Build and memorize your preflop ranges by position',
  posLabel:         FR ? 'Position'                  : 'Position',
  sitLabel:         FR ? 'Situation'                 : 'Situation',
  antesLabel:       FR ? 'Antes en jeu'              : 'Antes in play',
  btnClear:         FR ? 'Effacer'                   : 'Clear',
  btnExport:        FR ? 'Export texte'              : 'Export text',
  btnExportAll:     FR ? 'Export tout'               : 'Export all',
  btnPng:           'Export PNG',
  btnExportJson:    'Export JSON',
  btnImportJson:    'Import JSON',
  exportTitle:      FR ? 'Copier ce texte'           : 'Copy',
  copyBtn:          FR ? 'Copier'                    : 'Copy',
  copiedBtn:        FR ? 'Copié ✓'                   : 'Copied ✓',
  notesTitle:       FR ? 'Notes par situation'       : 'Notes per situation',
  notesPlaceholder: FR ? 'Notes, ajustements, leaks…': 'Notes, adjustments, leaks…',
  savedAt:          FR ? 'Sauvegardé '               : 'Saved ',
  loaded:           FR ? 'Ranges chargées ✓'         : 'Ranges loaded ✓',
  newFile:          FR ? 'Nouveau fichier'            : 'New file',
  antesSuffix:      ' (antes)',
  exportAllHeader:  FR ? '# Toutes mes ranges poker\n': '# All my poker ranges\n',
  // situation labels — poker terms stay universal
  sitOpen:          FR ? 'Open (1er)'         : 'Open (1st in)',
  sitVsLimp:        'vs Limp',
  sitVsRaise:       'vs Raise',
  sitOpenHU:        'Open HU vs BB',
  sitOpenMulti:     FR ? 'Open (multi)'       : 'Open (multi)',
  sitVsOpen:        'vs Open',
  sitVsLimpMulti:   FR ? 'vs Limp (multi)'    : 'vs Limp (multi)',
  // sidebar headings
  sbShortcuts:      FR ? 'Raccourcis clavier' : 'Keyboard shortcuts',
  sbLexicon:        FR ? 'Lexique'            : 'Lexicon',
  sbPhilosophy:     FR ? 'Philosophie'        : 'Philosophy',
  sbChangelog:      'Changelog',
  sbClose:          FR ? 'Fermer ce panneau'  : 'Close this panel',
};

// ── DATA ─────────────────────────────────────────────────────────────────────

const RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'];

const POSITIONS = ['BTN','CO','HJ','UTG','SB','BB'];

const SITUATIONS = {
  BTN: [
    { id:'open',     label: T.sitOpen },
    { id:'vs_limp',  label: T.sitVsLimp },
    { id:'vs_raise', label: T.sitVsRaise },
  ],
  CO: [
    { id:'open',     label: T.sitOpen },
    { id:'vs_limp',  label: T.sitVsLimp },
    { id:'vs_raise', label: T.sitVsRaise },
  ],
  HJ: [
    { id:'open',     label: T.sitOpen },
    { id:'vs_limp',  label: T.sitVsLimp },
    { id:'vs_raise', label: T.sitVsRaise },
  ],
  UTG: [
    { id:'open',     label: T.sitOpen },
    { id:'vs_limp',  label: T.sitVsLimp },
    { id:'vs_raise', label: T.sitVsRaise },
  ],
  SB: [
    { id:'open_hu',    label: T.sitOpenHU },
    { id:'open_multi', label: T.sitOpenMulti },
    { id:'vs_raise',   label: T.sitVsRaise },
  ],
  BB: [
    { id:'vs_open',  label: T.sitVsOpen },
    { id:'vs_limp',  label: T.sitVsLimpMulti },
    { id:'vs_raise', label: T.sitVsRaise },
  ],
};

const CTX = {
  open: (antes) => FR
    ? (antes ? 'Open — Antes en jeu : range plus large justifiée (+2-3 %). La dead money augmente la valeur d\'une relance.'
             : 'Open — Pas d\'antes : jouer solide. Représenter une main forte, surtout en early position.')
    : (antes ? 'Open — Antes in play: wider range justified (+2-3%). Dead money increases raise value.'
             : 'Open — No antes: play solid. Represent a strong hand, especially from early position.'),
  open_hu: () => FR
    ? 'SB vs BB seul — Battle de blindes. Range très large possible. Raise-or-fold recommandé.'
    : 'SB vs BB only — Blind battle. Wide range viable. Raise-or-fold recommended.',
  open_multi: (antes) => FR
    ? (antes ? 'SB multi-joueurs avec antes — Serrer légèrement vs HU, position difficile postflop.'
             : 'SB multi-joueurs sans antes — Range serrée. Tu seras hors position postflop systématiquement.')
    : (antes ? 'SB multi-way with antes — Tighten slightly; tough postflop position.'
             : 'SB multi-way no antes — Tight range. You will be OOP postflop every hand.'),
  vs_limp: () => FR
    ? 'Isolation raise ou fold. Objectif : jouer en tête-à-tête ou nettoyer la table.'
    : 'Isolation raise or fold. Goal: play heads-up or clear the field.',
  vs_raise: () => FR
    ? '3-Bet ou fold — Raise-or-Fold. 3-Bet les mains fortes, fold le reste.'
    : '3-Bet or fold — Raise-or-Fold. 3-Bet strong hands, fold the rest.',
  vs_open: () => FR
    ? 'BB face à un open — Tu as déjà investi 1 BB. Défends plus large qu\'en SB.'
    : 'BB vs open — You already have 1 BB invested. Defend wider than SB.',
};

const ACTIONS = [
  { id:0, key: null, label: '',             bg:'#1e1e1e', text:'#444' },
  { id:1, key: '1',  label: 'Raise / Open', bg:'#1a3d1a', text:'#7ecc7e' },
  { id:2, key: '2',  label: 'Call / Limp',  bg:'#3d2e08', text:'#e8c040' },
  { id:3, key: '3',  label: '3-Bet',        bg:'#0d2444', text:'#60b0f0' },
  { id:4, key: '4',  label: 'Fold',         bg:'#3d0e0e', text:'#f08080' },
];

// ── STATE ────────────────────────────────────────────────────────────────────

let curPos    = 'BTN';
let curSit    = 'open';
let curAction = 1;
let mouseDown   = false;
let firstAction = null;

const rangeState = {};
const notes      = {};

// ── HELPERS ──────────────────────────────────────────────────────────────────

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
  const s = rangeState[`${pos}_${sitId}${suffix}`];
  return s ? Object.values(s).some(v => v > 0) : false;
}

// ── I18N APPLY ───────────────────────────────────────────────────────────────

function applyI18n() {
  document.documentElement.lang = FR ? 'fr' : 'en';
  document.getElementById('headerSubtitle').textContent  = T.headerSubtitle;
  document.getElementById('labelPos').textContent        = T.posLabel;
  document.getElementById('labelSit').textContent        = T.sitLabel;
  document.getElementById('labelAntes').textContent      = T.antesLabel;
  document.getElementById('exportTitle').textContent     = T.exportTitle;
  document.getElementById('notesTitle').textContent      = T.notesTitle;
  document.getElementById('btnClear').textContent        = T.btnClear;
  document.getElementById('btnExport').textContent       = T.btnExport;
  document.getElementById('btnExportAll').textContent    = T.btnExportAll;
  document.getElementById('btnPng').textContent          = T.btnPng;
  document.getElementById('btnExportJson').textContent   = T.btnExportJson;
  document.getElementById('btnImportJson').textContent   = T.btnImportJson;
  document.getElementById('btnCopy').textContent         = T.copyBtn;
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
  const suffix = document.getElementById('antesChk').checked ? '_antes' : '';
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
    el.innerHTML = `<div class="dot" style="background:${action.bg};border:1px solid #444"></div>`
                 + `${action.label}`
                 + `<span class="leg-key">${action.key}</span>`;
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
  grid.appendChild(document.createElement('div'));
  RANKS.forEach(r => {
    const h = document.createElement('div');
    h.className = 'hdr';
    h.textContent = r;
    grid.appendChild(h);
  });
  RANKS.forEach((ra, r) => {
    const rh = document.createElement('div');
    rh.className = 'hdr';
    rh.textContent = ra;
    grid.appendChild(rh);
    RANKS.forEach((_, c) => {
      const k    = cellKey(r, c);
      const cell = document.createElement('div');
      cell.className  = 'cell';
      cell.dataset.key = k;
      const lbl = document.createElement('div');
      lbl.className   = 'cell-lbl';
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
  document.addEventListener('mouseup', () => { mouseDown = false; firstAction = null; });
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
      label.textContent = sit.label + (suffix ? T.antesSuffix : '');
      const ta = document.createElement('textarea');
      ta.placeholder = T.notesPlaceholder;
      ta.value = notes[nk] || '';
      ta.addEventListener('input', () => { notes[nk] = ta.value; save(); });
      card.appendChild(label);
      card.appendChild(ta);
      container.appendChild(card);
    });
  });
}

// ── SIDEBAR ──────────────────────────────────────────────────────────────────

function buildSidebar() {
  const shortcuts = [
    { key: '1', label: 'Raise / Open' },
    { key: '2', label: 'Call / Limp' },
    { key: '3', label: '3-Bet' },
    { key: '4', label: 'Fold' },
    { key: 'Esc', label: T.sbClose },
  ];

  const lexicon = [
    { term: 'BTN', def: FR ? 'Button — dernière position, la plus avantageuse'   : 'Button — last to act, strongest position' },
    { term: 'CO',  def: FR ? 'Cut-Off — 2e avant le bouton'                      : 'Cut-Off — 2nd before the button' },
    { term: 'HJ',  def: FR ? 'Hijack — 3e avant le bouton'                       : 'Hijack — 3rd before the button' },
    { term: 'UTG', def: FR ? 'Under the Gun — 1er à parler'                      : 'Under the Gun — 1st to act' },
    { term: 'SB',  def: FR ? 'Small Blind — OOP vs tous sauf BB'                 : 'Small Blind — OOP vs everyone except BB' },
    { term: 'BB',  def: FR ? 'Big Blind — dernier à parler préflop'              : 'Big Blind — last to act preflop' },
    { term: 'Open',  def: FR ? '1ère relance de la main'                         : '1st raise of the hand' },
    { term: '3-Bet', def: FR ? 'Re-relance face à un open'                       : 'Re-raise facing an open' },
    { term: 'Limp',  def: FR ? 'Entrer au prix de la BB sans relancer'           : 'Enter for BB price without raising' },
  ];

  const philosophy = FR
    ? '<p class="sb-p">Raise-or-Fold : tu relances ou tu couches, rarement tu calls. Ça simplifie les décisions et maximise l\'équité de position.</p>'
    + '<p class="sb-p">Les ranges varient par position parce que le nombre de joueurs restants change ton équité réalisable et la fréquence à laquelle tu seras hors position postflop.</p>'
    : '<p class="sb-p">Raise-or-Fold: raise or fold, rarely call. It simplifies decisions and maximizes positional equity.</p>'
    + '<p class="sb-p">Ranges vary by position because the number of players left to act changes your realizable equity and how often you end up out of position postflop.</p>';

  const changelog = [
    { ver: 'v1.1', note: 'Import JSON · Sidebar · i18n · ' + (FR ? 'Raccourcis clavier' : 'Keyboard shortcuts') },
    { ver: 'v1.0', note: FR ? 'Lancement — grille interactive, export texte & PNG' : 'Launch — interactive grid, text & PNG export' },
  ];

  const row   = (key, label)   => `<div class="sb-row"><span class="sb-key">${key}</span><span>${label}</span></div>`;
  const lrow  = (term, def)    => `<div class="sb-row"><span class="sb-term">${term}</span><span class="sb-def">${def}</span></div>`;
  const clog  = (ver, note)    => `<div class="sb-clog"><strong>${ver}</strong> — ${note}</div>`;

  document.getElementById('sidebarInner').innerHTML =
    `<button class="sidebar-close" id="btnSidebarClose">✕</button>`

    + `<h3 class="sb-heading">${T.sbShortcuts}</h3>`
    + shortcuts.map(s => row(s.key, s.label)).join('')

    + `<h3 class="sb-heading">${T.sbLexicon}</h3>`
    + lexicon.map(l => lrow(l.term, l.def)).join('')

    + `<h3 class="sb-heading">${T.sbPhilosophy}</h3>`
    + philosophy

    + `<h3 class="sb-heading">${T.sbChangelog}</h3>`
    + changelog.map(c => clog(c.ver, c.note)).join('');

  document.getElementById('btnSidebarClose').addEventListener('click', closeSidebar);
}

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('open');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

// ── RENDER ───────────────────────────────────────────────────────────────────

function applyCell(k, aid) {
  const sk = stateKey();
  if (!rangeState[sk]) rangeState[sk] = {};
  rangeState[sk][k] = aid;
  renderCell(k);
  updateStat();
  buildSitTabs();
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

// ── EXPORT / IMPORT ──────────────────────────────────────────────────────────

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
  const title    = `## ${curPos} / ${sitLabel}${antes ? T.antesSuffix : ''}`;
  showExport(buildExportLines(stateKey(), title));
}

function exportAll() {
  const lines = [T.exportAllHeader];
  POSITIONS.forEach(pos => {
    lines.push(`## ${pos}`);
    SITUATIONS[pos].forEach(sit => {
      ['', '_antes'].forEach(suffix => {
        const sk  = `${pos}_${sit.id}${suffix}`;
        const sub = buildExportLines(sk, `### ${sit.label}${suffix ? T.antesSuffix : ''}`);
        if (sub.length > 1) { lines.push(''); lines.push(...sub); }
      });
    });
    lines.push('');
  });
  showExport(lines);
}

function copyExport() {
  navigator.clipboard.writeText(document.getElementById('exportText').textContent).then(() => {
    const btn = document.getElementById('btnCopy');
    btn.textContent = T.copiedBtn;
    setTimeout(() => { btn.textContent = T.copyBtn; }, 1500);
  });
}

function exportJSON() {
  const data = JSON.stringify({ version: '1.1', state: rangeState, notes }, null, 2);
  const link = document.createElement('a');
  link.download = 'poker-ranges.json';
  link.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  link.click();
  URL.revokeObjectURL(link.href);
}

function importJSON() {
  document.getElementById('fileInput').click();
}

function onFileSelected(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.state) Object.assign(rangeState, data.state);
      if (data.notes) Object.assign(notes, data.notes);
      save();
      buildSitTabs();
      buildNotesGrid();
      renderAll();
    } catch (_) {}
    e.target.value = '';
  };
  reader.readAsText(file);
}

// ── PNG EXPORT ───────────────────────────────────────────────────────────────

function exportPNG() {
  const CELL = 44, HDR = 22, GAP = 2, N = 13;
  const SIZE = HDR + N * (CELL + GAP);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f0f0f';
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#555';
  ctx.font = '10px system-ui, sans-serif';
  RANKS.forEach((r, i) => {
    const offset = HDR + i * (CELL + GAP) + CELL / 2;
    ctx.fillText(r, offset, HDR / 2);
    ctx.fillText(r, HDR / 2, offset);
  });

  const sk = stateKey();
  RANKS.forEach((_, r) => {
    RANKS.forEach((__, c) => {
      const k      = cellKey(r, c);
      const action = ACTIONS[(rangeState[sk] || {})[k] || 0];
      const x      = HDR + c * (CELL + GAP);
      const y      = HDR + r * (CELL + GAP);
      ctx.fillStyle = action.bg;
      ctx.beginPath();
      ctx.roundRect(x, y, CELL, CELL, 2);
      ctx.fill();
      ctx.fillStyle = action.text;
      ctx.font = '9px system-ui, sans-serif';
      ctx.fillText(k, x + CELL / 2, y + CELL / 2);
    });
  });

  const antes    = document.getElementById('antesChk').checked;
  const link     = document.createElement('a');
  link.download  = `range_${curPos}_${curSit}${antes ? '_antes' : ''}.png`;
  link.href      = canvas.toDataURL('image/png');
  link.click();
}

// ── SAVE / LOAD ───────────────────────────────────────────────────────────────

function save() {
  try {
    localStorage.setItem('prb_state', JSON.stringify(rangeState));
    localStorage.setItem('prb_notes', JSON.stringify(notes));
    const t = new Date().toLocaleTimeString(FR ? 'fr-FR' : 'en-US', { hour:'2-digit', minute:'2-digit' });
    document.getElementById('saveStatus').textContent = T.savedAt + t;
  } catch (_) {}
}

function load() {
  try {
    const s = localStorage.getItem('prb_state');
    const n = localStorage.getItem('prb_notes');
    if (s) Object.assign(rangeState, JSON.parse(s));
    if (n) Object.assign(notes, JSON.parse(n));
    document.getElementById('saveStatus').textContent = T.loaded;
  } catch (_) {
    document.getElementById('saveStatus').textContent = T.newFile;
  }
}

// ── KEYBOARD ─────────────────────────────────────────────────────────────────

const DIGIT_CODES = { Digit1:1, Digit2:2, Digit3:3, Digit4:4,
                      Numpad1:1, Numpad2:2, Numpad3:3, Numpad4:4 };

document.addEventListener('keydown', e => {
  if (e.target.matches('textarea, input')) return;
  if (e.code in DIGIT_CODES) {
    curAction = DIGIT_CODES[e.code];
    buildLegend();
  }
  if (e.key === 'Escape') closeSidebar();
});

// ── INIT ─────────────────────────────────────────────────────────────────────

load();
applyI18n();
buildSidebar();
buildPosTabs();
buildSitTabs();
buildLegend();
buildGrid();
buildNotesGrid();
renderAll();

document.getElementById('antesChk').addEventListener('change', () => { buildSitTabs(); renderAll(); });
document.getElementById('btnClear').addEventListener('click', clearCurrent);
document.getElementById('btnPng').addEventListener('click', exportPNG);
document.getElementById('btnHelp').addEventListener('click', openSidebar);
document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);
