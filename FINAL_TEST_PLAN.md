# Samarthan Final Test Plan — Complete Validation

**Live URL:** https://samarthan-ai.vercel.app  
**Status:** Public, no auth required  
**Deadline:** Aug 28, 2026 8:00 PM IST  

---

## Pre-Test Checklist

- [ ] Open https://samarthan-ai.vercel.app in browser (no password prompt)
- [ ] Landing page loads with 6 fraud category cards
- [ ] "Say anything..." textarea is visible
- [ ] Language toggle (EN/HI) works in navbar
- [ ] Dev server running locally (optional, for logs)

---

## Test Suite: 6 Fraud Categories + Validation Checklist

Each test validates:
1. **AI Extraction** — Frauder name, contact, amount
2. **Urgency Classification** — CRITICAL/HIGH/MEDIUM/LOW color badge
3. **Freeze Steps** — Actionable ordered list
4. **Applicable Laws** — IT Act sections extracted
5. **Complaint Draft** — Formal, bilingual (EN + HI)
6. **Dashboard Navigation** — Evidence Vault, Updates, Status tracking
7. **Rate Limiting** — System doesn't crash on spam

---

## Test 1: Financial Fraud (UPI Scam) — CRITICAL

**Expected Urgency:** 🔴 CRITICAL  
**Key Validation:**
- ✅ Frauder Name: `random@ybl` (UPI ID extracted)
- ✅ Amount: `₹15,000`
- ✅ Freeze Step 1: Call 1930
- ✅ Freeze Step 2: Contact HDFC Bank
- ✅ Applicable Law: IT Act 66D (cheating by personation)

### Prompt:
```
I was selling my old laptop on OLX yesterday. A buyer contacted me via WhatsApp and said he wanted to buy it for ₹15,000. He sent me a QR code on WhatsApp saying "scan this to receive payment". I stupidly scanned it thinking I would get money, but instead ₹15,000 got DEDUCTED from my HDFC bank account via UPI. The UPI ID was random@ybl. I immediately called my bank but they said it will take 24 hours to freeze the account. I'm panicking — what do I do? My account number ends in 4521.
```

**Steps:**
1. Copy prompt above
2. Paste into textarea on https://samarthan-ai.vercel.app
3. Click "Analyze with AI"
4. **Wait 6s** for breathing animation
5. **Verify dashboard:**
   - [ ] Urgency badge = RED (CRITICAL)
   - [ ] Frauder Name field = `random@ybl`
   - [ ] Amount = `₹15,000`
   - [ ] Freeze Steps include bank contact
   - [ ] Complaint draft is formal & complete
6. **Test Print to PDF** — Click print button, save as PDF
7. **Toggle Hindi** — Verify complaint draft in Hindi
8. **Add Evidence** — Upload screenshot (optional)
9. **Add Update** — Write a follow-up note, verify AI generates action points

---

## Test 2: Women/Children Crime (Cyberbullying) — CRITICAL

**Expected Urgency:** 🔴 CRITICAL  
**Key Validation:**
- ✅ Frauder Name: `@creep_hunter_93` (Instagram handle extracted)
- ✅ Amount: N/A (non-financial)
- ✅ Freeze Step 1: Report profile to Instagram
- ✅ Freeze Step 2: File FIR
- ✅ Applicable Law: IT Act 67 (publishing obscene content)

### Prompt:
```
My 16-year-old daughter received explicit messages from an unknown account @creep_hunter_93 on Instagram. The person threatened to share her photos online unless she sent more. She's completely traumatized. We tried reporting the account but Instagram took hours to respond. The person is now posting her photo on their stories with horrible captions. Please help us file a formal complaint. Her name is Priya and she attends Delhi Public School.
```

**Steps:**
1. Go to https://samarthan-ai.vercel.app (new complaint)
2. Paste prompt
3. Click "Analyze with AI"
4. **Verify dashboard:**
   - [ ] Urgency badge = RED (CRITICAL)
   - [ ] Frauder Name = `@creep_hunter_93`
   - [ ] Amount = "0" or "N/A"
   - [ ] Freeze Steps mention Instagram reporting + FIR filing
   - [ ] Complaint emphasizes minor protection
5. **Test Status Pipeline** — Click "Bank Notified" → "FIR Filed" → "Under Investigation"
6. **Verify status history timeline** appears

---

## Test 3: Extortion & Blackmail (Sextortion) — CRITICAL

