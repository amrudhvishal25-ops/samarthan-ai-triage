# Samarthan — 10 WhatsApp Test Prompts

Run each on **both** surfaces:
- **Live WhatsApp** — message the linked bot number (+91 63038 07967)
- **Website simulator** — landing page → "Or check it out on WhatsApp" → simulator modal

Name auto-fills as **Parichay Prabhu** (DigiLocker), so prompts carry no name.

---

## 1. Financial fraud — full narrative, one shot
> I received a call from a man saying he was from HDFC Bank. He said my card was blocked and made me share an OTP. Right after, 78000 rupees was debited from my account by UPI to the id quickpay@okhdfc. This happened today at around 3pm. UTR 448120097331.

**Expect:** complaint filed immediately, Incident ID, IT Act 66C/66D, ₹78,000, golden-hour steps citing the UTR.

---

## 2. Hinglish, voice-note style — investment scam
> Mujhe Telegram pe ek group me add kiya tha jo stock trading ke tips deta tha. Unhone bola guaranteed profit milega. Maine teen baar me total 1,45,000 rupaye transfer kiye HDFC account me. Ab withdrawal nahi ho raha aur wo aur paise maang rahe hain.

**Expect:** filed, Investment Scam, ₹1,45,000, reply in Hindi, RBI Sachet / SEBI routing.

---

## 3. Menu flow — greeting, then language, then incident
Send three separate messages:
> hi

> 1

> Someone made a fake Instagram profile using my photos and is asking my friends for money saying I am in hospital. The handle is @rahul_urgent_help

**Expect:** greeting → "Language set to English" → **new** complaint filed (Identity Theft / platform route). Must NOT file a ₹1 complaint on "1", must NOT treat the story as an update.

---

## 4. File, then add the UTR as a follow-up
> I paid 22000 to an online shop on Instagram for a phone that never arrived. Paid by UPI to shopdeals@okaxis. Seller stopped replying.

then:
> I found the transaction reference. UTR is 771205558842.

**Expect:** first message files; second says "Complaint … Updated", same Incident ID, UTR attached.

---

## 5. Additive amount — "another 15000 was taken"
> A fake customer care number charged my card. Lost 30000 to fraudster@ybl by UPI. UTR 900112223334.

then:
> Update: they charged my card again, another 15000 was taken.

**Expect:** update on the same case, "Additional loss added: ₹15,000", running total ₹45,000 (adds, not replaces).

---

## 6. NEW — file one, switch, file a different one
> Lost 55000 in a UPI phishing scam. Fraudster upi payme@oksbi. UTR 112233445566.

then:
> new

then:
> A loan app called RapidCash accessed my contacts and morphed my photos. They are threatening to send them to my family unless I pay 20000.

**Expect:** first case filed; "new" acknowledged; third message files a **distinct** Incident ID (Extortion & Blackmail) — not an update to the first.

---

## 7. Status query on an active case
> I was scammed of 12000 by a fake electricity bill SMS. UPI powerbill@ybl. UTR 556677889900.

then:
> what is the status of my complaint

**Expect:** first files; second returns a Case Status Report card (Incident ID, status SUBMITTED, category, amount) — not a new complaint, not an update.

---

## 8. Vague one-liner
> someone stole my money online please help

**Expect:** HTTP 200. Either triages into a complaint or asks one clarifying question. No "system failed", no dead-end.

---

## 9. Garbage input
> asdkjh asd 3982 ;;; नमस्ते ????

**Expect:** HTTP 200, a usable reply. Never a 500 / vague-sync message.

---

## 10. English extortion — sextortion, no money paid
> A person on Instagram recorded a video call and is now threatening to leak it to my contacts unless I send 50000 rupees. I have not paid anything yet. Their handle is @anon_threats_99.

**Expect:** filed, Extortion & Blackmail (IT Act 66E + BNS), ₹0 lost / ₹50,000 demanded, "do not pay" + 1930 guidance, platform-report step.
