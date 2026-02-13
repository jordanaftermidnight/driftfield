# DRIFTFIELD: Migration & Integration Guide
## From GitHub Pages → Vercel + Supabase + Stripe

> **This document is the handoff to ccli.** It contains everything needed to
> integrate the migration package into the existing driftfield codebase.
> Read the entire document before starting.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [What's Provided vs What Needs Building](#2-whats-provided-vs-what-needs-building)
3. [Setup Steps (Manual — Do First)](#3-setup-steps-manual--do-first)
4. [Integration Tasks (ccli)](#4-integration-tasks-ccli)
5. [File Map](#5-file-map)
6. [Database Schema Notes](#6-database-schema-notes)
7. [Premium Feature Gating Logic](#7-premium-feature-gating-logic)
8. [Stripe Integration Flow](#8-stripe-integration-flow)
9. [Auth Flow](#9-auth-flow)
10. [Analytics Events](#10-analytics-events)
11. [Testing Checklist](#11-testing-checklist)
12. [Deployment](#12-deployment)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   VERCEL                         │
│                                                  │
│  ┌──────────┐   ┌─────────────────────────────┐ │
│  │ Vite App │   │     api/ (serverless)        │ │
│  │ (React)  │   │                              │ │
│  │          │   │  create-checkout-session.js   │ │
│  │ Auth     │   │  stripe-webhook.js           │ │
│  │ Probes   │   │  create-portal-session.js    │ │
│  │ Events   │   │                              │ │
│  │ Premium  │   └──────────────┬──────────────┘ │
│  └────┬─────┘                  │                 │
│       │                        │                 │
└───────┼────────────────────────┼─────────────────┘
        │                        │
        ▼                        ▼
┌──────────────┐         ┌──────────────┐
│   SUPABASE   │         │    STRIPE    │
│              │         │              │
│  PostgreSQL  │         │  Checkout    │
│  Auth        │         │  Webhooks    │
│  RLS         │         │  Portal      │
│  Edge Funcs  │         │  Billing     │
└──────────────┘         └──────────────┘
```

**Current stack:** Vite + React 18, deployed to GitHub Pages via Actions
**Target stack:** Same Vite + React 18, deployed to Vercel, backed by Supabase + Stripe

---

## 2. What's Provided vs What Needs Building

### ✅ PROVIDED (in this migration package)

| File | Purpose |
|------|---------|
| `supabase/migrations/001_initial_schema.sql` | Complete DB schema: profiles, probes, events, decisions, field_readings, analytics. RLS policies. Helper functions. |
| `src/lib/supabase.js` | Supabase client init |
| `src/lib/premium.js` | Feature gating logic, tier definitions, pricing constants |
| `src/lib/analytics.js` | Event tracking (fire-and-forget to Supabase) |
| `src/hooks/useAuth.jsx` | Auth context + provider. Session, profile, sign in/up/out, Google OAuth, magic link. |
| `src/hooks/useProbes.js` | Probe lifecycle: server-side limit check → insert → increment counter → track |
| `src/hooks/useEvents.js` | Synchronicity log CRUD with premium history gating |
| `src/components/auth/AuthModal.jsx` | Sign in/up modal (email, magic link, Google) |
| `src/components/auth/AuthCallback.jsx` | OAuth/magic link redirect handler |
| `src/components/auth/PremiumModal.jsx` | Premium upgrade modal with Stripe Checkout |
| `api/create-checkout-session.js` | Vercel serverless: create Stripe Checkout |
| `api/stripe-webhook.js` | Vercel serverless: sync Stripe → Supabase |
| `api/create-portal-session.js` | Vercel serverless: customer portal for managing subscription |
| `vercel.json` | Vercel routing, headers, SPA rewrites |
| `.env.example` | All environment variables needed |

### 🔧 NEEDS BUILDING (ccli tasks)

| Task | Priority | Description |
|------|----------|-------------|
| **Wire AuthProvider into App** | P1 | Wrap App root with `<AuthProvider>` |
| **Replace localStorage with Supabase** | P1 | All probe/event/field reading storage → Supabase calls via hooks |
| **Add auth UI triggers** | P1 | Sign in button in header, auth gate on probe firing |
| **Add premium gate triggers** | P2 | Show PremiumModal when free user hits limits |
| **Add /auth/callback route** | P2 | React Router route for OAuth redirect |
| **Install dependencies** | P1 | `@supabase/supabase-js`, `stripe` (api only) |
| **Migrate from GH Pages to Vercel** | P1 | Connect repo, set env vars, disable GH Actions deploy |
| **Port existing entropy engine** | P1 | Keep all existing entropy/probe logic, just save results via `useProbes.fireProbe()` |
| **Port field reading component** | P2 | Wire field assessment form to `field_readings` table |
| **Add decision evaluator persistence** | P2 | Wire to `decisions` + `decision_options` tables |
| **Add Manage Subscription button** | P3 | For premium users: call `/api/create-portal-session` |
| **Add data export UI** | P3 | Premium feature: export events/probes as JSON |
| **Push notifications** | P4 | Service worker + Supabase realtime for field shift alerts |

---

## 3. Setup Steps (Manual — Do First)

### 3A. Create Supabase Project

1. Go to [supabase.com](https://supabase.com), create account, new project
2. Choose region closest to users (EU West if primarily European)
3. Save the project URL and keys:
   - `Project URL` → `VITE_SUPABASE_URL` + `SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **SQL Editor**, paste entire contents of `001_initial_schema.sql`, run
5. Go to **Authentication > Providers**:
   - Email: Enable (already default)
   - Google: Enable, add OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
6. Go to **Authentication > URL Configuration**:
   - Site URL: `https://driftfield.app` (or your production URL)
   - Redirect URLs: Add `https://driftfield.app/auth/callback` and `http://localhost:5173/auth/callback`

### 3B. Create Stripe Account

1. Go to [stripe.com](https://stripe.com), create account
2. Go to **Developers > API Keys**, save:
   - `Secret key` → `STRIPE_SECRET_KEY`
3. Go to **Products**, create product "Driftfield Premium":
   - Price 1: $3.99/month recurring → save Price ID → `VITE_STRIPE_PRICE_MONTHLY`
   - Price 2: $24.99/year recurring → save Price ID → `VITE_STRIPE_PRICE_YEARLY`
4. Go to **Developers > Webhooks**, add endpoint:
   - URL: `https://driftfield.app/api/stripe-webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
     - `invoice.payment_succeeded`
   - Save signing secret → `STRIPE_WEBHOOK_SECRET`
5. **Customer Portal**: Go to **Settings > Billing > Customer Portal**
   - Enable: cancel subscription, update payment method
   - This allows users to self-serve billing changes

### 3C. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com), connect GitHub
2. Import `jordanaftermidnight/driftfield` repository
3. Framework: Vite (auto-detected)
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add ALL environment variables from `.env.example`
7. Deploy
8. Set custom domain: `driftfield.app` (or chosen domain)
9. Update Supabase redirect URLs + Stripe webhook URL with production domain
10. Disable GitHub Actions deploy workflow (or delete `.github/workflows/`)

---

## 4. Integration Tasks (ccli)

### Task 1: Install Dependencies

```bash
npm install @supabase/supabase-js
```

Note: `stripe` is only needed in `api/` functions. Vercel's serverless runtime
handles this via a separate `package.json` in `api/` or via the root one — 
Stripe SDK is loaded server-side only.

```bash
npm install stripe
```

### Task 2: Copy Migration Files

Copy into the existing project:
```
src/lib/supabase.js        → src/lib/supabase.js
src/lib/premium.js         → src/lib/premium.js
src/lib/analytics.js       → src/lib/analytics.js
src/hooks/useAuth.jsx      → src/hooks/useAuth.jsx
src/hooks/useProbes.js     → src/hooks/useProbes.js
src/hooks/useEvents.js     → src/hooks/useEvents.js
src/components/auth/*      → src/components/auth/*
api/*                      → api/*
vercel.json                → vercel.json
.env.example               → .env.example
```

### Task 3: Wrap App with AuthProvider

In the main entry point (likely `src/main.jsx` or `src/App.jsx`):

```jsx
import { AuthProvider } from './hooks/useAuth';

// Wrap the app
function App() {
  return (
    <AuthProvider>
      {/* existing app content */}
    </AuthProvider>
  );
}
```

### Task 4: Replace localStorage with Supabase

This is the core migration. The existing app stores probes, events, and 
field readings in localStorage. Each needs to be replaced:

**Probes:**
- Find where probes are stored to localStorage
- Import and use `useProbes()` hook instead
- Call `fireProbe(probeData)` which handles: limit check, insert, counter increment, streak update, analytics
- The entropy engine logic stays exactly the same — only the storage layer changes
- `fireProbe` returns `{ success, probe, error, limitReached }`
- If `limitReached === true`, show PremiumModal

**Events (Synchronicity Log):**
- Find where events are stored to localStorage
- Import and use `useEvents()` hook
- `logEvent(eventData)` for new entries
- `getEvents()` returns gated results (7-day for free, all for premium)
- `deleteEvent(id)`, `updateEvent(id, updates)` for management
- `exportEvents()` for premium data export

**Field Readings:**
- Direct Supabase insert:
```js
await supabase.from('field_readings').insert({
  user_id: user.id,
  novelty_exposure: value,
  // ... other fields
}).select().single();
```

**Decisions:**
- Direct Supabase inserts to `decisions` and `decision_options` tables
- Follow same pattern as events hook

### Task 5: Add Auth UI

**Header/Nav:**
```jsx
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from '../components/auth/AuthModal';

function Header() {
  const { isAuthenticated, profile, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      {isAuthenticated ? (
        <button onClick={signOut}>Sign Out</button>
      ) : (
        <button onClick={() => setShowAuth(true)}>Tune In</button>
      )}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
```

**Auth Gate on Probe Firing:**
```jsx
const { isAuthenticated } = useAuth();
const [showAuth, setShowAuth] = useState(false);

const handleFireProbe = () => {
  if (!isAuthenticated) {
    setShowAuth(true);
    return;
  }
  // proceed with probe
};
```

### Task 6: Add Premium Gate Triggers

When a free user hits a limit, show the upgrade modal:

```jsx
import { PremiumModal } from '../components/auth/PremiumModal';
import { canFireProbe } from '../lib/premium';

const [showPremium, setShowPremium] = useState(false);

// On probe fire attempt:
const { allowed } = canFireProbe(profile);
if (!allowed) {
  setShowPremium(true);
  return;
}

// In events list, when free user scrolls past 7 days:
<div className="premium-gate">
  <p>Older events available with premium</p>
  <button onClick={() => setShowPremium(true)}>Unlock Full History</button>
</div>
```

### Task 7: Add Routing

If not already using React Router:

```bash
npm install react-router-dom
```

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthCallback } from './components/auth/AuthCallback';

<BrowserRouter>
  <Routes>
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/*" element={<MainApp />} />
  </Routes>
</BrowserRouter>
```

### Task 8: Analytics Integration

Call `trackAppOpen()` once on mount:

```jsx
import { trackAppOpen, trackTabView } from './lib/analytics';

useEffect(() => {
  trackAppOpen();
}, []);

// When user switches tabs:
const handleTabChange = (tab) => {
  trackTabView(tab);
  // ... existing tab logic
};
```

---

## 5. File Map

```
driftfield/
├── api/                              # Vercel serverless functions
│   ├── create-checkout-session.js    # Stripe Checkout creation
│   ├── create-portal-session.js      # Stripe Customer Portal
│   └── stripe-webhook.js            # Stripe → Supabase sync
├── src/
│   ├── components/
│   │   └── auth/
│   │       ├── AuthModal.jsx         # Sign in/up modal
│   │       ├── AuthCallback.jsx      # OAuth redirect handler
│   │       └── PremiumModal.jsx      # Upgrade modal
│   ├── hooks/
│   │   ├── useAuth.jsx              # Auth context + provider
│   │   ├── useProbes.js             # Probe CRUD + limit enforcement
│   │   └── useEvents.js             # Event CRUD + premium gating
│   ├── lib/
│   │   ├── supabase.js              # Supabase client
│   │   ├── premium.js               # Feature gating logic
│   │   └── analytics.js             # Event tracking
│   ├── LuckFieldDetector.jsx        # EXISTING - main app component
│   └── main.jsx                     # EXISTING - entry point (wrap with AuthProvider)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql   # Complete database schema
├── vercel.json                       # Vercel config
├── .env.example                      # Env vars template
└── MIGRATION_GUIDE.md               # This file
```

---

## 6. Database Schema Notes

### Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | User data, subscription status, streak, counters | Own row only |
| `probes` | Every probe fired, with full entropy analysis | Own rows only |
| `events` | Synchronicity log entries | Own rows only |
| `decisions` | Decision evaluator questions | Own rows only |
| `decision_options` | Options for each decision with scores | Own rows only |
| `field_readings` | Daily field assessments (1 per day) | Own rows only |
| `user_analytics` | Lightweight event tracking | Insert + read own |

### Key Functions (RPC)

| Function | Purpose | Called By |
|----------|---------|----------|
| `check_probe_limit(user_id)` | Returns allowed, remaining, is_premium | useProbes hook before firing |
| `increment_probe_count(user_id)` | +1 daily and total counters | useProbes hook after firing |
| `update_streak(user_id)` | Update consecutive day streak | useProbes hook after firing |
| `get_user_stats(user_id)` | Dashboard data aggregate | Stats/profile component |
| `get_events_gated(user_id, limit)` | Events with 7-day free limit | useEvents hook |

### Auto-triggers

- **on_auth_user_created**: Auto-creates profile row when user signs up
- **profiles_updated_at**: Auto-updates `updated_at` timestamp on profile changes

---

## 7. Premium Feature Gating Logic

Gating happens at **two levels**:

### Server-side (authoritative)
- `check_probe_limit()` RPC enforces 1/day for free
- `get_events_gated()` RPC limits free users to 7-day history
- RLS prevents direct table access bypassing these functions
- Stripe webhook is the only thing that can set `subscription_tier = 'premium'`

### Client-side (UI only)
- `premium.js` exports `getFeatureLimits(tier, status)` for conditional rendering
- `canFireProbe(profile)` for optimistic probe button state
- `hasFeature(feature, profile)` for generic feature checks
- These are for UX — never trust them for actual gating

### Free vs Premium Matrix

| Feature | Free | Premium |
|---------|------|---------|
| Probes/day | 1 | Unlimited |
| Event history | 7 days | All time |
| Decision options | 2 max | Unlimited |
| Entropy analysis | Summary | Full (Shannon, χ², MC, serial, runs) |
| Pattern detection | Basic | Full (temporal, thematic, polarity) |
| Probe card styling | Default | Custom colors + sigils |
| Cloud sync | ✗ | ✓ |
| Push notifications | ✗ | ✓ |
| Data export | ✗ | ✓ |
| Continuous scanning | ✗ | ✓ |
| Statistics dashboard | ✗ | ✓ |

---

## 8. Stripe Integration Flow

### Checkout Flow
```
User clicks "Upgrade" 
  → PremiumModal opens
  → User selects monthly/yearly
  → POST /api/create-checkout-session { priceId, userId, email }
  → Stripe Checkout page (hosted by Stripe)
  → User pays
  → Stripe fires webhook: checkout.session.completed
  → /api/stripe-webhook receives it
  → Updates profiles.subscription_tier = 'premium' via service role
  → User redirected back to app with ?payment=success
  → App refreshes profile, sees premium, unlocks features
```

### Renewal Flow
```
Stripe auto-charges on renewal date
  → invoice.payment_succeeded webhook
  → Updates subscription_expires_at
  
If payment fails:
  → invoice.payment_failed webhook
  → Sets subscription_status = 'past_due'
  → User still has access (grace period)
  → Stripe retries payment per retry schedule
  
If all retries fail:
  → customer.subscription.deleted webhook
  → Sets subscription_tier = 'free'
```

### Customer Portal
```
Premium user clicks "Manage Subscription"
  → POST /api/create-portal-session { customerId }
  → Redirect to Stripe-hosted portal
  → User can: cancel, update payment, view invoices
  → Changes trigger webhooks → sync back to Supabase
```

---

## 9. Auth Flow

### Email/Password
```
User enters email + password → signUp() or signIn()
  → Supabase creates user in auth.users
  → Trigger auto-creates profiles row
  → Session stored in browser
  → useAuth provides session + profile everywhere
```

### Magic Link
```
User enters email → signInWithMagicLink()
  → Supabase sends email with login link
  → User clicks link → redirected to /auth/callback
  → AuthCallback exchanges code for session
  → Redirect to app root
```

### Google OAuth
```
User clicks "Continue with Google" → signInWithGoogle()
  → Redirect to Google consent screen
  → Google redirects to /auth/callback
  → AuthCallback exchanges code for session
  → Redirect to app root
```

---

## 10. Analytics Events

| Event | When | Metadata |
|-------|------|----------|
| `app_open` | First mount per session | referrer, viewport, standalone |
| `probe_fired` | After successful probe | anomaly_level, has_intention, action_category |
| `event_logged` | After synchronicity log entry | category |
| `decision_created` | After decision evaluator use | — |
| `probe_shared` | After probe card share | probe_id |
| `field_read` | After field assessment | — |
| `tab_viewed` | Tab switch | tab name |
| `premium_cta_clicked` | Premium modal interaction | trigger location |
| `pwa_installed` | PWA install prompt accepted | — |

All events are fire-and-forget. They write to `user_analytics` table.
Query them in Supabase dashboard or build an admin view later.

---

## 11. Testing Checklist

### Auth
- [ ] Email/password sign up creates profile
- [ ] Email/password sign in restores session
- [ ] Magic link sends email and completes login
- [ ] Google OAuth completes login
- [ ] Sign out clears session
- [ ] Profile auto-created with `subscription_tier = 'free'`

### Probes
- [ ] Unauthenticated user → shown auth modal
- [ ] Free user can fire 1 probe per day
- [ ] Free user blocked on 2nd probe → shown premium modal
- [ ] Probe data saved to `probes` table
- [ ] Daily counter increments
- [ ] Streak updates correctly
- [ ] Counter resets next day

### Premium
- [ ] Checkout creates Stripe session
- [ ] After payment, `subscription_tier = 'premium'` in profiles
- [ ] Premium user can fire unlimited probes
- [ ] Premium user sees full event history
- [ ] Premium user can export data
- [ ] Customer portal accessible for premium users
- [ ] Cancellation sets `subscription_tier = 'free'`

### Events
- [ ] Can log synchronicity event
- [ ] Free user: only sees last 7 days
- [ ] Premium user: sees full history
- [ ] Can update/delete events
- [ ] Export generates valid JSON

### Stripe (use Stripe test mode)
- [ ] Test card `4242 4242 4242 4242` completes checkout
- [ ] Webhook received and processes correctly
- [ ] Failed payment `4000 0000 0000 0002` triggers past_due
- [ ] Portal allows cancellation

---

## 12. Deployment

### First Deploy
1. Complete all setup steps (section 3)
2. Push migration files to `main` branch
3. Vercel auto-deploys on push
4. Verify: visit production URL, check auth flow
5. Test Stripe webhook with Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe-webhook`
6. Run through testing checklist

### Ongoing
- Vercel auto-deploys on every push to `main`
- Supabase schema changes: add new migration files, run via SQL Editor
- Stripe config changes: via Stripe Dashboard
- Environment variable changes: via Vercel Dashboard > Settings > Environment Variables

### Cost at Scale
| Users | Supabase | Vercel | Stripe | Total |
|-------|----------|--------|--------|-------|
| 0-500 | $0 (free) | $0 (free) | $0 + 2.9% per txn | **$0** |
| 500-2K | $0 (free) | $0 (free) | ~$50/mo fees | **~$50** |
| 2K-10K | $25/mo (Pro) | $20/mo (Pro) | ~$200/mo fees | **~$245** |
| 10K+ | $25/mo+ | $20/mo+ | Scales with revenue | **Revenue positive** |

---

## Quick Start Summary

```bash
# 1. Install deps
npm install @supabase/supabase-js stripe

# 2. Copy migration files into project

# 3. Create .env.local from .env.example, fill in keys

# 4. Run Supabase migration (SQL Editor)

# 5. Wrap App with <AuthProvider>

# 6. Replace localStorage calls with hooks

# 7. Add auth/premium modals to UI

# 8. Test locally: npm run dev

# 9. Push to GitHub → Vercel auto-deploys

# 10. Verify production, test Stripe flow
```

---

*Built for driftfield by Claude. All server-side enforcement is authoritative.*
*Client-side gating is for UX only. The database is the source of truth.*
