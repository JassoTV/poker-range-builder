# Poker Range Builder

**🃏 Site live :** [jassotv.github.io/poker-range-builder](https://jassotv.github.io/poker-range-builder/)  
**✦ Version Pro :** [jassotv.gumroad.com/l/poker-range-builder-pro](https://jassotv.gumroad.com/l/poker-range-builder-pro)

Outil préflop dark-mode pour construire, mémoriser et tester tes ranges par position — 100 % browser, sans serveur, sans dépendance.

![Aperçu de la grille](https://jassotv.github.io/poker-range-builder/preview.png)
<!-- Remplace par un vrai screenshot ou GIF si disponible -->

---

## Fonctionnalités

| Gratuit | Pro ✦ |
|---------|-------|
| Grille 13×13 interactive | Quiz préflop (pioche dans tes ranges) |
| 6 positions × situations × antes | Import / Export JSON |
| 4 actions couleur-codées | Historique de sessions quiz |
| Auto-save localStorage | Ranges pré-remplies (Conservateur / Solide / Expert) |
| Export PNG | Clé d'accès permanente |
| Notes par situation | — |

---

## Lancer l'app

Pas de build. Ouvre `index.html` directement dans un navigateur, ou sers localement :

```bash
npx serve .
# ou
python -m http.server 8080
```

---

## Structure des fichiers

```
poker-range-builder/
├── index.html      # Shell principal
├── style.css       # Thème sombre, mobile-first (CSS vars)
├── app.js          # Logique complète (grille, state, export, sidebar Pro)
├── presets.js      # Ranges pré-remplies (Conservateur / Solide / Expert)
├── quiz.html       # Page quiz préflop (Pro)
├── quiz.js         # Logique quiz + historique sessions
├── premium.html    # Page upgrade + activation clé Pro
└── README.md
```

---

## Clé Pro

Clé de démo : **`PRO-RANGEPRO-V1`**  
Entre-la sur [premium.html](premium.html) → active toutes les features Pro via `localStorage`.

---

## Déploiement GitHub Pages

1. Push ce dossier sur un repo GitHub.
2. **Settings → Pages** → source : `main` / `root`.
3. L'app est live à `https://<username>.github.io/<repo>/`.
