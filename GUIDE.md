# Driftfield — User Guide

Welcome to Driftfield, a serendipity engine that helps you notice and follow the currents of chance in your life. This guide walks you through everything the app can do.

---

## Getting Started

When you first open Driftfield, you'll see the **Scan** screen with a compass visualization and a field reading. The app works immediately — but it gets better when you personalize it.

**First thing to do:** Tap **Setup** in the bottom navigation bar and enter your birth date. This activates personalized rhythm cycles that make your readings more relevant.

---

## The Five Tabs

Driftfield has five sections, accessible from the navigation bar at the bottom of the screen.

### 1. Scan

This is your main dashboard. It shows:

- **Compass** — A live visualization that points in the direction the entropy field is pulling. The arrow direction and strength change each time the field is scanned.

- **Field Strength** — A number showing how strong the current reading is. Positive (+) means conditions favor action. Negative (−) suggests patience.

- **Scan / Stop** — Tap "Scan Field" to take a single reading, or let it run continuously for live updates every 3 seconds.

- **Signal Analysis** — A breakdown of the entropy reading. You'll see a summary like "Strong signal detected" or "Baseline." The colored bars show the raw data visually. The stats below are the specific measurements — you don't need to understand them, but they're there if you're curious.

- **Cycle Layer** — Shows the current moon phase with a description of its energy, your time-of-day window (like "Twilight Gate" or "Morning Ascent") with guidance, and your personal biorhythm waves if you've set your birth date.

- **Daily Check-in** — A quick questionnaire that measures how open you were to chance today. Answer honestly — it calculates your "surface area" score (how much opportunity for lucky encounters your day had). You can redo this once per day.

### 2. Probe

The probe is the core feature. Here's how to use it:

1. **Set an intention** — Type a question, curiosity, or desire into the text box. What are you looking for? What do you want to find? You can also leave it blank.

2. **Tap "Fire Probe"** — The app samples a large chunk of cryptographic entropy and analyzes it for deviations from pure randomness.

3. **Read your result** — You'll get:
   - A **compass direction** (like NE 47°) — the bearing the entropy points toward
   - An **action** (like "Talk to a Stranger" or "Break a Pattern") — a specific thing to do
   - A **signal strength** — how strong the anomaly was
   - A **polarity** — positive (go for it) or negative (proceed with caution)

4. **Share it** — Tap "Share Probe" to save or send a card image with your result.

5. **Follow through** — The real magic happens when you actually do what the probe suggests. Take the action, then log what happens in the Log tab.

Your last 10 probes are saved in the Probe History section below.

### 3. Log

This is your synchronicity journal. Use it to track:

- Coincidences
- Unexpected encounters
- Repeating numbers or patterns
- Meaningful accidents
- Déjà vu moments
- Anything that feels like "more than random"

**How to log an event:**

1. Type what happened in the text box
2. Set the **polarity**: positive (+), negative (−), or neutral (○)
3. Optionally add a **category** (like "work", "social", "creative") to help the pattern detector group your events
4. Tap **Log**

**Pattern Detection** — Once you have 3 or more events logged, Driftfield starts looking for patterns automatically:

- **Time patterns** — Are your synchronicities clustering in the morning? Evening? The app will tell you.
- **Theme patterns** — If you keep logging events in the same category, it surfaces that.
- **Streaks** — Multiple positive or negative events in a row.
- **Acceleration** — Events happening more frequently than your average.

Your timeline shows your most recent 20 events with timestamps and categories.

### 4. Decide

When you're facing a choice between two options, this tool helps you see which one opens you up to more possibility.

**How to use it:**

1. **Describe Option A and Option B** — Give each a short name.

2. **Answer the questions for each option:**
   - Is it new or unfamiliar?
   - Will you meet new people?
   - Will you be around strangers?
   - Is it reversible? (Can you undo it?)
   - Does it open up future possibilities?
   - Does it close off paths?

3. **Set your gut feeling** — Excited, anxious, neutral, or dread.

4. **Tap Evaluate** — You'll get a score for each option and a verdict. Higher score = more serendipity potential.

**Note:** This isn't about which option is "better" — it's about which one exposes you to more chance. Sometimes the uncomfortable option scores higher, and that's the point.

### 5. Setup

- **Your Birth Date** — Enter your birth date to activate personalized biorhythm cycles. Time and location are optional and refine the calculation. Without a birth date, the engine still works using entropy and astronomical data.

- **How It Works** — A plain-English explanation of each system layer.

- **Data** — See how many events and probes you've logged. You can clear any data category here.

---

## Key Concepts

### What is "entropy"?

Your device generates random numbers using its hardware. Driftfield reads thousands of these random values and checks whether they deviate from what pure randomness should look like. When there are deviations, that's the "signal."

### What is "surface area"?

Research by psychologist Richard Wiseman found that people who consider themselves lucky share specific behaviors: they try new things, talk to strangers, pay attention to their surroundings, and say yes to unexpected opportunities. "Surface area" is a measure of how much you do these things.

### What are "weak ties"?

Sociologist Mark Granovetter discovered that acquaintances and strangers provide more novel opportunities than close friends. Your close friends know the same people and things you do. Strangers are bridges to entirely new worlds. That's why the app tracks conversations with acquaintances separately from close friends.

### What does the compass direction mean?

The compass bearing is derived directly from the entropy data — it's not random in the traditional sense, it's a direction extracted from the pattern of deviations in the noise. Think of it as the entropy field's suggestion for where to aim your attention.

### Does this actually work?

Driftfield doesn't claim to predict the future or control probability. What it does:

1. **Gives you a reason to act** — The probe provides a specific action to take. Following through creates real opportunities.
2. **Trains your attention** — The logging system makes you notice coincidences you'd normally ignore. This is the single strongest predictor of "luckiness" in the research.
3. **Measures your openness** — The daily check-in makes you aware of how much surface area you're actually creating.
4. **Creates an amplification loop** — Notice → Log → Pattern → Act → Notice more. Each cycle sharpens your awareness.

The math is real. The entropy analysis is real. Whether the "signal" means anything beyond statistics is up to you. But the behavioral changes the app encourages — trying new things, talking to strangers, paying attention — are scientifically supported ways to increase serendipity.

---

## Tips

- **Fire a probe every morning** with an intention for the day
- **Log everything** that feels even slightly coincidental — you'll be surprised at the patterns
- **Do the daily check-in** honestly — it's the most powerful self-awareness feature
- **Actually follow the probe actions** — the app only works if you do the things it suggests
- **Share probe cards** with friends to start conversations about what you're noticing

---

## Privacy

Without an account, all data stays on your device in localStorage. When you sign in, your data syncs to the cloud via Supabase so it's available across devices. You can use the app entirely offline — cloud sync is optional.

---

## Installing as an App

Driftfield works as a Progressive Web App (PWA). To install it on your phone:

- **iPhone/iPad:** Open in Safari → tap the Share button → "Add to Home Screen"
- **Android:** Open in Chrome → tap the three-dot menu → "Add to Home Screen" or "Install App"
- **Desktop:** In Chrome or Edge, click the install icon in the address bar

Once installed, it works offline and launches like a native app.
