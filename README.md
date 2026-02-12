# Driftfield — Serendipity Engine

> Randonautica told you where to go. This tells you what to do.

An entropy-driven serendipity engine that detects probability currents, amplifies your luck surface area, and provides actionable direction based on real math and behavioral science research.

**[Live Demo](https://jordanaftermidnight.github.io/driftfield/) | [Open Engine](https://jordanaftermidnight.github.io/driftfield/app/)**

---

## What It Does

Driftfield combines five signal layers into a composite reading:

1. **Entropy Engine** — Samples cryptographic entropy, runs statistical analysis (Shannon entropy, chi-squared, serial correlation, runs test, Monte Carlo estimation). Deviations from perfect randomness = signal.

2. **Probe System** — Set an intention, fire a probe, get a compass bearing and action derived from the anomaly pattern in the entropy.

3. **Cycle Layer** — Biorhythm cycles from your birth date, lunar phase, and time-of-day energy windows. Personalized via your birth date.

4. **Synchronicity Log** — Track coincidences with polarity and categories. The pattern detector finds temporal clusters, thematic repetitions, streaks, and frequency acceleration.

5. **Decision Evaluator** — Compare two choices by their serendipity surface area: novelty, new connections, reversibility, optionality, gut signal.

Based on research by Wiseman (2003), Granovetter (1973), Busch (2020), and Shannon (1948).

---

## Development

```bash
npm install
npm run dev
```

The dev server serves:
- Landing page at `http://localhost:5173/driftfield/`
- App at `http://localhost:5173/driftfield/app/`

### Build

```bash
npm run build
npm run preview
```

### Deploy

Push to `main` — GitHub Actions deploys to Pages automatically via `.github/workflows/deploy.yml`.

Or manually enable GitHub Pages: Settings → Pages → Source → GitHub Actions.

---

## Project Structure

```
driftfield/
├── index.html              # Marketing landing page
├── app/
│   └── index.html          # React app entry point
├── src/
│   ├── main.jsx            # React mount
│   ├── DriftfieldApp.jsx   # Main component
│   ├── probeCard.js        # Shareable probe card generator
│   └── index.css           # Global styles
├── public/
│   ├── favicon.svg         # Compass sigil favicon
│   ├── og-image.svg        # Open Graph image
│   ├── icon-192.png        # PWA icon
│   └── icon-512.png        # PWA icon (large)
├── vite.config.js          # Vite + PWA config
├── .github/workflows/
│   └── deploy.yml          # GitHub Pages deploy
└── README.md
```

---

## PWA

The app is installable as a PWA. The service worker (via Workbox) caches all assets and Google Fonts for offline use.

## Shareable Probe Cards

When you fire a probe, you can share it as a 1080x1080 PNG card with the compass bearing, action, entropy stats, and intention text. Uses the Web Share API on mobile, falls back to PNG download on desktop.

---

## Analytics

No analytics are included by default. To add privacy-respecting analytics, add one of the following to `app/index.html` before `</head>`:

**Plausible** (example — replace with your own domain):
```html
<script defer data-domain="your-actual-domain.com" src="https://plausible.io/js/script.js"></script>
```

**Umami** (example — replace with your own instance URL and website ID):
```html
<script defer src="https://your-umami-instance.com/script.js" data-website-id="your-website-id"></script>
```

Both are privacy-first, cookie-free, and GDPR-compliant.

---

## Tech Stack

- **Vite** + **React 18**
- **vite-plugin-pwa** (Workbox service worker)
- Canvas API for entropy visualization + probe cards
- Web Crypto API for entropy sampling
- Web Share API for probe card sharing
- localStorage for persistence

---

## Research References

- Wiseman, R. (2003). *The Luck Factor*
- Granovetter, M. (1973). *The Strength of Weak Ties*
- Busch, C. (2020). *The Serendipity Mindset*
- Shannon, C. (1948). *A Mathematical Theory of Communication*
- Jung, C.G. (1952). *Synchronicity: An Acausal Connecting Principle*
- Taleb, N.N. (2012). *Antifragile*

---

## License

All rights reserved. See [LICENSE](LICENSE) for details.
