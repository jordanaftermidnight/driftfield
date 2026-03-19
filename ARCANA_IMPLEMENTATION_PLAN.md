# Driftfield Arcana Engine — Implementation Plan

---

## Part 1: Copyright Assessment — Waite-Smith Tarot Scans

### The Scans We Have

The `WS Tarot scans/` directory contains 313 JPGs across 4 historical editions:
- **1909 Pam A** (79 files, 825x1429px @ 300 DPI) — original "Roses & Lilies" first edition
- **1910 Pam A** (78 files, ~1140x1920px @ 1200 DPI)
- **1920s Pam B** (78 files, ~1140x1920px)
- **1920s-30s Pam C** (78 files, ~1140x1920px)

The 1909 set dimensions (825x1429) match exactly with the Wikimedia Commons "Roses & Lilies" category images (source: muzendo.jp/blog/). Visual inspection confirms these are scans of original 1909 physical cards — vintage muted coloring, period printing artifacts, NOT the US Games 1971 recolored version.

### Copyright Status

#### What IS Public Domain

| Element | Status | Basis |
|---------|--------|-------|
| PCS's original 1909 artwork | PUBLIC DOMAIN (US) | Published 1909, well before the 1929 cutoff for US public domain |
| PCS's original 1909 artwork | PUBLIC DOMAIN (UK/EU) | PCS died Sept 1951 + 70 years = expired Dec 31, 2021 |
| All pre-1931 editions (1909, 1910, 1920s) | PUBLIC DOMAIN (US) | Published before 1931 (current cutoff as of 2026) |
| Faithful scans/reproductions of the above | NOT SEPARATELY COPYRIGHTABLE (US) | *Bridgeman Art Library v. Corel Corp.* (1999): exact reproductions of 2D public domain works lack originality required for copyright |

#### What is NOT Public Domain

| Element | Status | Owner |
|---------|--------|-------|
| "Rider-Waite" trademark | TRADEMARKED | US Games Systems (perpetual) |
| 1971 US Games recolorization | COPYRIGHTED | US Games Systems (derivative work) |
| US Games card back design | COPYRIGHTED | US Games Systems |
| US Games packaging/branding | COPYRIGHTED + TRADEMARKED | US Games Systems |

#### Provenance of Our Scans

The 1909 Pam A scans appear to be the same set hosted on Wikimedia Commons under the "Rider-Waite tarot deck (Roses & Lilies)" category, sourced from muzendo.jp/blog/ and tagged as public domain. On Wikimedia, these are explicitly licensed as:

> *Public domain — The author died in 1951, so this work is in the public domain.*

The Wikimedia Commons versions are widely used across Wikipedia, sacred-texts.com, and hundreds of tarot apps and websites without legal challenge from US Games.

### Verdict: SAFE TO USE — with conditions

1. Use the **1909 original artwork** only (not any US Games colorization)
2. **Never use the trademark "Rider-Waite"** — call it "Smith-Waite", "RWS", or "Waite-Smith"
3. **Do not reproduce the US Games card back design** — design a custom one
4. **Do not copy US Games' specific color enhancements** from their 1971+ editions
5. The 1909 Pam A scans in this directory are suitable for commercial use

### Recommendation: Use Wikimedia Commons Source

For maximum legal clarity, I recommend sourcing the images from **Wikimedia Commons directly** rather than using the local scans of unclear provenance. The Wikimedia "Roses & Lilies" category has:
- All 78 cards + card back (80 files)
- Clear public domain tagging with full provenance chain
- Named files (`RWS1909 - 00 Fool.jpeg`, etc.) — no mapping needed
- Same resolution (825x1429 @ 300 DPI)

This eliminates any ambiguity about scan origin. The local scans can serve as backup/reference.

### Alternative: Custom Card Art (Zero Risk)

If any doubt remains, the nuclear option is commissioning or generating **original card art** inspired by the RWS symbolism. The card *meanings* and *symbolic elements* (tower, lightning, figures falling) are not copyrightable — only specific artistic expression is. This eliminates all copyright risk but adds significant cost/time.

---

## Part 2: Situation Assessment

### What We Have

