# Driftfield — Serendipity Engine

> An oracle in your pocket. Entropy speaks — you listen.

An entropy-driven serendipity engine that detects probability currents, amplifies your luck surface area, and tells you where chance is flowing. Built on real math and behavioral science research.

**[Live](https://driftfield.vercel.app/) | [Open Engine](https://driftfield.vercel.app/app/)**

---

## What It Does

Driftfield has three instruments:

### SCAN
The entropy engine samples cryptographic randomness and runs statistical analysis (Shannon entropy, chi-squared, serial correlation, runs test, Monte Carlo estimation). Deviations from perfect randomness become signal. Fire probes with an intention — or compare two choices and let the field weigh in. Biorhythm cycles, lunar phase, and temporal gates overlay your personal probability field. Log synchronicities, track patterns, and measure your daily surface area.

### ARCANA
A full tarot reading engine powered by the entropy field. 78 RWS cards, 12 spread templates, generative procedural card backs, and narrative that responds to your question, the cards drawn, and the current field state. Not random — responsive.

### SETUP
Configure your birth date, time, and location for personalized biorhythm and birth chart overlays. Manage your account, subscription, and data exports.

Based on research by Wiseman (2003), Granovetter (1973), Busch (2020), Shannon (1948), Jung (1952), and Taleb (2012).

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
├── index.html              # Landing page (light/dark mode)
├── app/
│   └── index.html          # React app entry point
├── src/
│   ├── main.jsx            # React mount + routing
│   ├── DriftfieldApp.jsx   # Main component (3 tabs: Scan, Arcana, Setup)
│   ├── theme.css           # CSS custom properties (light/dark)
│   ├── probeCard.js        # Shareable probe/score card generator
│   ├── lib/
│   │   ├── supabase.js     # Supabase client (graceful fallback)
│   │   ├── premium.js      # Feature gating + pricing
│   │   ├── entropy.js      # Entropy analysis utilities
│   │   ├── astro.js        # Birth chart calculations
│   │   └── analytics.js    # Event tracking
│   ├── hooks/
│   │   ├── useAuth.jsx     # Auth context/provider
│   │   ├── useTheme.js     # Light/dark mode toggle
│   │   ├── useReading.js   # Arcana reading state machine
│   │   ├── useCardBack.js  # Generative card back renderer
│   │   ├── useProbes.js    # Probe CRUD (Supabase)
│   │   └── useEvents.js    # Event CRUD (Supabase)
│   ├── components/
│   │   ├── ArcanaTab.jsx       # Tarot reading interface
│   │   ├── CompassRose.jsx     # Animated entropy compass
│   │   ├── GenerativeCardBack.jsx  # Procedural card back canvas
│   │   └── auth/
│   │       ├── AuthModal.jsx   # Sign in/up modal
│   │       ├── AuthCallback.jsx # OAuth redirect handler
│   │       └── PremiumModal.jsx # Premium upgrade modal
│   └── arcana/
│       ├── deck/rws.ts         # 78-card RWS deck definition
│       ├── entropy/             # CSPRNG, shuffle, statistical tests
│       ├── narrative/voice.ts   # Reading narrative templates
│       ├── spread/templates.ts  # 12 spread definitions
│       ├── knowledge/           # Extended card meanings + resolver
│       ├── pipeline/            # Reading orchestrator
│       └── types/               # TypeScript interfaces
├── api/
│   ├── create-checkout-session.js  # Stripe Checkout
│   ├── create-portal-session.js    # Stripe Customer Portal
│   ├── stripe-webhook.js          # Stripe event handler
│   ├── reading-narrative.js       # Server-side narrative generation
│   └── generate-card-back.js     # Card back image generation
├── supabase/migrations/
│   ├── 001_initial_schema.sql     # Core schema + RLS
│   ├── 002_arcana_engine_v2.sql   # Arcana tables
│   └── 003_card_back_storage.sql  # Card back storage
├── public/
│   ├── cards/              # 78 tarot card images (card/detail/thumb)
│   ├── favicon.svg         # Compass needle favicon
│   ├── og-image.svg        # Open Graph image
│   ├── icon-192.png        # PWA icon
│   └── icon-512.png        # PWA icon (large)
├── vercel.json             # Vercel rewrites + headers
├── vite.config.js          # Vite + PWA + obfuscation
├── tsconfig.json           # TypeScript config (arcana engine)
├── .env.example            # Environment variable template
└── README.md
```

---

## Tech Stack

- **Vite** + **React 18** — Multi-page app (landing + SPA)
- **TypeScript** — Arcana engine (entropy, deck, spreads, narrative)
- **Supabase** — Auth, PostgreSQL database, Row-Level Security
- **Stripe** — Subscriptions ($1.99/mo, $11.99/yr)
- **Vercel** — Hosting, serverless API functions
- **vite-plugin-pwa** (Workbox) — Offline-capable PWA
- **rollup-obfuscator** — Production JS obfuscation
- Canvas API — Entropy visualization, compass rose, generative card backs
- Web Crypto API — Entropy sampling (CSPRNG)
- Web Share API — Probe card sharing

---

## Premium

Free tier includes 1 probe and 1 reading per day, 6 spreads, practical tone only. Premium unlocks:
- Unlimited daily probes and readings
- All 12 spread templates
- All narrative tones (mystical, analytical, poetic, direct)
- Up to 8 domain focus tags
- Full event history
- Deep entropy analysis
- Advanced pattern detection
- Data export (JSON/CSV)
- Cloud sync across devices

---

## PWA

The app is installable as a PWA. The service worker caches all assets and Google Fonts for offline use. Works without Supabase — data persists in localStorage.

---

## Themes

Light and dark mode with full CSS custom property system. Theme persists across sessions via localStorage. Landing page and app share the same theme key (`df_theme`).

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
