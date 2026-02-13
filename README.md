# Driftfield — Serendipity Engine

> Randonautica told you where to go. This tells you what to do.

An entropy-driven serendipity engine that detects probability currents, amplifies your luck surface area, and provides actionable direction based on real math and behavioral science research.

**[Live](https://driftfield.vercel.app/) | [Open Engine](https://driftfield.vercel.app/app/)**

---

## What It Does

Driftfield combines five signal layers into a composite reading:

1. **Entropy Engine** — Samples cryptographic entropy, runs statistical analysis (Shannon entropy, chi-squared, serial correlation, runs test, Monte Carlo estimation). Deviations from perfect randomness = signal.

2. **Probe System** — Set an intention, fire a probe, get a compass bearing and action derived from the anomaly pattern in the entropy. Cycle-weighted action selection based on lunar phase, biorhythm, and temporal gates.

3. **Cycle Layer** — Biorhythm cycles from your birth date, lunar phase, and time-of-day energy windows. Personalized via your birth date.

4. **Synchronicity Log** — Track coincidences with polarity and categories. The pattern detector finds temporal clusters, thematic repetitions, streaks, and frequency acceleration. Link events to the probe that prompted them.

5. **Decision Evaluator** — Compare two choices by their serendipity surface area: novelty, new connections, reversibility, optionality, gut signal.

Based on research by Wiseman (2003), Granovetter (1973), Busch (2020), and Shannon (1948).

---

## Development

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

The dev server serves:
- Landing page at `http://localhost:5173/`
- App at `http://localhost:5173/app/`

### Build

```bash
npm run build
npm run preview
```

### Deploy

Push to `main` — Vercel auto-deploys via GitHub integration.

---

## Project Structure

```
driftfield/
├── index.html              # Marketing landing page
├── app/
│   └── index.html          # React app entry point
├── src/
│   ├── main.jsx            # React mount + routing
│   ├── DriftfieldApp.jsx   # Main component (all tabs)
│   ├── probeCard.js        # Shareable probe/score card generator
│   ├── lib/
│   │   ├── supabase.js     # Supabase client (graceful fallback)
│   │   ├── premium.js      # Feature gating + pricing
│   │   └── analytics.js    # Event tracking
│   ├── hooks/
│   │   ├── useAuth.jsx     # Auth context/provider
│   │   ├── useProbes.js    # Probe CRUD
│   │   └── useEvents.js    # Event CRUD
│   └── components/auth/
│       ├── AuthModal.jsx   # Sign in/up modal
│       ├── AuthCallback.jsx # OAuth redirect handler
│       └── PremiumModal.jsx # Premium upgrade modal
├── api/
│   ├── create-checkout-session.js  # Stripe Checkout
│   ├── create-portal-session.js    # Stripe Customer Portal
│   └── stripe-webhook.js          # Stripe event handler
├── supabase/migrations/
│   └── 001_initial_schema.sql     # Database schema + RLS
├── public/
│   ├── favicon.svg         # Compass needle favicon
│   ├── og-image.svg        # Open Graph image
│   ├── icon-192.png        # PWA icon
│   └── icon-512.png        # PWA icon (large)
├── vercel.json             # Vercel rewrites + headers
├── vite.config.js          # Vite + PWA + obfuscation
├── .env.example            # Environment variable template
└── README.md
```

---

## Tech Stack

- **Vite** + **React 18** — Multi-page app (landing + SPA)
- **Supabase** — Auth, PostgreSQL database, Row-Level Security
- **Stripe** — Subscriptions ($1.99/mo, $11.99/yr)
- **Vercel** — Hosting, serverless API functions
- **vite-plugin-pwa** (Workbox) — Offline-capable PWA
- **rollup-obfuscator** — Production JS obfuscation
- Canvas API — Entropy visualization + shareable probe cards
- Web Crypto API — Entropy sampling
- Web Share API — Probe card sharing

---

## Premium

Free tier includes 1 probe per day and 7-day event history. Premium unlocks:
- Unlimited daily probes
- Full event history
- Deep entropy analysis
- Advanced pattern detection
- Data export (JSON/CSV)
- Cloud sync across devices

---

## PWA

The app is installable as a PWA. The service worker caches all assets and Google Fonts for offline use. Works without Supabase — data persists in localStorage.

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
