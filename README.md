# Samarthan — Golden-Hour Cybercrime Triage

> Turn an urgent cybercrime narrative into a clear, actionable incident packet—by text, voice, or screenshot—so a citizen can reach the right official channel faster.

**Samarthan** is an AI-assisted cybercrime triage prototype for India. It helps a victim describe what happened in their own words, extracts time-sensitive evidence such as UTRs and UPI IDs, prepares a formal complaint draft, and guides the next immediate action.

**3rd Place Winner — Build What Moves India Hackathon**
OpenAI × Varun Mayya

> [!IMPORTANT]
> Samarthan is a hackathon prototype, not a government portal or a legal service. It does **not** submit complaints to the National Cyber Crime Reporting Portal (NCRP), banks, police, or platforms. Users must verify all information and file real complaints through [cybercrime.gov.in](https://cybercrime.gov.in) or call **1930** for urgent financial cyber fraud.

## Why Samarthan exists

In a cyber-fraud emergency, the most useful information is often scattered across voice notes, screenshots, payment confirmations, and panic-driven messages. A citizen may not know the fraud category, the relevant legal provisions, or which institution to contact first.

Samarthan focuses on that first, high-pressure moment:

- accept a free-form explanation instead of a long form;
- identify the money trail and missing evidence;
- create a structured complaint draft;
- prioritize urgent actions such as calling **1930** and notifying the victim's bank; and
- route the user to the appropriate official helpline or portal.

## What the product does

### Multimodal incident intake

The web experience accepts:

- typed incident descriptions;
- voice recordings with live, rolling captions; and
- payment, chat, or social-media screenshots.

The interface supports **15 selectable languages**: English plus Hindi, Bengali, Marathi, Telugu, Tamil, Gujarati, Urdu, Kannada, Odia, Malayalam, Punjabi, Assamese, Nepali, and Sindhi. Voice dictation supports 13 Indian languages; Odia remains available for typed reports and report help. Urdu and Sindhi layouts switch to right-to-left presentation automatically.

### AI-assisted triage

For a submitted incident, Samarthan produces a structured `TriageResult` containing:

- fraud category and urgency level;
- complainant, alleged fraudster, bank, account, UPI, IFSC, UTR, amount, and timeline details when available;
- an English and Hindi complaint draft, with selected regional-language support where available;
- applicable IT Act and BNS references with contextual explanations;
- immediate freeze and evidence-preservation steps; and
- a recommended escalation path: bank, platform, agency, or the cybercrime helpline.

The application treats model output as incomplete by default. It normalizes fields before rendering them, fills safe defaults for missing values, generates incident IDs server-side, and falls back to rule-based local triage if a live request fails.

### Complaint workspace

After triage, the dashboard provides:

- urgency and golden-hour guidance;
- editable complaint drafts and a print-friendly version;
- an evidence vault for screenshots;
- follow-up updates that can extract newly supplied UTRs, bank details, or corrected amounts;
- a simulated case-status timeline for demo purposes; and
- Smart Actions that point the user to relevant real helplines and official portals.

The product intentionally labels simulated bank, platform, agency, and status actions. The phone links and portal links are real; Samarthan does not transmit the complaint to those institutions.

### WhatsApp experience

Samarthan’s supported WhatsApp experience is the **in-app simulator**. It supports text, screenshots, voice notes, follow-up updates, complaint status questions, and starting a new case.

The WhatsApp agent can distinguish an additive loss (for example, “another ₹15,000 was taken”) from a correction (“the amount was actually ₹80,000”). Its `NEW` command is deliberately sticky so messages cannot accidentally update an earlier case while a new complaint is being collected.

Voice notes in the simulator are translated to English before triage. The web interface is the primary multilingual experience.

## How it works

```text
Citizen describes the incident
        ↓
Text, audio, and/or screenshot analysis
        ↓
Structured extraction and urgency assessment
        ↓
Complaint draft + evidence checklist + escalation guidance
        ↓
Citizen calls 1930 / contacts the bank / files on the official portal
```

### AI pipeline

- **Audio:** Whisper transcription powers final voice analysis; short chunks provide best-effort live captions.
- **Screenshots:** GPT-4o Vision extracts relevant cybercrime evidence from payment and chat screenshots.
- **Web triage:** GPT-4o-mini returns a structured JSON response for the web intake flow.
- **WhatsApp conversation:** GPT-4o handles the more stateful, multi-turn update and complaint-generation flow.
- **Speech normalization:** a language-aware normalization pass helps recover clean Indic-script transcripts when speech recognition returns mixed or mismatched scripts.

The hosted demo applies a daily, per-IP triage limit to protect the shared API budget. Local development is unlimited by default, and a user can provide their own API key for live requests.

## Escalation guidance

Samarthan recommends an immediate route based on the reported incident. These are guidance links and numbers, not automated integrations.

| Incident pattern | Suggested next step |
| --- | --- |
| UPI, OTP, card, or bank-transfer fraud | Call **1930** immediately and notify the victim's bank |
| Social-media harassment, impersonation, or sextortion | Preserve evidence, report the account, and use NCRP / relevant support helplines |
| Aadhaar or PAN misuse | Use UIDAI or Income Tax guidance alongside an NCRP report |
| Unregulated investment or deposit scheme | Report through RBI Sachet and call 1930 where money is at risk |
| Marketplace or non-delivery scam | Preserve transaction details and use Consumer Helpline / NCRP guidance |

## Architecture

```text
Next.js 16 + React 19 + Tailwind CSS
│
├── Web intake and dashboard
│   ├── TriageContext: in-progress incident state
│   ├── useComplaints: local-first complaint persistence
│   └── Components: evidence, updates, printable draft, routing, status demo
│
├── API routes
│   ├── /api/triage             multimodal web triage
│   ├── /api/transcribe-chunk   live-caption transcription
│   ├── /api/followup           follow-up extraction and draft updates
│   ├── /api/whatsapp           in-app WhatsApp simulator
│   └── /api/whatsapp/live      safe demo-only status
│
├── OpenAI
│   ├── Whisper
│   ├── GPT-4o-mini
│   └── GPT-4o / Vision
```

### Data model and persistence

The application is local-first:

- Every web complaint is saved to browser `localStorage` immediately.
- The shared deployment does not save reports, evidence, phone numbers, or WhatsApp session data to a database.
- Records remain on the device that created them. Clearing browser data removes them.

Do not use the prototype to store real personal, financial, or identity documents without adding production-grade authentication, access controls, encryption, retention controls, and consent handling.

## Local development

### Prerequisites

- Node.js 20+ (Node 22 is used by the companion-worker deployment setup)
- npm

### Run with no keys

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without an OpenAI key, Samarthan uses its local rule-based fallback so that the complete user interface and complaint flow remain demoable.

### Enable live AI

Copy the environment template:

```bash
cp .env.example .env.local
```

Then provide the values you need:

```bash
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Validation

```bash
npx tsc --noEmit
npm run build
```

Useful manual test scenarios are documented in:

- [TEST_PROMPTS.md](TEST_PROMPTS.md) for the web triage flow;
- [WHATSAPP_TEST_PROMPTS.md](WHATSAPP_TEST_PROMPTS.md) for the simulator and conversation flow; and
- [FINAL_TEST_PLAN.md](FINAL_TEST_PLAN.md) for broader demo verification.

## Repository map

| Path | Responsibility |
| --- | --- |
| `src/app` | Pages and API routes |
| `src/components` | Intake, dashboard, WhatsApp, and landing-page UI |
| `src/context/TriageContext.tsx` | In-progress triage state and selected language |
| `src/hooks/useComplaints.ts` | Browser-only complaint persistence and record normalization |
| `src/lib/whatsapp-agent.ts` | Multi-turn WhatsApp complaint engine |
| `src/lib/i18n` | Supported languages, translations, and multilingual extraction helpers |
| `src/data` | Scenario data, types, legal-section catalog, and escalation copy |
| `scripts` | Legacy local-only database utilities; never use these with real reports |

## Scope and safety

- All included scenarios and seeded complaints are synthetic.
- Samarthan drafts information for a citizen to review; it does not provide legal advice.
- Samarthan does not claim to file FIRs, submit NCRP reports, freeze bank accounts, or contact third parties on the user's behalf.
- For a real financial cyber-fraud emergency in India, call **1930** immediately and file through [cybercrime.gov.in](https://cybercrime.gov.in).
