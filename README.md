# Driftfield — Serendipity Engine

> An oracle in your pocket. Entropy speaks — you listen.

Driftfield is an entropy-driven serendipity engine that detects probability currents, amplifies your luck surface area, and tells you where chance is flowing. It sits at the intersection of cryptography and divination — using the same randomness primitives that secure financial systems to power an oracle that responds to your questions, intentions, and choices.

**[Live](https://driftfield.vercel.app/) | [Open Engine](https://driftfield.vercel.app/app/)**

---

## The Idea

Most randomness apps generate noise. Driftfield listens to it.

The engine continuously samples cryptographic randomness (CSPRNG) and runs statistical analysis against it — the same tests used to validate hardware random number generators. When patterns deviate from perfect randomness, that deviation becomes signal. Layer in biorhythm cycles, lunar phase, temporal gates, and a personal probability field calibrated to your behavior — and you get something that feels less like a random number generator and more like a compass that points toward the improbable.

Built on research by Wiseman (*The Luck Factor*), Shannon (*A Mathematical Theory of Communication*), Jung (*Synchronicity*), Granovetter (*The Strength of Weak Ties*), Busch (*The Serendipity Mindset*), and Taleb (*Antifragile*).

---

## Three Instruments

### SCAN
The field dashboard. Fire probes with an intention, compare two choices and let the field weigh in, log synchronicities as they happen, and track how your probability surface shifts over time. Entropy compass, field strength, signal analysis, weekly drift reports.

### ARCANA
A tarot reading engine wired directly into the entropy field. 78 Rider-Waite-Smith cards, 12 spread templates, procedurally generated card backs, and narrative that responds to your question, the cards drawn, and the current state of the field. The same cryptographic entropy that powers the scanner also shuffles the deck — every card drawn is a measurement of the field at that moment. Not random. Responsive.

### SETUP
Birth date, time, and location for personalized biorhythm and natal chart overlays. Account, subscription, theme, and data management.

---

## How Cryptography Meets Divination

Traditional tarot relies on physical shuffling — a chaotic process that's theoretically deterministic but practically unpredictable. Driftfield replaces that with cryptographic randomness from the Web Crypto API, then treats the entropy stream the way a signals engineer treats radio noise: by measuring its statistical properties in real time.

The arcana engine doesn't just pick random cards. It draws from a CSPRNG, runs the output through entropy analysis (measuring how "surprising" the randomness is at the moment of your question), and feeds that analysis into the narrative. A reading drawn during a high-entropy anomaly reads differently than one drawn during statistical calm. The field state — your probe history, synchronicity log, biorhythm phase, lunar position — becomes context that shapes how the cards speak.

The result is an oracle that's grounded in real mathematics but doesn't feel clinical. The cryptographic layer provides genuine unpredictability. The esoteric layer provides meaning. Neither works without the other.

---

## Tech

- **React** + **Vite** — Multi-page app (landing page + SPA)
- **TypeScript** — Arcana engine (entropy, deck, spreads, narrative pipeline)
- **Supabase** — Auth, PostgreSQL, Row-Level Security
- **Stripe** — Subscriptions
- **Vercel** — Hosting + serverless API
- **PWA** — Installable, offline-capable (Workbox)
- **Canvas API** — Entropy visualization, compass rose, generative card backs
- **Web Crypto API** — CSPRNG entropy sampling

---

## Premium

Free tier: 1 probe and 1 reading per day, 6 spreads, practical tone.

Premium unlocks unlimited probes and readings, all 12 spread templates, all narrative tones (mystical, analytical, poetic, direct), extended domain focus, full event history, deep entropy analysis, pattern detection, data export, and cloud sync.

---

## Development

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

- Landing page: `http://localhost:5173/`
- App: `http://localhost:5173/app/`

Push to `main` — Vercel auto-deploys.

---

## License

Proprietary. Source is visible for transparency — not licensed for use, modification, or redistribution. See [LICENSE](LICENSE).
