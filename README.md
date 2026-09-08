# Samarthan — AI Cyber Crime Triage

> Cyber fraud empties an account in minutes. The official complaint takes days.
> Samarthan closes that gap: you say what happened — in Hindi or English, by voice, text, or
> screenshot, on the web **or over WhatsApp** — and in under a minute you get a filed complaint
> that cites the right law, classifies urgency, and tells you exactly who to call to freeze the money.

Built for **Build What Moves India** — an **Aevy TV × OpenAI** hackathon.

---

## Context — the problem

When someone in India is defrauded online, the money moves through mule accounts within the
first hour (the "golden hour"). The official channel — `cybercrime.gov.in` / the 1930 helpline —
works, but it is slow for a panicking victim:

- the complaint form is in legal English and asks which **section of the IT Act** applies;
- it asks the victim to self-classify the crime before they can proceed;
- it does not tell them, up front, **who to call first** (their bank's nodal officer? the
  platform? a specific agency?) to actually stop the transfer.

So the freeze instructions that matter most in the first hour go unread, and the complaint is
filed after the money is gone.

## Context — the answer

**One free-form input.** Voice note, typed description, or a payment/chat screenshot. No fields
to guess, no category to pick, no wizard.

The AI reads it and returns, in ~60 seconds:

- a **formal complaint draft** (English + Hindi), ready to file or hand to a bank;
- the **applicable law** — IT Act 2000 sections + BNS 2023 sections, with the reason each applies;
- an **urgency level** (`CRITICAL` / `HIGH` / `MEDIUM` / `LOW`);
- **golden-hour freeze steps** — call 1930, quote the UTR, contact the named bank desk;
- **escalation routing** — whether this goes to a **bank**, a **platform** (Instagram/Meta…),
  an **agency** (UIDAI, RBI Sachet, Consumer Helpline), or the **1930 helpline**, with the real
  hotline number for that route.

The same engine runs on a **WhatsApp bot**, because that is where most of India already is.

> ⚠️ **Prototype.** Not an official government portal. All demo data is synthetic. Real
> complaints must be filed at [cybercrime.gov.in](https://cybercrime.gov.in).

---

## What's built

### 1. Web intake → dashboard

| Route | Does |
|---|---|
| `/` | Landing page. Live mic demo in the hero — record, see a waveform react to your voice, see a live transcript, get a preliminary classification. |
| `/intake` | Full intake: voice (Whisper) / text / screenshot (GPT-4o Vision). Feeds `/api/triage`. |
| `/dashboard` | The filed complaint: urgency badge, complaint draft (EN/HI), applicable laws, freeze stepper, **Smart Actions** (routed escalation), evidence vault, status tracker, print-to-PDF. |
| `/complaints` | List of everything filed on this device + everything in the DB. |

**Live captions** — the browser Web Speech API is unreliable (a known Chromium `network` bug),
so the recorder streams 4-second audio chunks to `/api/transcribe-chunk` (Whisper) and shows a
rolling transcript as you speak.

### 2. AI triage pipeline (`/api/triage`)

1. **Multimodal intake** — Whisper for audio, GPT-4o Vision for screenshots, plain text.
2. **Structured extraction** — `gpt-4o-mini`, JSON mode, returns the full `TriageResult`:
   fraud type, fraudster identifiers (Instagram `@handle`, website, phone, UPI ID — into
   separate fields), amount, bank / account / UPI, timeline, EN + HI complaint drafts,
   `freezeSteps[]`, `applicableLaws[]`, `urgencyLevel`, `recommendedChannel` +
   `recommendedChannelTarget`.
3. **Hardening** — every field passes through a normalizer before it is returned. A partial or
   malformed model response can never reach the UI: missing arrays become safe defaults,
   `amount` is coerced to a number, the `incidentId` is generated **server-side** (the model is
   never trusted to mint it), generic junk names collapse to `Anonymous Complainant`.
4. **Timeouts** — a 45s server-side safety timeout inside a 60s route budget; the client waits
   90s and falls back to a locally-built result + redirect rather than showing "system failed".

### 3. Escalation routing

Not every fraud goes to the same place. The triage AI picks a `recommendedChannel` and the
dashboard's **Smart Actions** card renders the matching next step (all simulated for the demo,
styled with a "Simulated" badge; real hotline numbers are real `tel:` links):

