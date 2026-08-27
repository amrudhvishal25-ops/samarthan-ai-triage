# Samarthan Test Prompts — Fraud Triage Validation

Test these prompts on **https://samarthan-ai.vercel.app** to validate AI extraction, urgency classification, and complaint drafting across all 6 cyber crime categories.

---

## Test 1: Financial Fraud (UPI/Mobile Payment Scam)

**Fraud Type:** Financial Fraud (UPI/Payment)  
**Expected Urgency:** CRITICAL  
**Key Fields to Verify:**
- Frauder Name: Instagram handle or UPI ID
- Amount: ₹15,000
- Freeze Steps: Call 1930 → Contact bank → File on cybercrime.gov.in
- Applicable Laws: IT Act 66D (cheating by personation)

### Prompt:
```
I was selling my old laptop on OLX yesterday. A buyer contacted me via WhatsApp and said he wanted to buy it for ₹15,000. He sent me a QR code on WhatsApp saying "scan this to receive payment". I stupidly scanned it thinking I would get money, but instead ₹15,000 got DEDUCTED from my HDFC bank account via UPI. The UPI ID was random@ybl. I immediately called my bank but they said it will take 24 hours to freeze the account. I'm panicking — what do I do? My account number ends in 4521.
```

---

## Test 2: Women/Children Related Crime (Cyberbullying & Harassment)

**Fraud Type:** Women/Children Related Crime  
**Expected Urgency:** CRITICAL  
**Key Fields to Verify:**
- Frauder Name: Social media handle (@username)
- Contact: Social media platform or phone number
- Amount: N/A (non-financial, reputational harm)
- Freeze Steps: Block & report profile → Contact platform (Meta/Instagram) → File FIR → Document evidence
- Applicable Laws: IT Act 67 (publishing obscene content), IPC 509 (outraging modesty)

### Prompt:
```
My 16-year-old daughter received explicit messages from an unknown account (@creep_hunter_93 on Instagram). The person threatened to share her photos online unless she sent more. She's completely traumatized. We tried reporting the account but Instagram took hours to respond. The person is now posting her photo on their stories with horrible captions. Please help us file a formal complaint. Her name is Priya and she attends Delhi Public School.
```

---

## Test 3: Extortion & Blackmail (Sextortion)

**Fraud Type:** Extortion & Blackmail  
**Expected Urgency:** CRITICAL  
**Key Fields to Verify:**
- Frauder Name: Phone number or app username
- Contact: WhatsApp, Telegram, or email
- Amount: Demanded ransom (varies, ₹50k-5L common)
- Freeze Steps: DO NOT PAY → Block & report → File FIR immediately → Preserve screenshots
- Applicable Laws: IPC 383 (extortion) + IT Act 66E (privacy violation)

### Prompt:
```
I received a WhatsApp message from +91 9999999999 saying "We have your private videos from your webcam. Send ₹1 lakh in Bitcoin in 24 hours or we'll send them to your family and workplace." I'm freaking out. They even know my name (Rajesh) and mentioned my company (TCS). They sent a screenshot of my LinkedIn profile. I don't think they actually have videos but I'm terrified. What do I do?
```

---

## Test 4: Identity Theft (PAN/Aadhaar Misuse)

**Fraud Type:** Identity Theft  
**Expected Urgency:** HIGH  
**Key Fields to Verify:**
- Frauder Name: Name on fraudulent documents or application
- Contact: Phone number or email used for application
- Amount: Potential credit exposure
- Freeze Steps: Check credit score → Dispute with CIBIL → File police complaint → Monitor bank accounts
- Applicable Laws: IT Act 66C (identity theft), IT Act 66D (cheating by personation)

### Prompt:
```
I received a letter from Bajaj Finance saying I applied for a ₹5 lakh personal loan but got rejected. I never applied for any loan! Someone has used my Aadhaar number (my PAN is ABCDE1234F) to open a new account with a bank I don't use. I'm scared they might have already taken out loans in my name. My Aadhaar was maybe leaked in one of those data breaches. How do I protect myself?
```

---

## Test 5: E-Commerce Scams (Fake Websites & OLX Fraud)

**Fraud Type:** E-Commerce Scams  
**Expected Urgency:** HIGH  
**Key Fields to Verify:**
- Frauder Name: Website domain or seller profile name
- Contact: Email or WhatsApp from fake seller
- Amount: Amount transferred before item never arrives
- Freeze Steps: Contact seller → Report to OLX/marketplace → Dispute transaction with bank → File complaint
- Applicable Laws: IT Act 66D (cheating via computer) + BNS 318(4) (inducing delivery of property)

### Prompt:
```
I bought an iPhone 15 Pro from a seller on OLX named "tech-deals-mumbai" for ₹70,000. I transferred the full amount via bank transfer to his account (Account: 9876543210, IFSC: SBIN0001234). He sent me tracking screenshots but the courier company says there's no such shipment. Now he's not responding to my messages. The website he asked me to track on looks like a fake courier site. I've lost ₹70,000. The seller's phone number was +91 8765432109.
```

