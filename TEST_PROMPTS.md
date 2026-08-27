# Samarthan Test Prompts — Fraud Triage Validation

Test these prompts on **https://samarthan-ai.vercel.app** to validate AI extraction, urgency classification, and complaint drafting across all fraud types.

---

## Test 1: UPI/Mobile Payment Scam

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

## Test 2: OTP/Account Takeover Fraud

**Fraud Type:** Identity Theft / Account Takeover  
**Expected Urgency:** CRITICAL  
**Key Fields to Verify:**
- Frauder Name: Phone number or website domain
- Contact: Phone number (+91 98765XXXXX)
- Amount: Variable (account access compromised)
- Freeze Steps: Change passwords → Enable 2FA → Report to bank → File FIR
- Applicable Laws: IT Act 66C (identity theft using digital signature/credentials)

### Prompt:
```
Someone called me this morning pretending to be from "HDFC Bank Fraud Department". They said there was suspicious activity on my account and asked me to verify my OTP. I gave them the OTP without thinking. Now I can see my account has been accessed from a different IP, and ₹8,500 has been transferred to an unknown account (beneficiary name: "TechSolutions Pvt Ltd"). The fraudster also sent me a fake bank alert via email from a domain that looked like hdfc-security.net. I'm really scared. My email is john.doe@gmail.com and my phone is +91 9876543210.
```

---

## Test 3: Investment/Scheme Scam

**Fraud Type:** Investment Fraud  
**Expected Urgency:** HIGH  
**Key Fields to Verify:**
- Frauder Name: Website domain or social media handle
- Contact: WhatsApp number or Telegram username
- Amount: ₹50,000 (promised returns are fake)
- Freeze Steps: Do not transfer more money → Report to SEBI → File complaint
- Applicable Laws: IT Act 66D + BNS 318(4) (cheating & inducing delivery of property)

### Prompt:
```
I was scrolling Instagram and saw an ad for "Golden Returns Forex Trading" with testimonials of people making ₹10 lakh in 2 months. The website was goldenreturns-trading.com. I messaged their WhatsApp (+91 7777888899) and spoke to a "Priya Sharma" who convinced me to invest ₹50,000 in their trading platform. They asked me to transfer via UPI to an account in the name of "Sharma Financial Services". After 2 weeks, they promised me ₹1,50,000 returns but now they're ghosting me. I tried logging into the platform but the website is down. I think it was a scam. What should I do?
```

---

## Test 4: Government Impersonation Scam (Bonus)

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

| Test | Pass Criteria |
|------|---------------|
| UPI Scam | Urgency CRITICAL, frauder@ybl extracted, bank freeze step included |
| OTP Fraud | Urgency CRITICAL, phone number + email domain noted, 2FA step included |
| Investment Scam | Urgency HIGH, website domain extracted, SEBI report step included |
| Gov Impersonation | Urgency CRITICAL, inspector name noted, immediate 1930 call step |

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