**Expected Urgency:** 🔴 CRITICAL  
**Key Validation:**
- ✅ Frauder Name: `+91 9999999999` (phone number extracted as primary)
- ✅ Amount: `₹1,00,000` (demanded ransom)
- ✅ Freeze Step: DO NOT PAY (emphasized)
- ✅ Freeze Step: File FIR immediately
- ✅ Applicable Law: IPC 383 (extortion) + IT Act 66E (privacy violation)

### Prompt:
```
I received a WhatsApp message from +91 9999999999 saying "We have your private videos from your webcam. Send ₹1 lakh in Bitcoin in 24 hours or we'll send them to your family and workplace." I'm freaking out. They even know my name (Rajesh) and mentioned my company (TCS). They sent a screenshot of my LinkedIn profile. I don't think they actually have videos but I'm terrified. What do I do?
```

**Steps:**
1. Go to https://samarthan-ai.vercel.app
2. Paste prompt
3. Click "Analyze with AI"
4. **Verify dashboard:**
   - [ ] Urgency badge = RED (CRITICAL)
   - [ ] Frauder Name = `+91 9999999999`
   - [ ] Amount = `₹1,00,000` (ransom demand)
   - [ ] First freeze step explicitly says "DO NOT PAY"
   - [ ] Complaint draft warns against ransom payment
5. **Test Evidence Vault** — Add screenshot of WhatsApp threat
6. **Test Add Update** — Write "Received second threat email"

---

## Test 4: Identity Theft (Aadhaar/PAN Misuse) — HIGH

**Expected Urgency:** 🟠 HIGH  
**Key Validation:**
- ✅ Frauder Name: "Fraudster/Unknown" (may be unclear, credit check recommended)
- ✅ Amount: `₹5,00,000` (loan amount fraudulently applied)
- ✅ Freeze Step 1: Check credit score (CIBIL)
- ✅ Freeze Step 2: Dispute with bank
- ✅ Applicable Law: IT Act 66C (identity theft using digital signature)

### Prompt:
```
I received a letter from Bajaj Finance saying I applied for a ₹5 lakh personal loan but got rejected. I never applied for any loan! Someone has used my Aadhaar number (my PAN is ABCDE1234F) to open a new account with a bank I don't use. I'm scared they might have already taken out loans in my name. My Aadhaar was maybe leaked in one of those data breaches. How do I protect myself?
```

**Steps:**
1. Go to https://samarthan-ai.vercel.app
2. Paste prompt
3. Click "Analyze with AI"
4. **Verify dashboard:**
   - [ ] Urgency badge = ORANGE (HIGH)
   - [ ] PAN/Aadhaar numbers mentioned in complaint
   - [ ] Amount = `₹5,00,000` (fraudulent loan)
   - [ ] Freeze Steps include CIBIL credit check
   - [ ] Applicable Law = IT Act 66C
5. **Verify Complaint Details** — Check Aadhaar reference in formal draft
6. **Toggle Status** — Progress from SUBMITTED → BANK_NOTIFIED

---

## Test 5: E-Commerce Scams (Fake Seller/OLX) — HIGH

**Expected Urgency:** 🟠 HIGH  
**Key Validation:**
- ✅ Frauder Name: `tech-deals-mumbai` (marketplace seller handle) OR bank account `9876543210`
- ✅ Amount: `₹70,000`
- ✅ Freeze Step 1: Contact OLX support
- ✅ Freeze Step 2: Dispute transaction with bank (NEFT/IMPS reversal)
- ✅ Applicable Law: IT Act 66D (cheating via computer) + BNS 318(4)

### Prompt:
```
I bought an iPhone 15 Pro from a seller on OLX named tech-deals-mumbai for ₹70,000. I transferred the full amount via bank transfer to his account (Account: 9876543210, IFSC: SBIN0001234). He sent me tracking screenshots but the courier company says there's no such shipment. Now he's not responding to my messages. The website he asked me to track on looks like a fake courier site. I've lost ₹70,000. The seller's phone number was +91 8765432109.
```

**Steps:**
1. Go to https://samarthan-ai.vercel.app
2. Paste prompt
3. Click "Analyze with AI"
4. **Verify dashboard:**
   - [ ] Urgency badge = ORANGE (HIGH)
   - [ ] Frauder Name = `tech-deals-mumbai` OR bank account extracted
   - [ ] Amount = `₹70,000`
   - [ ] Freeze Steps mention OLX dispute + bank reversal
   - [ ] Complaint mentions fake courier website
5. **Upload Evidence** — Add screenshot of OLX listing or bank receipt
6. **Check Applicable Laws** — Should list BNS 318(4)

---

## Test 6: Ransomware/Hacking (Other Cyber Crime) — CRITICAL

