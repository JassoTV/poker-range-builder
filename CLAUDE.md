# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the app

No build step. Open `index.html` directly in a browser, or serve locally:

```bash
npx serve .
# or
python -m http.server 8080
```

The app is deployed at https://jassotv.github.io/poker-range-builder/ via GitHub Pages (branch `main`, root `/`).

## Architecture

Single-page app — no framework, no bundler, no dependencies. Three files do all the work:

**`app.js`** is the entire application, structured in this order:
1. **I18N** — `const FR = navigator.language?.startsWith('fr')` runs first. The `T` object holds every UI string in both languages. `applyI18n()` writes them to the DOM on init. Poker terms (BTN, 3-Bet, etc.) are identical in both languages by design.
2. **DATA** — `RANKS`, `POSITIONS`, `SITUATIONS` (per-position situation configs), `CTX` (context hint functions keyed by situation id), `ACTIONS` (id / label / key / bg / text color).
3. **STATE** — Two plain objects: `rangeState[stateKey]` maps hand keys → action id; `notes[stateKey]` maps to free text. State key format: `{POS}_{sitId}` or `{POS}_{sitId}_antes`.
4. **BUILD UI** — `buildPosTabs`, `buildSitTabs`, `buildLegend`, `buildGrid`, `buildNotesGrid`, `buildSidebar` — these recreate DOM nodes from scratch on each call.
5. **RENDER** — `applyCell`, `renderCell`, `renderAll`, `updateStat`, `updateCtx` — read from `rangeState` and paint the grid.
6. **EXPORT** — `exportPNG` (canvas-based), plus dormant text/JSON export functions kept for future Pro activation.
7. **SAVE/LOAD** — `localStorage` keys `prb_state` and `prb_notes`, JSON-serialised.
8. **KEYBOARD** — `DIGIT_CODES` maps `Digit1–4` and `Numpad1–4` to action ids 1–4. Escape closes the sidebar.
9. **INIT** — bottom of file: `load()`, `applyI18n()`, all `build*()` calls, then event listener registration.

**`style.css`** uses CSS custom properties defined on `:root` for the entire colour palette (`--bg`, `--bg2`, `--bg3`, `--border`, `--text`, `--text2`, `--text3`, `--blue`, `--blue-act`, `--blue-text`, `--radius`). Never hardcode colours — always use a variable.

**`premium.html`** is a standalone page sharing `style.css`. It has its own `<style>` block for page-specific layout. The unlock button is `disabled` intentionally until Pro features ship.

## Key conventions

**Hand key format** — `cellKey(r, c)` returns `AA` (pair), `AKs` (suited, r < c), `AKo` (offsuit, r > c). The 13×13 grid upper-triangle is suited, lower-triangle is offsuit, diagonal is pairs.

**State key** — always call `stateKey()` to get the current key; it reads `antesChk.checked` live.

**Adding a new situation** — add an entry to `SITUATIONS[POS]` with `{ id, label: T.sitXxx }`, add the label string to `T`, and add a context function to `CTX` keyed by the same `id`.

**Pro features** — export/import functions (`exportAll`, `exportJSON`, `importJSON`, `onFileSelected`, `toggleExport`, `copyExport`) are defined in `app.js` but have no event listeners wired. Their buttons do not exist in `index.html`. When implementing Pro, add the buttons back and register the listeners.

**i18n** — add both `FR ?` branches to `T` for every new string. The `FR` constant is module-level and evaluated once at startup.
