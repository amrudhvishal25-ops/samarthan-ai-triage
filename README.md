# Samarthan — AI-Powered Cyber Crime Fraud Triage

> Speed beats bureaucracy in cyber fraud. Samarthan condenses the golden hour into a single intake flow: voice, text, or screenshot → AI categorization, urgency assessment, freeze instructions, and formal complaint draft—all in one breath.

Built for **Build What Moves India (OpenAI x Varun Mayya)** hackathon. Live deadline: Aug 28, 2026 8:00 PM IST.

---

## 🎯 Problem & Solution

**The problem:** Victims of cyber fraud in India lose critical time filling out complex portal forms on cybercrime.gov.in. By the time they file, funds are already transferred to mule accounts. Golden-hour freeze instructions go unread.

**Samarthan's answer:** One free-form input (voice, text, or screenshot). AI reads your panic. No fields to guess. No categories to select. No multi-step wizard. Just talk—we handle the rest in 60 seconds.

Output: Actionable freeze instructions (bank account numbers, SIM blocking steps), formal complaint draft in your language, urgency classification, and applicable cyber laws—ready to file or share with your bank.

---

## 🚀 Quick Start

```bash
# Install and run
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Environment setup:**
```bash
# Copy template (includes mock API keys for local testing)
cp .env.local.example .env.local
# For live OpenAI + Neon database:
# - Add OPENAI_API_KEY (GPT-4o vision + Whisper)
# - Add DATABASE_URL (Neon PostgreSQL)
```

---

## 🔑 What's Actually Built

### AI Pipeline (`/api/triage`)
1. **Multimodal intake** → Whisper (audio) + GPT-4o Vision (screenshots) + text
2. **Structured extraction** → GPT-4o JSON response validates and normalizes:
   - **Frauder identification** — Extracts Instagram handles (`@username`), websites (`fraud-site.com`), phone numbers, and UPI IDs into distinct fields
   - **Urgency level** — `CRITICAL` | `HIGH` | `MEDIUM` | `LOW` with fallback to `MEDIUM` if AI response invalid
   - **Applicable laws** — Sections of IT Act 2000 + BNS 2023 (e.g., Section 66D, 318(4))
   - **Freeze steps** — Concrete action sequence: call 1930 → contact bank → file on cybercrime.gov.in
3. **Validation + normalization** — Rejects malformed JSON; prevents `UrgencyBadge` crashes from undefined urgency levels

### Dashboard (`/dashboard`)
- **Left sidebar**: Complaint Details (reordered to top) → Evidence Vault → Complaint Updates
- **Evidence management** → Upload screenshots/docs → stored in Neon (`evidence_images` JSONB)
- **Status pipeline** → `SUBMITTED` → `BANK_NOTIFIED` → `FIR_FILED` → `UNDER_INVESTIGATION` → `RESOLVED`
- **Action updates** → Add follow-up notes with AI-generated action points for next steps
- **Print to PDF** → One-click formal complaint receipt with acknowledgement number

### Loading Screen
- **"Please wait" breathing UI** — Concentric circles (outer ring 1.3x scale, middle 1.12x, core 1.08x on inhale)
- **Professional tone** — "Please wait" + "AI is analyzing your report" instead of casual reassurance
- **Proper spacing** — Large gap between headline and breathing orb to prevent text overlap

### Database (Neon PostgreSQL)
- `complaints` table (incident_id, fraud_type, victim_name, amount, urgency_level, complaint_draft, freeze_steps, status, evidence_images, updates)
- Dual storage: localStorage (instant) + Neon API (persistent)
- DELETE `/api/complaints?force=true` endpoint for table reset

### Bilingual
- Hindi + English on every screen
- Toggleable language switch in navbar
- AI generates both complaint drafts automatically

---

## 📁 Architecture

```
/src
  /app
    /api/
      triage/route.ts         ← Multimodal AI processing (Whisper + GPT-4o)
      complaints/route.ts     ← CRUD for Neon DB (GET/POST/PATCH/DELETE)
      followup/route.ts       ← AI-powered action point generation
    /intake/page.tsx          ← Voice/text/screenshot intake
    /dashboard/page.tsx       ← Status + evidence + updates
    /complaints/page.tsx      ← Complaints list
    page.tsx                  ← Landing + scenario selector
  /components
    LoadingTriage.tsx         ← Breathing animation + processing checklist
    BreathingIcon.tsx         ← Concentric circle breathing animation
    UrgencyBadge.tsx          ← Color-coded urgency (CRITICAL red → LOW gray)
    FreezeStepper.tsx         ← Numbered action steps
    FIRTracker.tsx            ← Status timeline
    PrintableComplaint.tsx    ← PDF export template
  /context
    TriageContext.tsx         ← Global state (TriageResult, language toggle)
  /data
    scenarios.ts              ← 3 sandbox scenarios (UPI scam, OTP fraud, investment scam)
  /hooks
    useComplaints.ts          ← localStorage → Neon sync
    useAuth.ts                ← User identity (name from localStorage)