**Existing Driftfield App** (`src/`, `api/`, `supabase/`)
- React 19 + Vite 7 SPA, pure JavaScript (no TypeScript)
- Supabase backend (auth, RLS, profiles, probes, events, decisions)
- Stripe subscriptions ($1.99/mo, $11.99/yr)
- PWA, deployed on Vercel
- 1550-line monolithic `DriftfieldApp.jsx` with 5 tabs: FIELD, PROBE, LOG, DECIDE, config
- Existing entropy engine (Shannon, chi-squared, serial correlation, Monte Carlo pi, runs)

**Arcana Engine** (`driftfield-engine-FINAL/`)
- Complete 7-stage tarot reading pipeline in TypeScript
- 78-card RWS knowledge base (22 majors at full 9-domain depth, 56 minors compositional)
- CSPRNG entropy, 6 shuffle methods, 3 pull methods, statistical field snapshots
- 10 spread templates (6 free, 4 premium)
- Narrative composition (Tier A template, Tier B local ML placeholder, Tier C Anthropic API)
- Pattern detection, premium gating, DB service layer
- 87/87 tests passing
- Detailed handoff document (`CCLI_BUILD_HANDOFF.md`)

**Waite-Smith Scans** (`WS Tarot scans/`)
- 313 JPGs, 4 historical editions, ~380MB raw
- 1909 Pam A edition is public domain (see Part 1)

### Critical Integration Challenges

