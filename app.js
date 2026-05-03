'use strict';

// ── I18N ─────────────────────────────────────────────────────────────────────

const FR  = navigator.language?.startsWith('fr');
const DEV = new URLSearchParams(location.search).get('dev') === 'true'
         || localStorage.getItem('pro_unlocked') === 'true';

const T = {
  headerSubtitle:   FR ? 'Construis et mémorise tes ranges préflop par position'
                       : 'Build and memorize your preflop ranges by position',
  posLabel:         FR ? 'Position'                  : 'Position',
  sitLabel:         FR ? 'Situation'                 : 'Situation',
  antesLabel:       FR ? 'Antes en jeu'              : 'Antes in play',
  btnClear:         FR ? 'Effacer'                   : 'Clear',
  btnPng:           'Export PNG',
  notesTitle:       FR ? 'Notes par situation'       : 'Notes per situation',
  notesPlaceholder: FR ? 'Notes, ajustements, leaks…': 'Notes, adjustments, leaks…',
  savedAt:          FR ? 'Sauvegardé '               : 'Saved ',
  loaded:           FR ? 'Ranges chargées ✓'         : 'Ranges loaded ✓',
  newFile:          FR ? 'Nouveau fichier'            : 'New file',
  antesSuffix:      ' (antes)',
  exportAllHeader:  FR ? '# Toutes mes ranges poker\n': '# All my poker ranges\n',
  copiedBtn:        FR ? 'Copié ✓'                   : 'Copied ✓',
  copyBtn:          FR ? 'Copier'                    : 'Copy',
  // situation labels
  sitOpen:          FR ? 'Open (1er)'         : 'Open (1st in)',
  sitVsLimp:        'vs Limp',
  sitVsRaise:       'vs Raise',
  sitOpenHU:        'Open HU vs BB',
  sitOpenMulti:     FR ? 'Open (multi)'       : 'Open (multi)',
  sitVsOpen:        'vs Open',
  sitVsLimpMulti:   FR ? 'vs Limp (multi)'    : 'vs Limp (multi)',
  // sidebar — tools
  sbClose:          FR ? 'Fermer'             : 'Close',
  sbToolsHeader:    FR ? 'Outils'             : 'Tools',
  sbGuide:          FR ? 'Clique ou glisse pour colorier les cases. Clic droit = effacer. Touches 1–4 pour changer d\'action.'
                       : 'Click or drag to paint cells. Right-click = erase. Keys 1–4 to change action.',
  sbShortcuts:      FR ? 'Raccourcis clavier' : 'Keyboard shortcuts',
  sbLexicon:        FR ? 'Lexique'            : 'Lexicon',
  sbPhilosophy:     FR ? 'Philosophie'        : 'Philosophy',
  sbChangelog:      'Changelog',
  // sidebar — pro
  sbProHeader:      'Pro ✦',
  sbQuiz:           FR ? 'Quiz préflop'        : 'Preflop quiz',
  sbPresets:        FR ? 'Ranges pré-remplies' : 'Pre-built ranges',
  sbHistory:        FR ? 'Historique sessions' : 'Session history',
  sbCompare:        FR ? 'Comparaison ranges'  : 'Range comparison',
  sbImportExport:   'Import / Export JSON',
  sbLoadPreset:     FR ? 'Charger'             : 'Load',
  sbPresetWarning:  FR ? '⚠ Écrase tes ranges actuelles — exporte d\'abord si besoin.'
                       : '⚠ Overwrites your current ranges — export first if needed.',
  sbComingSoon:     FR ? 'à venir'             : 'coming soon',
  sbImport:         FR ? 'Importer JSON'       : 'Import JSON',
  sbExport:         FR ? 'Exporter JSON'       : 'Export JSON',
  sbUnlockPro:      FR ? 'Voir la version Pro →' : 'See Pro version →',
  sbPresetLoaded:   (lbl) => FR ? `Ranges « ${lbl} » chargées ✓` : `"${lbl}" ranges loaded ✓`,
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

const POS_DESC = {
  BTN: FR ? 'Dernière à parler — position idéale'      : 'Last to act — best position',
  CO:  FR ? 'Cut-Off — 2e avant le bouton'             : 'Cut-Off — 2nd before button',
  HJ:  FR ? 'Hijack — 3e avant le bouton'              : 'Hijack — 3rd before button',
  UTG: FR ? 'Under the Gun — 1er à parler'             : 'Under the Gun — 1st to act',
  SB:  FR ? 'Small Blind — souvent hors position'      : 'Small Blind — often out of position',
  BB:  FR ? 'Big Blind — défends tes blindes'          : 'Big Blind — defend your blinds',
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
const posNotes   = {};   // keyed by position: BTN, CO, HJ, UTG, SB, BB

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
  document.getElementById('headerSubtitle').textContent = T.headerSubtitle;
  document.getElementById('labelPos').textContent       = T.posLabel;
  document.getElementById('labelSit').textContent       = T.sitLabel;
  document.getElementById('labelAntes').textContent     = T.antesLabel;
  document.getElementById('notesTitle').textContent     = T.notesTitle;
  document.getElementById('btnClear').textContent       = T.btnClear;
  document.getElementById('btnPng').textContent         = T.btnPng;
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
      buildPosNoteSection();
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

function buildPosNoteSection() {
  const titleEl = document.getElementById('posNotesTitle');
  const ta      = document.getElementById('posNoteTextarea');
  if (!titleEl || !ta) return;
  titleEl.textContent = (FR ? 'Notes — ' : 'Notes — ') + curPos;
  ta.placeholder      = FR ? `Notes générales sur la position ${curPos}…`
                           : `General notes on ${curPos} position…`;
  ta.value            = posNotes[curPos] || '';
  ta.oninput          = () => { posNotes[curPos] = ta.value; save(); };
}

// ── SIDEBAR ──────────────────────────────────────────────────────────────────

function buildSidebar() {
  const shortcuts = [
    { key: '1–4',  label: FR ? 'Choisir une action' : 'Select an action' },
    { key: 'Esc',  label: FR ? 'Fermer ce panneau'  : 'Close this panel' },
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
    { ver: 'v1.9', note: FR ? 'Clé Pro, historique quiz, finitions UI, README'
                            : 'Pro key, quiz history, UI polish, README' },
    { ver: 'v1.8', note: FR ? 'Système clé Pro (PRO-RANGEPRO-V1), JSON débloqué, historique quiz'
                            : 'Pro key system, JSON unlocked, quiz session history' },
    { ver: 'v1.7', note: FR ? 'Presets refaits entièrement (données solver), UTG sans vs_limp'
                            : 'Full preset rewrite (solver data), UTG no vs_limp' },
    { ver: 'v1.6', note: FR ? 'Presets corrigés (Conservateur/Solide/Expert), panel situation, alignement UI'
                            : 'Corrected presets (Conservative/Solid/Expert), situation panel, UI alignment' },
    { ver: 'v1.5', note: FR ? 'Gumroad Pro, panel progression, notes par position, presets calibrés'
                            : 'Gumroad Pro, progress panel, position notes, calibrated presets' },
    { ver: 'v1.4', note: FR ? 'Sidebar universelle, ranges pré-remplies, quiz amélioré, features Pro'
                            : 'Universal sidebar, preset ranges, improved quiz, Pro features' },
    { ver: 'v1.3', note: FR ? 'Fix Import JSON, accès dev (?dev=true)' : 'Import JSON fix, dev access (?dev=true)' },
    { ver: 'v1.2', note: FR ? 'Fix grille, Export PNG, quiz.html séparé' : 'Grid fix, Export PNG, standalone quiz.html' },
    { ver: 'v1.1', note: 'Sidebar · i18n · Import JSON · ' + (FR ? 'Raccourcis' : 'Shortcuts') },
    { ver: 'v1.0', note: FR ? 'Lancement — grille interactive, export PNG' : 'Launch — interactive grid, PNG export' },
  ];

  const row  = (key, label) => `<div class="sb-row"><span class="sb-key">${key}</span><span>${label}</span></div>`;
  const lrow = (term, def)  => `<div class="sb-row"><span class="sb-term">${term}</span><span class="sb-def">${def}</span></div>`;
  const clog = (ver, note)  => `<div class="sb-clog"><strong>${ver}</strong> — ${note}</div>`;

  // ── Pro section helpers ────────────────────────────────────────────────────
  const lockedBtn = (label, badge) =>
    `<button class="sb-locked-btn">
       <span>${label}</span>
       <span class="${badge === 'soon' ? 'sb-coming-soon' : 'sb-pro-badge'}">${badge === 'soon' ? T.sbComingSoon : 'Pro ✦'}</span>
     </button>`;

  // Quiz
  const quizBlock = DEV
    ? `<div class="sb-pro-item"><a href="quiz.html?dev=true" class="sb-pro-btn">${T.sbQuiz} →</a></div>`
    : `<div class="sb-pro-item">${lockedBtn(T.sbQuiz, 'pro')}</div>`;

  // Preset ranges
  const presetOpts = (typeof PRESETS !== 'undefined')
    ? PRESETS.map(p => `<option value="${p.id}">${FR ? p.label : p.labelEN}</option>`).join('')
    : '';
  const firstDesc = (typeof PRESETS !== 'undefined') ? (FR ? PRESETS[0].desc : PRESETS[0].descEN) : '';

  const presetsBlock = DEV
    ? `<div class="sb-pro-item">
         <p class="sb-pro-label">${T.sbPresets}</p>
         <div class="sb-preset-row">
           <select id="presetSelect" class="sb-preset-select">${presetOpts}</select>
           <button id="btnLoadPreset" class="sb-preset-load">${T.sbLoadPreset}</button>
         </div>
         <p id="presetDesc" class="sb-preset-desc">${firstDesc}</p>
         <p class="sb-warning">${T.sbPresetWarning}
           <button id="btnPresetExportFirst" class="sb-inline-export">${T.sbExport}</button>
         </p>
       </div>`
    : `<div class="sb-pro-item">${lockedBtn(T.sbPresets, 'pro')}</div>`;

  // Import/Export JSON
  const jsonBlock = DEV
    ? `<div class="sb-pro-item">
         <p class="sb-pro-label">${T.sbImportExport}</p>
         <div class="sb-json-row">
           <button id="btnSbExportJson" class="sb-json-btn">${T.sbExport}</button>
           <button id="btnSbImportJson" class="sb-json-btn">${T.sbImport}</button>
         </div>
       </div>`
    : `<div class="sb-pro-item">${lockedBtn(T.sbImportExport, 'pro')}</div>`;

  const html =
    `<button class="sidebar-close" id="btnSidebarClose">✕</button>`

    // ── OUTILS ───────────────────────────────────────────────────────────────
    + `<h3 class="sb-heading">${T.sbToolsHeader}</h3>`
    + `<p class="sb-p" style="margin:4px 0 12px">${T.sbGuide}</p>`

    + `<h3 class="sb-heading">${T.sbShortcuts}</h3>`
    + shortcuts.map(s => row(s.key, s.label)).join('')

    + `<h3 class="sb-heading">${T.sbLexicon}</h3>`
    + lexicon.map(l => lrow(l.term, l.def)).join('')

    + `<h3 class="sb-heading">${T.sbPhilosophy}</h3>`
    + philosophy

    + `<h3 class="sb-heading">${T.sbChangelog}</h3>`
    + changelog.map(c => clog(c.ver, c.note)).join('')

    // ── PRO ──────────────────────────────────────────────────────────────────
    + `<h3 class="sb-heading">${T.sbProHeader}</h3>`
    + quizBlock
    + presetsBlock
    + jsonBlock
    + `<div class="sb-pro-item">${lockedBtn(T.sbHistory, 'soon')}</div>`
    + `<div class="sb-pro-item">${lockedBtn(T.sbCompare, 'soon')}</div>`
    + (!DEV ? `<div class="sb-pro-unlock-wrap"><a href="premium.html" class="sb-pro-unlock">${T.sbUnlockPro}</a></div>` : '');

  document.getElementById('sidebarInner').innerHTML = html;

  // Wire events
  document.getElementById('btnSidebarClose').addEventListener('click', closeSidebar);

  if (DEV) {
    const sel = document.getElementById('presetSelect');
    if (sel) {
      sel.addEventListener('change', () => {
        const p = PRESETS.find(x => x.id === sel.value);
        const desc = document.getElementById('presetDesc');
        if (p && desc) desc.textContent = FR ? p.desc : p.descEN;
      });
    }
    document.getElementById('btnLoadPreset')?.addEventListener('click', loadPreset);
    document.getElementById('btnPresetExportFirst')?.addEventListener('click', exportJSON);
    document.getElementById('btnSbExportJson')?.addEventListener('click', exportJSON);
    document.getElementById('btnSbImportJson')?.addEventListener('click', importJSON);
  } else {
    document.querySelectorAll('.sb-locked-btn').forEach(btn => {
      btn.addEventListener('click', () => { window.location.href = 'premium.html'; });
    });
  }
}

function openSidebar()  {
  buildSidebar(); // rebuild each time so preset descriptions reset
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
  updatePosPanel();
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
  updatePosPanel();
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

function updatePosPanel() {
  const panel = document.getElementById('posPanel');
  if (!panel) return;

  const antes = document.getElementById('antesChk').checked;
  const sk    = stateKey();

  // Combos de la situation courante
  let sel = 0;
  RANKS.forEach((_, r) => RANKS.forEach((__, c) => {
    const k = cellKey(r, c);
    if (((rangeState[sk] || {})[k] || 0) > 0) sel += combos(k);
  }));
  const pct = ((sel / 1326) * 100).toFixed(1);

  const sit      = SITUATIONS[curPos].find(s => s.id === curSit);
  const sitLabel = sit ? sit.label : curSit;
  const posDesc  = POS_DESC[curPos] || '';
  const ctxFn    = CTX[curSit] || CTX['open'];
  const ctxText  = ctxFn(antes);

  panel.innerHTML =
    `<div class="pp-pos-name">${curPos}</div>`
    + `<div class="pp-pos-desc">${posDesc}</div>`
    + `<div class="pp-sit-row">`
    +   `<span class="pp-sit-label">${sitLabel}</span>`
    +   `<span class="pp-sit-stat">${pct}% <span class="pp-sit-combos">— ${sel} combos</span></span>`
    + `</div>`
    + `<div class="pp-ctx">${ctxText}</div>`;
}

// ── EXPORT / IMPORT ──────────────────────────────────────────────────────────

function clearCurrent() {
  rangeState[stateKey()] = {};
  renderAll();
  buildSitTabs();
  save();
}

function exportJSON() {
  const data = JSON.stringify({ version: '1.5', state: rangeState, notes, posNotes }, null, 2);
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
      Object.keys(rangeState).forEach(k => delete rangeState[k]);
      // Handle both: {version, state, notes} and direct {BTN_open: {...}}
      if (data.state && typeof data.state === 'object') {
        Object.assign(rangeState, data.state);
        if (data.notes)    Object.assign(notes,    data.notes);
        if (data.posNotes) Object.assign(posNotes, data.posNotes);
      } else {
        Object.assign(rangeState, data);
      }
      save();
      buildSitTabs();
      buildNotesGrid();
      buildPosNoteSection();
      renderAll();
    } catch (_) {}
    e.target.value = '';
  };
  reader.readAsText(file);
}

// ── PRESET LOAD ───────────────────────────────────────────────────────────────

function loadPreset() {
  if (typeof PRESETS === 'undefined') return;
  const sel = document.getElementById('presetSelect');
  if (!sel) return;
  const preset = PRESETS.find(p => p.id === sel.value);
  if (!preset) return;
  const name = FR ? preset.label : preset.labelEN;
  const msg  = FR
    ? `Charger les ranges « ${name} » ?\n\nCeci va écraser toutes tes ranges actuelles.\nCeci écrasera aussi tes notes par situation.`
    : `Load "${name}" ranges?\n\nThis will overwrite all your current ranges.\nThis will also clear your notes per situation.`;
  if (!confirm(msg)) return;
  Object.keys(rangeState).forEach(k => delete rangeState[k]);
  Object.keys(notes).forEach(k => delete notes[k]);
  Object.assign(rangeState, JSON.parse(JSON.stringify(preset.state)));
  save();
  buildSitTabs();
  buildNotesGrid();
  renderAll();
  closeSidebar();
  document.getElementById('saveStatus').textContent = T.sbPresetLoaded(name);
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

  const antes   = document.getElementById('antesChk').checked;
  const link    = document.createElement('a');
  link.download = `range_${curPos}_${curSit}${antes ? '_antes' : ''}.png`;
  link.href     = canvas.toDataURL('image/png');
  link.click();
}

// ── SAVE / LOAD ───────────────────────────────────────────────────────────────

function save() {
  try {
    localStorage.setItem('prb_state',     JSON.stringify(rangeState));
    localStorage.setItem('prb_notes',     JSON.stringify(notes));
    localStorage.setItem('prb_pos_notes', JSON.stringify(posNotes));
    const t = new Date().toLocaleTimeString(FR ? 'fr-FR' : 'en-US', { hour:'2-digit', minute:'2-digit' });
    document.getElementById('saveStatus').textContent = T.savedAt + t;
  } catch (_) {}
}

function load() {
  try {
    const s = localStorage.getItem('prb_state');
    const n = localStorage.getItem('prb_notes');
    const p = localStorage.getItem('prb_pos_notes');
    if (s) Object.assign(rangeState, JSON.parse(s));
    if (n) Object.assign(notes,      JSON.parse(n));
    if (p) Object.assign(posNotes,   JSON.parse(p));
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
buildPosTabs();
buildSitTabs();
buildLegend();
buildGrid();
buildNotesGrid();
buildPosNoteSection();
renderAll();

document.getElementById('antesChk').addEventListener('change', () => { buildSitTabs(); renderAll(); });
document.getElementById('btnClear').addEventListener('click', clearCurrent);
document.getElementById('btnPng').addEventListener('click', exportPNG);
document.getElementById('btnHamburger').addEventListener('click', openSidebar);
document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);
document.getElementById('fileInput').addEventListener('change', onFileSelected);