**Expected Urgency:** 🔴 CRITICAL  
**Key Validation:**
- ✅ Frauder Name: `darkweb.ransom@protonmail.com` (email OR wallet address)
- ✅ Amount: `₹50,00,000` (2 Bitcoin approx)
- ✅ Freeze Step 1: Disconnect from internet immediately
- ✅ Freeze Step 2: DO NOT PAY (emphasized)
- ✅ Freeze Step 3: File FIR
- ✅ Applicable Law: IT Act 43 (unauthorized access) + IT Act 66 (computer offense)

### Prompt:
```
My laptop got infected with ransomware yesterday. A message appeared saying "Your files are encrypted. Send 2 Bitcoin (₹50 lakh) to wallet address 1A2B3C... to decrypt them." They want payment within 48 hours or files are deleted forever. I don't have backup for my business documents (5 years of invoices and contracts). The ransom email is from darkweb.ransom@protonmail.com. Is there any way to recover my files without paying?
```

**Steps:**
1. Go to https://samarthan-ai.vercel.app
2. Paste prompt
3. Click "Analyze with AI"
4. **Verify dashboard:**
   - [ ] Urgency badge = RED (CRITICAL)
   - [ ] Frauder Name = `darkweb.ransom@protonmail.com` OR crypto wallet
   - [ ] Amount = `₹50,00,000` (Bitcoin conversion)
   - [ ] First freeze step = "DISCONNECT INTERNET"
   - [ ] Second step = "DO NOT PAY RANSOM"
   - [ ] Complaint draft warns against payment
5. **Test Evidence Upload** — Add ransom screenshot
6. **Add Update** — "Found backup on external drive"

---

## Bonus Test 7: Government Impersonation (Extreme Case) — CRITICAL

**Expected Urgency:** 🔴 CRITICAL  
**Key Validation:**
- ✅ Frauder Name: "Inspector Verma" (impersonator name extracted)
- ✅ Amount: `₹2,00,000` + `₹3,50,000` (staged extortion)
- ✅ Freeze Step 1: Call 1930 IMMEDIATELY
- ✅ Freeze Step 2: File FIR (government impersonation)
- ✅ Applicable Law: IT Act 66D + IPC 170 (impersonation of public officer)

### Prompt:
```
I received a call from someone claiming to be "Inspector Verma from Mumbai Cyber Crime Branch". He said my Aadhaar number was used in a money laundering case and I would be arrested unless I cooperated. He kept me on a video call for 3 hours and threatened me. Under pressure, I transferred ₹2,00,000 from my ICICI account via IMPS to an account he gave me (Account: 502100XXXXXX45, Name: Suresh Traders). Later that day I got a WhatsApp from the same number asking for ₹3,50,000 more for "investment recovery". Only then did I realize it was a scam. My bank account is empty now. Please help me file a complaint immediately.
```

**Steps:**
1. Go to https://samarthan-ai.vercel.app
2. Paste prompt
3. Click "Analyze with AI"
4. **Verify dashboard:**
   - [ ] Urgency badge = RED (CRITICAL)
   - [ ] Frauder Name = "Inspector Verma" or "Impersonator"
   - [ ] Amount = `₹5,50,000` (total extracted)
   - [ ] First freeze step = "CALL 1930 IMMEDIATELY"
   - [ ] Applicable Law mentions IPC 170 (government impersonation)
5. **Verify complaint draft** emphasizes official channel authentication
6. **Test Bilingual** — Switch to Hindi, verify all translations

---

## Cross-Cutting Tests (Run After Each Fraud Type)

### A. Breathing Animation
- [ ] "Please wait" text appears
- [ ] "AI is analyzing your report" subtitle visible
- [ ] Concentric circles animate smoothly (expand/contract)
- [ ] Animation lasts ~6 seconds
- [ ] No text overlap with orb

### B. Urgency Badge Colors
- [ ] CRITICAL = 🔴 Red
- [ ] HIGH = 🟠 Orange
- [ ] MEDIUM = 🟡 Yellow
- [ ] LOW = ⚪ Gray

### C. Dashboard Layout Order
- [ ] **First section:** Complaint Details (top)
- [ ] **Second section:** Evidence Vault (middle)
- [ ] **Third section:** Add an Update (below)
- [ ] **Action buttons:** At bottom (Print PDF, Share, etc.)

### D. Bilingual Verification
- [ ] Switch language toggle in navbar
- [ ] Complaint draft title = Hindi
- [ ] All freeze steps = Hindi
- [ ] Applicable laws = Hindi
- [ ] Status labels = Hindi

### E. Evidence Vault
- [ ] Upload image/PDF works
- [ ] File displays in vault with preview
- [ ] Can delete evidence
- [ ] Evidence persists in database