| # | Challenge | Resolution |
|---|-----------|------------|
| 1 | Engine is TypeScript, app is pure JS | Vite transpiles `.ts` natively — just add `tsconfig.json` for editor support |
| 2 | 380MB of card images | Process 1909 set only: resize to 3 tiers, convert to WebP (~3-5MB total) |
| 3 | DriftfieldApp.jsx is a 1550-line monolith | Extract tabs into components before adding ARCANA |
| 4 | Scan filenames are UUID hashes | Map `_00_` through `_78_` to RWS card IDs (number in filename = card index) |
| 5 | Engine entropy vs existing entropy | They coexist — engine entropy is tarot-specific (shuffles, pulls, field snapshots) |
| 6 | Card back image | Design a custom Driftfield-branded card back (not US Games') |

---

## Part 3: Implementation Plan

### Pre-Work: Asset Pipeline & Project Setup

#### P0. Card Image Processing

**Step 1: Filename Mapping**
The filenames follow pattern `{prefix}_{NN}_{hash}.jpg` where `NN` = card index (00-78).
Map these to the engine's card IDs from `deck/rws.ts`:
- 00 = The Fool (major-00)
- 01 = The Magician (major-01)
- ...through 21 = The World (major-21)
- 22-35 = Wands Ace-King
- 36-49 = Cups Ace-King
- 50-63 = Swords Ace-King
- 64-77 = Pentacles Ace-King
- 78 = Card back

Delegate: Use Gemini Flash to visually verify a sample of 10 cards against expected ordering.

**Step 2: Batch Process**
```bash
# For each card: resize to 3 tiers, convert to WebP
# thumb: 150px wide (list views, history)
# card: 400px wide (spread layout, draw screen)
# detail: 800px wide (full reading, tapped detail)
# Tool: sips (native macOS) or sharp (Node.js)
```

**Step 3: Custom Card Back**
Design a Driftfield-branded card back using the existing color palette:
- Background: `#06060e` (app bg)
- Accent: `#C9A84C` (gold, tarot accent from handoff)
- Pattern: entropy-inspired (compass rose motif, field lines)
- NOT a reproduction of any existing card back design

Output: `public/cards/{thumb,card,detail}/` + `public/cards/back.webp`

#### P1. TypeScript Support
```bash
npm install -D typescript @types/node
```
Add minimal `tsconfig.json` for editor support. Vite handles `.ts` transpilation out of the box.

#### P2. Engine Integration
Move `driftfield-engine-FINAL/src/` contents into `src/arcana/`:
```
src/arcana/
  types/index.ts
  entropy/{csprng,stats,shuffle,engine,index}.ts
  deck/rws.ts
  knowledge/{types,resolver,rws-majors*,rws-minors,index}.ts
  narrative/voice.ts
  pipeline/orchestrator.ts
  spread/templates.ts
  premium/gates.ts
  db/service.ts
```
Move `002_arcana_engine_v2.sql` into `supabase/migrations/`.

#### P3. Component Decomposition (High Risk)
Extract tabs from the DriftfieldApp.jsx monolith:
- `src/components/FieldTab.jsx`
- `src/components/ProbeTab.jsx`
- `src/components/LogTab.jsx`
- `src/components/DecideTab.jsx`
- `src/components/ConfigTab.jsx`
- `DriftfieldApp.jsx` becomes a thin tab shell + shared state

Git commit after each extraction. Verify app works between each.

---

### Phase 1: Backend Wiring (Week 1)

#### 1.1 Database Migration
Run `002_arcana_engine_v2.sql` against Supabase. Verify 5 tables + RLS + helpers.

#### 1.2 Birth Chart Wrapper
Create `src/arcana/astro/birth-chart.ts` wrapping `circular-natal-horoscope-js`.
Free: sun sign. Premium: full chart.

#### 1.3 React Hook: useReading()
Create `src/hooks/useReading.js`:
- State machine: idle -> questioning -> configuring -> drawing -> reading -> saved
- Wraps `executeReading()` + `saveAndAnalyze()`
- Connects to existing Supabase client and auth context

#### 1.4 Premium Gating Extension
Extend `src/lib/premium.js` with arcana gates from `gates.ts`.

#### 1.5 Analytics Extension
Add `arcana.*` event names to `src/lib/analytics.js` using existing pattern.

---

### Phase 2: Reading Flow UI (Weeks 2-3)

#### 2.1 ARCANA Tab
Add to tab bar: `[ FIELD ] [ PROBE ] [ ARCANA ] [ LOG ] [ DECIDE ]`
New component: `src/components/ArcanaTab.jsx`

#### 2.2 Question Input Screen
Large text input with rotating placeholders from `voice.ts`.
Domain tag pills. "Or leave empty" subtext.

#### 2.3 Settings Panel
Spread selector (horizontal scroll, tier badges).
Shuffle/pull/tone pickers. Lock icon on premium features.

#### 2.4 Draw Animation Screen
Reuse entropy compass from FIELD tab.
Cards face-down in spread layout positions.
CSS 3D flip animation (0.6s) on tap, reveal in sequence order.
WebP card images from processed assets.

#### 2.5 Reading Display Screen
Continuous prose narrative (never bullets).
Tappable card sections for deeper detail.
Collapsible entropy panel.
Save + Rate buttons.

#### 2.6 Reading History
List view of past readings. Tap to view full.
Free: 7 days. Premium: all time.

---

### Phase 3: Onboarding + Polish (Week 3)

#### 3.1 Birth Chart Onboarding
Post-signup flow: date -> time (optional) -> location.
Geocoding autocomplete. Calculate chart client-side. Save to user_context.
Requires: `VITE_GEOCODING_API_KEY`

#### 3.2 Reading Defaults
Settings page: default spread, shuffle, pull, tone.
Stored in user_context, pre-fills each new reading.

#### 3.3 LOG Integration
Tarot readings appear in drift timeline alongside probe events.

---

### Phase 4: Premium Features (Week 4)

#### 4.1 Tier C Narrative (Anthropic API)
Vercel serverless: `api/arcana-narrative.js`
Circuit breaker (port from Conduit): 3 failures -> 60s open -> silent Tier A fallback.
Streaming response. Requires: `ANTHROPIC_API_KEY` server-side only.

#### 4.2 Journal
Note interface, save/pin/unpin, 90-day rolling, tags.

#### 4.3 Patterns
Post-save patterns in reading UI. Dismissable. History view.

---

## Part 4: Execution Strategy

### Delegation & Token Optimization

| Task | Executor | Why |
|------|----------|-----|
| Card filename-to-ID mapping verification | Gemini Flash (vision) | View 10 sample cards, confirm ordering hypothesis |
| Image batch processing | Shell script (sips) | Pure CLI, zero LLM tokens |
| SQL migration | Supabase CLI | Direct execution |
| Component extraction (P3) | Claude (sequential, careful) | Highest-risk refactor, needs full context |
| Engine file relocation (P2) | Claude Agent (background) | Mechanical moves + import path fixes |
| useReading hook (1.3) | Claude (focused) | Core integration, needs both engine + app context |
| UI components (2.2-2.6) | Claude with plan-implementer skill | Well-specified from handoff doc |
| Card flip CSS animation | Context7 MCP (React docs) | Current best practices lookup |
| Tier C API endpoint (4.1) | Claude with claude-api skill | Anthropic SDK integration |
| Circuit breaker port (4.1) | Claude Agent (read Conduit, port to TS) | Cross-project reference |
| Test validation post-move | Claude Agent (background) | Run 87 tests after relocation |
| Card back design | User decision / separate task | Creative direction needed |

### Recommended Session Order

**Session 1 — Foundation**
1. Image pipeline (Gemini verifies mapping, sips processes)
2. TypeScript setup (`tsconfig.json`, deps)
3. Engine files -> `src/arcana/`
4. SQL migration prep

**Session 2 — Decomposition**
5. Extract tabs from DriftfieldApp.jsx (commit after each)
6. Verify app still works

**Session 3 — Core Flow**
7. `useReading()` hook
8. ARCANA tab + question/settings screens
9. Premium gating extension

**Session 4 — Draw & Display**
10. Draw animation (compass reuse + card flip)
11. Reading display
12. Reading history

**Session 5 — Onboarding & Premium**
13. Birth chart onboarding
14. Tier C narrative endpoint
15. Journal + patterns

### Risk Mitigation

- **Monolith decomposition**: Git commit after each tab extraction. Test between each.
- **Engine integration**: Run test-entropy.ts and test-knowledge.ts after relocation.
- **Image mapping**: Verify against known cards before batch processing all 79.
- **TypeScript in JS project**: Keep engine as `.ts`, keep existing files as `.jsx`. Don't convert existing code.
- **Copyright**: Use 1909 public domain artwork only. Never say "Rider-Waite". Design custom card back.

---

## Part 5: File Inventory — What Ships in v1

```
src/
  arcana/                         <- NEW (engine)
    types/index.ts
    entropy/{csprng,stats,shuffle,engine,index}.ts
    deck/rws.ts
    knowledge/{types,resolver,majors*,minors,index}.ts
    narrative/voice.ts
    pipeline/orchestrator.ts
    spread/templates.ts
    premium/gates.ts
    db/service.ts
    astro/birth-chart.ts
  components/                     <- NEW (extracted + arcana)
    FieldTab.jsx
    ProbeTab.jsx
    ArcanaTab.jsx                 <- NEW
    LogTab.jsx
    DecideTab.jsx
    ConfigTab.jsx
  hooks/
    useAuth.jsx                   (existing)
    useProbes.js                  (existing)
    useEvents.js                  (existing)
    useReading.js                 <- NEW
  lib/
    supabase.js                   (existing)
    premium.js                    (extended)
    analytics.js                  (extended)
  DriftfieldApp.jsx               (slimmed to tab shell)
  main.jsx                        (existing)

public/cards/                     <- NEW (processed images)
  thumb/                          (150px WebP)
  card/                           (400px WebP)
  detail/                         (800px WebP)
  back.webp

api/
  create-checkout-session.js      (existing)
  create-portal-session.js        (existing)
  stripe-webhook.js               (existing)
  arcana-narrative.js             <- NEW (Phase 4)

supabase/migrations/
  001_initial_schema.sql          (existing)
  002_arcana_engine_v2.sql        <- NEW
```

### Cleanup After Integration
- Delete `driftfield-engine-FINAL/` and `driftfield-engine-FINAL.tar.gz`
- Delete `WS Tarot scans.zip`
- Move `WS Tarot scans/` to `_assets/tarot-scans-raw/` (reference only, gitignored)
- Add `_assets/` to `.gitignore`

---

## Decision Points Requiring Your Input

1. **Card images**: Use 1909 Pam A scans (public domain) or commission custom art?
2. **Card back**: Design direction for custom Driftfield-branded card back?
3. **Wikimedia source**: Download clean copies from Wikimedia Commons (clear provenance) or use local scans?
4. **Deck naming**: "Smith-Waite" or "Waite-Smith" or just "Classic" in the UI?
5. **Session 1 start**: Ready to begin with the foundation work?
