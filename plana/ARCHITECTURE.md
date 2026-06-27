# Plana — Backend Architecture

## Overview

Plana is an AI-powered event and trip planning app for Uganda. Users can get realistic cost breakdowns, save toward a goal, find local service providers, and interact via USSD on a basic phone. The backend is built entirely with Next.js App Router API routes.

---

## Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Single codebase for frontend and backend. API routes colocate with pages. |
| AI | Google Gemini Flash (gemini-2.0-flash-lite) | Free tier, fast enough for planning advice, good knowledge of African markets. |
| Database | Supabase (PostgreSQL) | Free tier, built-in auth, real-time capable, easy admin dashboard. |
| SMS & USSD | Africa's Talking | Only provider with reliable USSD support in Uganda. SMS for OTP and alerts. |
| Language | TypeScript | Type safety across all routes and shared types. |

---

## Architectural Decisions

### 1. Phone-first authentication (OTP via AT SMS)
**Decision:** Use phone number + OTP instead of email/password.
**Why:** Most users in Uganda are more reachable by phone than email. Phone numbers also tie USSD sessions to web app accounts — when a user asks a question via USSD, we know exactly who they are by their `phoneNumber` field that AT sends in every request.

### 2. Custom OTP, not Supabase phone auth
**Decision:** Generate and verify OTPs manually using an `otps` table, send via Africa's Talking.
**Why:** Supabase's built-in phone auth requires Twilio, which is not available in Uganda on free tier. Africa's Talking already covers Uganda and was already in the stack.

### 3. Gemini for all AI responses, no fine-tuning
**Decision:** Use Gemini Flash with detailed prompts rather than a fine-tuned model.
**Why:** Fine-tuning requires labelled data we don't have. Gemini Flash has strong knowledge of African cities, prices, and event types out of the box. Prompts are kept short to reduce latency and token costs.

### 4. Fallback-first AI routes
**Decision:** Every Gemini call is wrapped in try/catch with a hardcoded or computed fallback.
**Why:** Free tier Gemini hits 429 (rate limit) and 503 (overload) frequently. The app must never crash or show an error to the user — the fallback keeps the UI functional even when AI is unavailable.

### 5. USSD answers delivered via SMS
**Decision:** When a user asks Plana AI a question via USSD, end the session immediately and deliver the answer as an SMS.
**Why:** USSD sessions time out in 20–30 seconds. Gemini takes 2–5 seconds on a good day and up to 20+ seconds when rate-limited. Ending the session immediately and calling Gemini in the background via `setImmediate` avoids timeouts entirely.

### 6. Providers require admin approval
**Decision:** `providers.verified = false` by default. Providers appear in listings only after manual approval.
**Why:** We cannot verify provider legitimacy automatically. Unverified providers showing up in recommendations would damage trust. Admin approves via the Supabase dashboard.

### 7. Phone as the user identifier (not UUID)
**Decision:** Plans and providers are linked to `phone` rather than `user_id`.
**Why:** USSD sessions send `phoneNumber` directly — there is no auth token in a USSD request. Using phone as the key means USSD can look up a user's plans without any session management.

### 8. UGX as default currency
**Decision:** All default currency values are UGX, all USSD cost estimates use Uganda Shilling amounts.
**Why:** The app is built for Uganda. Users should not need to specify currency for the common case.

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio API key for Gemini Flash. Get from aistudio.google.com/apikey. Must be from Default Gemini Project for free tier to work. Keys starting with `AQ.` are OAuth-style tokens issued by AI Studio — they work the same as `AIzaSy` keys. |
| `SUPABASE_URL` | Supabase project URL. Found in Project Settings → API. |
| `SUPABASE_ANON_KEY` | Public anon key. Safe to use client-side. Used for read operations. |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret service role key. Server-side only. Bypasses Row Level Security. Used for auth, OTP, and admin writes. Never expose to the client. |
| `AT_USERNAME` | Africa's Talking username. Use `sandbox` for testing, your real username for production. |
| `AT_API_KEY` | Africa's Talking API key. Sandbox and production keys are different. Generate sandbox key from account.africastalking.com/sandbox → Settings. New keys take up to 5 minutes to activate. |
| `NEXT_PUBLIC_UNSPLASH_KEY` | Unsplash API key for event images on the frontend. |