```

---

## 🌐 Local Development vs. Production

**Local (mock mode):**
- No API keys needed
- Scenarios run with pre-baked GPT-4o responses
- Full UI/UX flow testable
- All features work except live Whisper transcription

**Production (live):**
- `OPENAI_API_KEY` → GPT-4o vision + Whisper
- `DATABASE_URL` (Neon) → Persistent complaint storage
- Real audio transcription + AI inference
- Complaints sync to DB on save, readable by `/api/complaints`

---

## 🎯 User Flow (60-Second Golden Hour)

1. **Landing** → Select fraud type (or let AI auto-detect)
2. **Intake** → Record voice message / paste description / attach screenshot
3. **Processing** (6s breathing screen) → AI reads, categorizes, extracts
4. **Dashboard** → View urgency badge, freeze steps, complaint draft
5. **Action** → Call 1930 / contact bank / download PDF complaint / add evidence

---

## 📱 Features

- **Bilingual** — Hindi + English toggle everywhere
- **Multimodal** — Voice (Whisper) + Screenshot (GPT-4o Vision) + Text
- **Mock scenarios** — 3 pre-filled fraud templates for demo/testing
- **Evidence vault** — Upload + manage screenshots/PDFs per complaint
- **Status tracking** → From SUBMITTED to RESOLVED with email-style timeline
- **Action points** — AI generates next-steps for each update
- **Print/PDF** → One-click formal complaint download
- **Responsive** — Mobile-first design; PWA-ready
- **1930 helpline** — One-tap tel: link on every screen
- **No auth required** — localStorage-based user state

---

## 🔧 Key Design Decisions

### Why GPT-4o (not mini)?
Mini struggles with vision + complex JSON extraction (Instagram handles, websites as frauder IDs). Full 4o's reasoning handles ambiguous edge cases.

### Why breathing animation?
Visual metaphor: "Take a breath—we're handling this." Reduces victim panic during processing. Concentric circles (not SVG morphing) scale cleanly from center without asymmetric skew.

### Why Neon over Supabase?
Neon's serverless PostgreSQL has zero cold start, matches Vercel's edge compute model. Direct SQL queries via `@neondatabase/serverless` client.

### Why no multi-suspect / multi-transaction schema?
Hackathon constraints + UX principle: lean intake flow beats comprehensive. Single frauder/single bank account per complaint. Simplicity wins.

---

## ⚠️ Compliance & Disclaimer

- **Synthetic data only.** All scenarios, mock responses, and sample complaints are fictitious. No real PII collected.
- **Not an official government portal.** Samarthan is a hackathon prototype. Final complaints must be filed on the real [cybercrime.gov.in](https://cybercrime.gov.in).
- **Educational + demonstrative.** Built to showcase AI-powered UX for urgent citizen services, not to replace or impersonate official channels.

---

## 🛠️ Development Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run typecheck    # TypeScript validation
npm run lint         # ESLint
npm run format       # Prettier (if configured)
```

---

## 📞 Helpline

**National Cyber Crime Helpline:** [1930](tel:1930)  
**Official Portal:** [cybercrime.gov.in](https://cybercrime.gov.in)  
**Emergency (Police):** [100](tel:100)
