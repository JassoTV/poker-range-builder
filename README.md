# Poker Range Builder

**Website:** https://jassotv.github.io/poker-range-builder/

Built for poker players who want to master preflop ranges without bloated solvers.

A dark-themed, mobile-friendly preflop range builder that runs entirely in the browser — no server, no framework, no dependencies.

## Features

- **13×13 interactive grid** — click or drag to assign actions to hands
- **6 positions** — BTN, CO, HJ, UTG, SB, BB, each with their own situations
- **Situations per position** — Open, vs Limp, vs Raise (SB/BB have position-specific variants)
- **Antes toggle** — separate range storage for with/without antes
- **4 colour-coded actions** — Raise/Open, Call/Limp, 3-Bet, Fold
- **✓ badges** on situation tabs when a range has been filled in
- **Auto-save** via localStorage — nothing is lost on refresh
- **Text export** — current situation or all positions at once, ready to paste into Notion
- **PNG export** — saves a clean image of the current grid
- **Notes per situation** — freeform text attached to each position/situation/antes combo

## File structure

```
poker-range-builder/
├── index.html      # Main app shell
├── style.css       # All styles (dark theme, mobile-first)
├── app.js          # All logic (grid, state, export, save/load)
├── premium.html    # Pro upgrade page
└── README.md
```

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository.
2. Go to **Settings → Pages**.
3. Set source to **Deploy from a branch** → `main` / `root`.
4. Your app will be live at `https://<username>.github.io/<repo>/`.

## Pro version (coming soon)

The [premium page](premium.html) previews upcoming features:

- Preflop quiz mode
- Import / Export JSON
- Session history
- Range comparison
- Progress stats

No payment system is wired yet — the unlock button is intentionally disabled until the features ship.

## Local development

Open `index.html` directly in a browser — no build step needed.