### F. Add an Update
- [ ] Type update note
- [ ] Click "Add Update"
- [ ] Update appears with timestamp
- [ ] AI generates 3 action points
- [ ] Action points in both EN + HI

### G. Status Pipeline
- [ ] Start: SUBMITTED
- [ ] Click "Bank Notified" → appears in timeline
- [ ] Click "FIR Filed" → appears in timeline
- [ ] Click "Under Investigation" → appears in timeline
- [ ] Timeline shows dates/times for each status change

### H. Print to PDF
- [ ] Click "Print" or "Download PDF"
- [ ] Browser print dialog opens
- [ ] Save as PDF
- [ ] PDF contains:
  - [ ] Acknowledgement number (incident ID)
  - [ ] Complaint text (formal)
  - [ ] Freeze steps
  - [ ] Applicable laws
  - [ ] "SYNTHETIC DEMO DATA" disclaimer (hackathon rule compliance)

### I. Rate Limiting (Optional Advanced Test)
- [ ] Submit same fraud type 11 times rapidly
- [ ] First 10 = success (green badge)
- [ ] 11th onward = 429 error message ("Too many requests")
- [ ] Wait 60 seconds, try again = works

### J. Database Persistence (Optional)
- [ ] Go to `/complaints` page
- [ ] All submitted complaints list
- [ ] Click a complaint → dashboard loads with full data
- [ ] Close browser, reopen → data still there (localStorage sync)

---

## Success Criteria Summary

| Category | Metric | Target |
|----------|--------|--------|
| **AI Extraction** | Frauder name/contact extracted accurately | 6/6 tests pass |
| **Urgency Classification** | Correct badge color + level | 6/6 tests pass |
| **Freeze Steps** | Actionable, ordered, relevant | 6/6 tests pass |
| **Applicable Laws** | IT Act sections correct | 6/6 tests pass |
| **Complaint Draft** | Formal, complete, bilingual | 6/6 tests pass |
| **Dashboard UX** | Correct section order, smooth animations | ✅ Pass |
| **Security** | No auth barrier, rate limiting works | ✅ Pass |
| **Data Persistence** | Complaints saved to Neon DB | ✅ Pass |

---

## Known Limitations (Document in Demo)

1. **Mock Mode:** If OPENAI_API_KEY not set, sandbox scenarios use pre-baked responses
2. **Whisper Audio:** Requires live API key; voice input may not work locally
3. **Real Database:** Neon PostgreSQL connected; test data persists across sessions
4. **Bilingual Latency:** Hindi translations generated real-time by GPT-4o (may add 2-3s)

---

## Submission Checklist

- [ ] All 6 fraud categories tested
- [ ] Breathing animation verified
- [ ] Urgency badge colors correct
- [ ] Dashboard order verified
- [ ] Bilingual output validated
- [ ] Print to PDF works
- [ ] Status pipeline tested
- [ ] Evidence upload working
- [ ] Add Update generates action points
- [ ] Database persistence confirmed
- [ ] Rate limiter verified (429 on 11th request)
- [ ] "SYNTHETIC DEMO DATA" disclaimer present (hackathon rule)
- [ ] No auth barrier (public access confirmed)
- [ ] Live URL working: https://samarthan-ai.vercel.app

---

## Hackathon Compliance Checklist

- ✅ **No real PII collected** — All test prompts use fictional scenarios
- ✅ **No live government system access** — App only generates formal drafts
- ✅ **No claim to official status** — "SYNTHETIC DEMO DATA" disclaimer present
- ✅ **Open to all** — No authentication required for submission demo
- ✅ **Single free-text input** — No multi-step wizard or form fields
- ✅ **AI-powered** — Uses GPT-4o vision + Whisper + structured JSON extraction
- ✅ **Bilingual** — Hindi + English throughout
- ✅ **Mobile-ready** — Responsive design, PWA-capable

---

## Demo Flow (for Judges)

1. Open https://samarthan-ai.vercel.app
2. Select **"Financial Fraud"** category (UPI test above)
3. Paste Test 1 prompt → Click "Analyze with AI"
4. Watch breathing animation (~6s)
5. Show dashboard: urgency badge, freeze steps, complaint draft
6. Toggle Hindi → show bilingual output
7. Click "Print PDF" → open PDF in new tab
8. Go to `/complaints` → show persistent database
9. Return to landing → quick demo of other 5 categories

**Total demo time:** 5-7 minutes

---

**Status:** Ready for Aug 28 hackathon submission  
**Live:** https://samarthan-ai.vercel.app  
**Repo:** https://github.com/paripprabhu/samarthan-ai-triage
