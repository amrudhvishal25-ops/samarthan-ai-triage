# Samarthan — Golden Hour Fraud Triage

> AI-powered, one-click fraud reporting for Indian citizens. From panic to actionable freeze steps in 60 seconds.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local and add your OpenAI API key (optional — mock mode works without it)

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Optional | Enables live Whisper + GPT-4o processing. Without it, the sandbox runs on pre-baked mock responses. |

## 🏗️ Architecture

```
/src
  /app
    /api/triage/route.ts   ← Whisper + GPT-4o API route
    /intake/page.tsx        ← Multimodal input (voice/text/screenshot)
    /dashboard/page.tsx     ← Action dashboard
    page.tsx                ← Landing + scenario selector
  /components               ← Shared UI components
  /context/TriageContext.tsx ← Global state (localStorage-persisted)
  /data/scenarios.ts        ← Synthetic fraud scenarios
```

## 🌐 Deploying to Vercel

```bash
# Push to GitHub
git init && git add . && git commit -m "init: samarthan triage"
git remote add origin <your-github-repo>
git push -u origin main
```

Then in [vercel.com](https://vercel.com):
1. Import the GitHub repository
2. Add environment variable: `OPENAI_API_KEY` = your key
3. Deploy — public URL ready, no sign-up required for reviewers

## 🎯 Reviewer Demo Path

1. Open the deployed URL
2. Select any scenario card (UPI Scam, OTP Fraud, or Investment Scam)
3. Click **"Run AI Triage →"**
4. Watch the 60-second AI loading sequence
5. Review the dashboard: urgency badge → freeze steps → complaint draft → PDF export

## 📱 Features

- **Bilingual** — Hindi + English toggle on every screen
- **Multimodal intake** — Voice (Whisper), Screenshot (GPT-4o Vision), or Text
- **Mock mode** — Zero API key needed for hackathon judging
- **PWA-ready** — Add to Home Screen on mobile
- **Print to PDF** — One-click complaint export
- **Web Share API** — Share report with family
- **1930 Helpline** — One-tap tel: link throughout

## ⚠️ Disclaimer

All scenario data is **synthetic**. This is a prototype built for the OpenAI Hackathon. No real PII is collected or stored.

Helpline: **1930** | Portal: **cybercrime.gov.in**
