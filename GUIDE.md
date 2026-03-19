# Driftfield — User Guide

Welcome to Driftfield, an entropy-driven oracle that uses cryptographic randomness and statistical analysis to detect probability currents in your life. This guide walks you through everything the app can do.

---

## Getting Started

When you first open Driftfield, you'll see the **Scan** screen with a compass visualization and a field reading. The app works immediately — but it gets better when you personalize it.

**First thing to do:** Tap **Setup** and enter your birth date. This activates personalized biorhythm cycles and natal chart overlays that shape your readings.

---

## The Three Tabs

### 1. Scan

Your main dashboard. Everything flows through here.

- **Compass** — A live visualization that points in the direction the entropy field is pulling. Direction and strength change with each scan.

- **Field Strength** — Composite score showing current conditions. Positive (+) favors action. Negative (−) suggests patience. When resonance is high, you'll see a prompt to fire a probe or draw cards.

- **Scan / Stop** — Tap "Scan Field" for a single reading, or let it run continuously for live updates.

- **Signal Analysis** — Breakdown of the entropy reading. Summary labels like "Strong signal detected" or "Baseline." Colored bars show raw data visually. The stats below are the specific measurements — Shannon entropy, chi-squared, serial correlation, runs test, Monte Carlo estimation.

- **Entropy Probe** — The core feature. Expandable section with two modes:
  - **Single mode** — Set an intention, fire the probe. The engine samples cryptographic entropy, analyzes deviations from pure randomness, and returns a compass bearing, an action to take, signal strength, and polarity.
  - **Compare mode** — Facing a choice? Enter two options, toggle a few quick assessments for each (novelty, new people, opens possibilities, gut feeling), and fire. You get decision scores alongside the probe result — which option exposes you to more chance.

- **Cycle Layer** — Moon phase with energy description, time-of-day window (like "Twilight Gate" or "Morning Ascent"), and personal biorhythm waves if your birth date is set.

- **Quick Log** — Log synchronicities inline. Type what happened, set polarity (+/−/○), tap Log. Events auto-link to your most recent probe when relevant.

- **Daily Surface Area** — Quick check-in that measures how open you were to chance today. Calculates a score based on research-backed behaviors (trying new things, talking to strangers, paying attention).

- **Activity Feed** — Recent probes, events, and readings in one timeline.

- **Weekly Drift Report** — Pattern summary across your recent activity.

### 2. Arcana

A full tarot reading engine wired into the entropy field.

The same cryptographic randomness that powers the scanner also shuffles the deck. Every card drawn is a measurement of the field at the moment of your question. The arcana engine uses 78 Waite-Smith cards (the original 1909 public domain artwork by Pamela Colman Smith), 10 spread templates, and procedurally generated card backs unique to each reading.

**How to use it:**

1. Choose a spread — from a simple 3-card draw to a full Celtic Cross
2. Set your question or domain focus
3. Draw your cards — the entropy engine shuffles and pulls
4. Read the narrative — generated in response to your specific question, the cards drawn, their positions, and the current field state

The narrative isn't generic. It responds to what was actually drawn, references card relationships and position meanings, and adjusts its voice based on the entropy conditions during your reading. A reading drawn during a high-entropy anomaly reads differently than one drawn during statistical calm.

**Tones:** Practical (free), plus esoteric, analytical, and poetic (premium).

**Spreads:** 6 free, 10 total with premium.

### 3. Setup

- **Birth Date** — Enter birth date, time, and location to activate biorhythm cycles and natal chart overlays. Time and location are optional and refine the calculation.

- **Account** — Sign in to sync data across devices. Manage your subscription.

- **Theme** — Light and dark mode toggle.

- **Data** — See totals for events, probes, and readings. Clear any category. Export data (premium).

---

## Key Concepts

### What is "entropy"?

Your device generates random numbers using hardware-level cryptographic randomness (CSPRNG — the same primitive that secures HTTPS connections and financial transactions). Driftfield reads thousands of these values and runs statistical tests to check whether they deviate from what pure randomness should look like. When there are deviations, that's the signal.

### How do cryptography and divination connect?

Traditional tarot relies on physical shuffling — a chaotic process that's practically unpredictable. Driftfield replaces that with cryptographic randomness, then treats the entropy stream the way a signals engineer treats radio noise: by measuring its statistical properties. The cryptographic layer provides genuine unpredictability. The esoteric layer provides meaning. The arcana engine bridges both — every card drawn carries the statistical fingerprint of the moment it was pulled.

### What is "surface area"?

Research by psychologist Richard Wiseman found that people who consider themselves lucky share specific behaviors: they try new things, talk to strangers, pay attention to their surroundings, and say yes to unexpected opportunities. "Surface area" is a measure of how much you do these things.

### What are "weak ties"?

Sociologist Mark Granovetter discovered that acquaintances and strangers provide more novel opportunities than close friends. Your close friends know the same people and things you do. Strangers are bridges to entirely new worlds.

### What does the compass direction mean?

The compass bearing is derived from the entropy data — a direction extracted from the pattern of deviations in the noise. Think of it as the field's suggestion for where to aim your attention.

### Does this actually work?

Driftfield doesn't claim to predict the future or control probability. What it does:

1. **Gives you a reason to act** — The probe provides a specific action. Following through creates real opportunities.
2. **Trains your attention** — The logging system makes you notice coincidences you'd normally ignore. This is the single strongest predictor of "luckiness" in the research.
3. **Measures your openness** — The daily check-in makes you aware of how much surface area you're actually creating.
4. **Creates an amplification loop** — Notice, log, detect patterns, act, notice more. Each cycle sharpens your awareness.

The math is real. The entropy analysis is real. Whether the signal means anything beyond statistics is up to you. But the behavioral changes the app encourages are scientifically supported ways to increase serendipity.

---

## Tips

- **Fire a probe every morning** with an intention for the day
- **Log everything** that feels even slightly coincidental — patterns emerge from volume
- **Do the daily check-in** honestly — it's the most powerful self-awareness tool
- **Follow through on probe actions** — the engine only works if you act on what it suggests
- **Draw cards when resonance is high** — the field tells you when conditions are charged

---

## Privacy

Without an account, all data stays on your device in localStorage. Sign in to sync across devices via encrypted cloud storage. The app works entirely offline — cloud sync is optional.

---

## Installing as an App

Driftfield is a Progressive Web App (PWA). To install:

- **iPhone/iPad:** Open in Safari, tap Share, then "Add to Home Screen"
- **Android:** Open in Chrome, tap the three-dot menu, then "Install App"
- **Desktop:** In Chrome or Edge, click the install icon in the address bar

Once installed, it works offline and launches like a native app.