| Channel | Example | Real hotline shown |
|---|---|---|
| `bank` | UPI / OTP / card fraud where a bank is named | 1930 + the bank's nodal desk |
| `platform` | Impersonation, fake profile, sextortion on a named platform | 1930, Childline **1098**, Women Helpline **181** |
| `agency` | Aadhaar/PAN misuse → UIDAI **1947**; deposit scam → RBI Sachet; e-commerce → Consumer **1915** | that agency's line |
| `helpline` | Anything else / money lost, no entity named | **1930** |

New tracker status `PLATFORM_REPORTED` sits between `BANK_NOTIFIED` and `FIR_FILED`.

### 4. WhatsApp bot — two surfaces, one engine

Both surfaces POST to `/api/whatsapp` → `processWhatsAppTurn()` in `src/lib/whatsapp-agent.ts`.

- **Live WhatsApp** — `scripts/whatsapp-bot.mjs` (Baileys, WhatsApp Web multi-device). Runs on
  a laptop via `launchd`; **$0 hosting**. It publishes its status + QR + linked phone +
  heartbeat to the Neon `bot_state` table, and Vercel's `/api/whatsapp/live` reads that — so
  the website shows the real connection state without the bot needing to be reachable.
- **Website simulator** — `WhatsAppSimulatorModal.tsx`. Same webhook, `isSimulator: true`. Lets
  a judge try the WhatsApp flow without scanning a QR.

What the bot handles:

- **File a complaint** from a free-form message, a voice note (Whisper), or a screenshot (Vision).
- **Follow-up updates** — any later message ("the UTR is 4482…", "bank is HDFC", a screenshot)
  is read by AI and merged into the active complaint.
- **Additive vs corrective amounts** — *"another ₹15,000 was taken"* **adds** to the total;
  *"the amount was actually ₹80,000"* **replaces** it. An AI flag (`amountIsAdditional`)
  decides which.
- **`NEW`** — a **sticky** mode. Once the user says `NEW`, every following message is forced
  down the new-complaint path (never an update to the old case) until a fresh complaint is
  actually filed. Survives a cold serverless lambda.
- **Status query** — *"what's the status of my complaint"* → a case status card.
- **Language** — Hindi / English / Hinglish, auto-detected; replies match.
- **Never dead-ends** — any internal error returns HTTP 200 with an actionable message
  ("re-send that, or call 1930"), never a 500.

### 5. Data

**Neon PostgreSQL**, serverless HTTP driver (works in the Next.js route and in the plain-Node
bot script).

- `complaints` — one row per incident. `incident_id`, `fraud_type`, `fraudster_identifier`,
  `complainant_name`, `amount`, `urgency_level`, EN/HI `summary` + `complaint_draft`,
  `frauder_contact`, `bank_name`, `account_number`, `upi_id`, `timeline`, `freeze_steps` (jsonb),
  `applicable_laws` (jsonb), `status`, `status_history` (jsonb), `evidence_images` (jsonb),
  `updates` (jsonb), `recommended_channel` + `recommended_channel_target`.
- `bot_state` — a single row the WhatsApp bot writes and `/api/whatsapp/live` reads.
- **Dual write** — the web app writes to `localStorage` (instant) and the DB API (persistent).

Seed data: `scripts/reset-and-seed-complaints.mjs` wipes the table and inserts **3 canonical
demo complaints** (all "Parichay Prabhu", EN+HI):

1. `INC-2026-7001` — fake SBI KYC call. Has **simulated edits** (UTRs added later, bank lien
   confirmed), status `UNDER_INVESTIGATION`.
2. `INC-2026-7002` — Instagram storefront non-delivery. The transaction **UTR is missing** — an
   update and a freeze step spell out retrieving and adding it. Status `SUBMITTED`.
3. `INC-2026-7003` — loan-app extortion. **Fully completed**: 3 UTRs, 3 evidence images,
   `PLATFORM_REPORTED` + `FIR_FILED`, FIR 318/2026.

### 6. Bilingual, throughout

Hindi + English on every screen and in every AI output. Toggle in the navbar. The triage model
always drafts both `complaint_draft` and `complaint_draft_hi`.

---

## Quick start

```bash
npm install
npm run dev            # http://localhost:3000
```

Runs in **mock mode** with no keys — the AI paths return pre-baked responses so the full
UI/UX is testable offline.

**For live AI + persistence**, create `.env.local`:

```bash
OPENAI_API_KEY=sk-...            # gpt-4o-mini (triage), gpt-4o (WhatsApp agent + Vision), whisper-1
DATABASE_URL=postgres://...      # Neon
NEXT_PUBLIC_APP_URL=https://...  # base URL used in WhatsApp tracking links (optional)
```

Then:

```bash
node scripts/migrate.mjs                    # create tables
node scripts/reset-and-seed-complaints.mjs  # load the 3 demo complaints
```

### Running the WhatsApp bot

```bash
npm run whatsapp-bot     # scans a QR on first run; state -> bot_state table
```

For always-on `$0` hosting, run it under `launchd` (macOS) — see
`~/Library/LaunchAgents/com.samarthan.whatsappbot.plist`. It publishes to the DB, so the
deployed site reads its status from Postgres regardless of where the bot runs.

---

## Testing

`WHATSAPP_TEST_PROMPTS.md` — 10 prompts covering both WhatsApp surfaces: one-shot file,
Hinglish, the menu flow, follow-up UTR, additive amount, `NEW` → distinct incident, status
query, vague input, garbage input, extortion. As of the last run: **10/10 on both surfaces on
production.**

```bash
npm run build            # production build
npx tsc --noEmit         # type check
```

---

## Architecture

```
src/
  app/
    api/
      triage/route.ts            multimodal AI triage + full output normalizer
      whatsapp/route.ts          WhatsApp webhook (live bot + simulator)
      whatsapp/live/route.ts     reads bot_state, serves connection status to the site
      complaints/route.ts        CRUD for the complaints table
      followup/route.ts          AI action-point generation for updates
      transcribe-chunk/route.ts  short-audio Whisper endpoint for live captions
    intake/page.tsx              voice / text / screenshot intake
    dashboard/page.tsx           filed complaint + smart actions + evidence + tracker
    complaints/page.tsx          list view
    page.tsx                     landing (hero mic demo)
  components/
    AudioRecorder.tsx            mic + live waveform + chunk-streamed captions
    SmartActions.tsx             routed escalation card (bank / platform / agency / helpline)
    FreezeStepper.tsx  ApplicableLaws.tsx  UrgencyBadge.tsx  FIRTracker.tsx
    EvidenceVault.tsx  ComplaintUpdates.tsx  PrintableComplaint.tsx
    WhatsAppSimulatorModal.tsx   in-browser WhatsApp flow
    WhatsAppQRModal.tsx  WhatsAppChoiceModal.tsx
    landing/                     HeroSection, HowItWorks, ComparisonTable, TrustStrip, ...
  lib/
    whatsapp-agent.ts            the WhatsApp conversation engine (file / update / NEW / status)
  data/
    scenarios.ts                 TriageResult type, COMPLAINT_STATUSES, demo scenarios
  hooks/
    useComplaints.ts             localStorage <-> Neon sync + record normalizer
    useAuth.ts                   DigiLocker-style identity (localStorage)
scripts/
  migrate.mjs                    create complaints + bot_state tables
  reset-and-seed-complaints.mjs  wipe + load the 3 canonical demo complaints
  whatsapp-bot.mjs               Baileys bot; publishes state to bot_state
```

---

## Key decisions

- **`gpt-4o-mini` for web triage, `gpt-4o` for the WhatsApp agent + all Vision.** Mini is fast
  and cheap enough for the 60s web budget; the WhatsApp agent does more multi-turn reasoning
  (update vs. new, additive vs. corrective) and Vision needs the full model.
- **Server mints the `incidentId`.** The model kept echoing the schema's example id; it is now
  generated in the route and regex-guarded.
- **Normalize everything before it reaches React.** A partial AI response is expected, not
  exceptional — the UI must never crash on a missing array or a string where a number belongs.
- **`NEW` is sticky, not per-turn.** A one-turn reset let the next message get re-attached to
  the old case by the DB auto-restore. The flag now persists until a complaint is filed.
- **Bot on a laptop, state in Postgres.** Every free WhatsApp host either wanted a card or shut
  down. Running Baileys locally and syncing state through the DB costs nothing and the deployed
  site still shows a correct live status.
- **Neon over Supabase** — zero cold start, plain SQL over HTTP, same client in the route and
  the Node script.

---

## Disclaimer

- **Synthetic data only.** Every scenario, demo complaint, and mock response is fictitious.
- **Not an official government portal.** A hackathon prototype. File real complaints at
  [cybercrime.gov.in](https://cybercrime.gov.in).
- **Demonstrative.** Built to show AI-powered UX for an urgent citizen service — not to replace
  or impersonate official channels. The escalation / bank / platform actions are simulated.

## Helpline

**National Cyber Crime Helpline:** [1930](tel:1930) · **Portal:** [cybercrime.gov.in](https://cybercrime.gov.in) · **Police:** [112](tel:112)