---

## Test 6: Other Cyber Crime (Hacking, Data Theft, Ransom)

**Fraud Type:** Other Cyber Crime  
**Expected Urgency:** CRITICAL  
**Key Fields to Verify:**
- Frauder Name: Email domain or hacker group name
- Contact: Email address used in ransom demand
- Amount: Ransom demand (ransomware cases)
- Freeze Steps: Disconnect device from internet → Backup data → Report to law enforcement → Do NOT pay ransom
- Applicable Laws: IT Act 43 (unauthorized access), IT Act 66 (computer-related offenses)

### Prompt:
```
My laptop got infected with ransomware yesterday. A message appeared saying "Your files are encrypted. Send 2 Bitcoin (₹50 lakh) to wallet address 1A2B3C... to decrypt them." They want payment within 48 hours or files are deleted forever. I don't have backup for my business documents (5 years of invoices and contracts). The ransom email is from darkweb.ransom@protonmail.com. Is there any way to recover my files without paying?
```

---

## Test 7: Government Impersonation (Bonus - High-Stakes Fraud)

**Fraud Type:** Financial Fraud (High-stakes impersonation)  
**Expected Urgency:** CRITICAL  
**Key Fields to Verify:**
- Frauder Name: Inspector's name or police department impersonation
- Contact: Phone number (fake police number)
- Amount: Large transfer amounts (₹2+ lakh)
- Freeze Steps: Immediate — Call 1930, contact bank, file FIR
- Applicable Laws: IT Act 66D (personation) + BNS (impersonation of public servant)

### Prompt:
```
I received a call from someone claiming to be "Inspector Verma from Mumbai Cyber Crime Branch". He said my Aadhaar number was used in a money laundering case and I would be arrested unless I cooperated. He kept me on a video call for 3 hours and threatened me. Under pressure, I transferred ₹2,00,000 from my ICICI account via IMPS to an account he gave me (Account: 502100XXXXXX45, Name: Suresh Traders). Later that day I got a WhatsApp from the same number asking for ₹3,50,000 more for "investment recovery". Only then did I realize it was a scam. My bank account is empty now. Please help me file a complaint immediately.
```

---

## How to Test

1. Go to **https://samarthan-ai.vercel.app**
2. Click **"Say anything..."** or select a **Sandbox scenario** if available
3. **Copy one prompt above** into the textarea (or record voice if audio works)
4. Click **"Analyze with AI"** or **"Run AI Triage"**
5. **Wait for 6-second breathing screen** (AI processing)
6. **Verify dashboard output:**
   - ✅ Urgency badge color matches expected level (CRITICAL=red, HIGH=orange, etc.)
   - ✅ Frauder name extracted correctly (handle, phone, website, or UPI ID)
   - ✅ Freeze steps appear in correct order
   - ✅ Applicable laws listed from IT Act sections
   - ✅ Complaint draft is formal and complete
   - ✅ Both English + Hindi versions generated

---

## Success Criteria

| Test | Category | Pass Criteria |
|------|----------|---------------|
| 1 | Financial Fraud | Urgency CRITICAL, frauder@ybl extracted, bank freeze step |
| 2 | Women/Children Crime | Urgency CRITICAL, Instagram handle noted, platform report step |
| 3 | Extortion & Blackmail | Urgency CRITICAL, phone/Telegram contact noted, immediate police step |
| 4 | Identity Theft | Urgency HIGH, Aadhaar/PAN mentioned, CIBIL dispute step |
| 5 | E-Commerce Scams | Urgency HIGH, website/marketplace domain noted, transaction dispute step |
| 6 | Other Cyber Crime | Urgency CRITICAL, email/wallet noted, ransom refusal guidance |
| Bonus | Gov Impersonation | Urgency CRITICAL, inspector name noted, immediate 1930 call step |

---

## Optional: Test Rate Limiting

Hit `/api/triage` route 11+ times rapidly to verify rate limiter (should 429 after 10 requests/min).

```bash
for i in {1..12}; do curl -X POST https://samarthan-ai.vercel.app/api/triage \
  -F "text=test" 2>&1 | grep -o "error\|ok"; done
```

Expected: First 10 = success, 11th+ = 429 error.

---

## Notes

- **Mock Mode:** If no real OpenAI key, sandbox scenarios use pre-baked responses (still valid for UI testing)
- **Live Mode:** With OPENAI_API_KEY + DATABASE_URL set, real Whisper + GPT-4o processing
- **Database:** All complaints saved to Neon PostgreSQL (visible in `/complaints` page)
- **Bilingual:** Toggle Hindi/English in navbar for each test

---

**Deadline:** Aug 28, 2026 8:00 PM IST  
**Demo Ready:** ✅ https://samarthan-ai.vercel.app