---

## API Routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/send-otp` | POST | None | Generate OTP and send via AT SMS |
| `/api/auth/verify-otp` | POST | None | Verify OTP, create account if new user |
| `/api/plans` | GET | Phone param | Get all plans for a user |
| `/api/plans` | POST | Phone in body | Create a new plan |
| `/api/plans/[id]` | GET | None | Get single plan |
| `/api/plans/[id]` | PATCH | None | Update savings or plan details |
| `/api/plans/[id]` | DELETE | None | Delete a plan |
| `/api/providers` | GET | None | List verified providers (filter by category/location) |
| `/api/providers` | POST | None | Register as a provider (pending approval) |
| `/api/ai-breakdown` | POST | None | AI budget breakdown by event type and location |
| `/api/ai-providers` | POST | None | AI-suggested local providers |
| `/api/ai-savings` | POST | None | AI savings advice with personalised numbers |
| `/api/ai-savings-questions` | POST | None | AI-generated questions to personalise savings advice |
| `/api/ai-ussd` | POST | None | Short AI answer for USSD (under 150 chars) |
| `/api/ussd` | POST | None | Africa's Talking USSD webhook (form-encoded) |
| `/api/request-quote` | POST | None | SMS a provider with user's quote request |
| `/api/budget-alert` | POST | None | SMS a user when a budget category is overspent |
| `/api/price-alert` | POST | None | SMS a user about a price spike (predicted or confirmed) |

---

## Database Schema

```
otps          — phone, code, expires_at, used
users         — id, phone, name
plans         — id, phone, type, location, budget, currency, guest_count, event_date, start_date, total_saved
providers     — id, phone, name, category, location, price_min, price_max, currency, description, website, verified
```

---

## Failure Modes

### Gemini 429 — Rate limit exceeded
**Cause:** Free tier limits. `gemini-2.0-flash-lite` allows 1500 requests/day and 30/minute. Quota resets at midnight Pacific Time (10:00 AM EAT).
**What happens:** Try/catch returns fallback data. AI routes never return 500 — they return hardcoded estimates instead.
**Fix for production:** Add billing to the Google Cloud project or use a paid Gemini key. $5–10/month covers a small app.

### Gemini 503 — Service unavailable
**Cause:** Google server overload on free tier. More common during peak hours (US daytime).
**What happens:** `generateWithRetry()` in `lib/ai.ts` waits 12 seconds and retries once before throwing.
**Fix:** Retry is already in place. For USSD specifically, the session ends immediately so the user never sees this.

### AT SMS 401 — Unauthorized
**Cause 1:** Wrong API key (using production key against sandbox or vice versa).
**Cause 2:** Newly generated sandbox key not yet active — takes up to 5 minutes.
**Cause 3:** Too many requests — AT sandbox rate-limits aggressively.
**What happens:** Route returns `{ success: false }` with status 500.
**Fix:** Wait 5–10 minutes and retry. For production, use the live key from account.africastalking.com.

### AT USSD — "Network experiencing technical problems"
**Cause:** The callback URL saved in AT sandbox is wrong or unreachable.
**What happens:** AT simulator shows a generic network error.
**Fix:** Confirm ngrok is running and the callback URL in AT sandbox Settings matches exactly `https://YOUR-NGROK-URL.ngrok-free.app/api/ussd`. ngrok URL changes every restart — update AT after restarting ngrok.

### USSD session timeout
**Cause:** Gemini takes longer than the 20–30 second USSD session window.
**What happens:** Was previously showing "network error". Now fixed — the session ends immediately with a message and the AI answer is delivered via SMS in the background using `setImmediate`.

### Supabase RLS blocking writes
**Cause:** Using the anon key for server-side writes that touch protected tables.
**What happens:** Insert or update silently returns no rows, or returns a permissions error.
**Fix:** All server-side writes use `supabaseAdmin` (service role key) which bypasses RLS entirely.

### ngrok interstitial blocking AT requests
**Cause:** ngrok shows a browser warning page for new visitors instead of passing the request through.
**What happens:** AT receives HTML instead of `CON`/`END` text and shows a network error.
**Fix:** The USSD route response includes `ngrok-skip-browser-warning: true` header which bypasses the interstitial for API clients.
