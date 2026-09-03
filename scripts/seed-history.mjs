import { neon } from '@neondatabase/serverless'

const DB = process.env.DATABASE_URL
if (!DB) { console.error('❌ DATABASE_URL not set'); process.exit(1) }
const sql = neon(DB)

const c1 = {
  incident_id: 'INC-2026-9041',
  fraud_type: 'Financial Fraud',
  fraudster_identifier: 'Unknown OLX Buyer (+91 9876543210)',
  complainant_name: 'Pratham Kamath',
  amount: 45000,
  urgency_level: 'HIGH',
  summary: 'Victim attempted to sell a sofa on OLX. Scammer sent a QR code claiming it was to "receive" money. Scanning it deducted ₹45,000 from the victim\'s SBI account.',
  summary_hi: 'पीड़ित ने OLX पर सोफा बेचने का प्रयास किया। धोखेबाज ने एक QR कोड भेजा और दावा किया कि यह पैसे "प्राप्त" करने के लिए है। इसे स्कैन करते ही पीड़ित के SBI खाते से ₹45,000 कट गए।',
  complaint_draft: 'I, Pratham Kamath, hereby state that on 20 Aug 2026, I lost ₹45,000 from my SBI account (xxxx-xxxx-4019). I was selling furniture on OLX when a buyer contacted me via +91 9876543210. He sent a QR code on WhatsApp. Believing I would receive payment, I scanned it, and the amount was debited. I request immediate freezing of the beneficiary account.',
  complaint_draft_hi: 'मैं, प्रथम कामत, यह बयान देता हूं कि 20 अगस्त 2026 को मेरे SBI खाते (xxxx-xxxx-4019) से ₹45,000 कट गए। मैं OLX पर फर्नीचर बेच रहा था तभी एक खरीदार ने +91 9876543210 पर संपर्क किया। उसने WhatsApp पर एक QR कोड भेजा। मुझे लगा कि पैसे मिलेंगे, मैंने स्कैन किया, और रकम कट गई। मेरा अनुरोध है कि लाभार्थी खाते को तुरंत फ्रीज किया जाए।',
  frauder_contact: '+91 9876543210',
  bank_name: 'State Bank of India',
  account_number: 'xxxx-xxxx-4019',
  upi_id: 'scammer123@ybl',
  timeline: '20 Aug 2026, 14:30 IST',
  recommended_channel: 'bank',
  recommended_channel_target: 'State Bank of India',
  freeze_steps: JSON.stringify([
    { step: 1, action: 'Call 1930 Helpline', actionHi: 'हेल्पलाइन 1930 पर कॉल करें', detail: 'Report the transaction immediately for fastest freeze initiation.', detailHi: 'सबसे तेज फ्रीज के लिए तुरंत लेनदेन की रिपोर्ट करें।', hotline: '1930' },
    { step: 2, action: 'Contact SBI', actionHi: 'SBI से संपर्क करें', detail: 'Call SBI helpline 1800-425-3800 to block your debit card and freeze outgoing transactions.', detailHi: 'अपना डेबिट कार्ड ब्लॉक करने के लिए SBI हेल्पलाइन 1800-425-3800 पर कॉल करें।', hotline: '1800-425-3800', url: 'https://www.onlinesbi.sbi/' }
  ]),
  applicable_laws: JSON.stringify([
    { section: 'IT Act, Section 66D', title: 'Cheating by personation using a computer resource', titleHi: 'कंप्यूटर संसाधन का उपयोग करके प्रतिरूपण द्वारा धोखाधड़ी', reason: 'The scammer posed as a genuine buyer using a fraudulent QR code to cheat the victim.', reasonHi: 'धोखेबाज ने धोखाधड़ीपूर्ण QR कोड का उपयोग करके असली खरीदार बनकर पीड़ित को ठगा।' },
    { section: 'IT Act, Section 66C', title: 'Identity theft — fraudulent use of password, digital signature, or unique ID', titleHi: 'पहचान की चोरी — पासवर्ड, डिजिटल हस्ताक्षर या अद्वितीय पहचान का धोखाधड़ीपूर्ण उपयोग', reason: 'The victim\'s UPI credentials were misused to authorize an unauthorized debit.', reasonHi: 'पीड़ित के UPI क्रेडेंशियल का दुरुपयोग करके अनधिकृत डेबिट को अधिकृत किया गया।' }
  ]),
  saved_at: '2026-08-20T10:00:00.000Z',
  language: 'en',
  status: 'RESOLVED',
  status_history: JSON.stringify([
    { status: 'SUBMITTED', at: '2026-08-20T10:00:00.000Z' },
    { status: 'BANK_NOTIFIED', at: '2026-08-20T10:05:00.000Z' },
    { status: 'FIR_FILED', at: '2026-08-21T09:00:00.000Z' },
    { status: 'UNDER_INVESTIGATION', at: '2026-08-22T11:00:00.000Z' },
    { status: 'RESOLVED', at: '2026-08-26T15:30:00.000Z' }
  ]),
  evidence_images: '[]',
  updates: JSON.stringify([
    { id: '1', note: 'Bank reversed ₹45,000 back to SBI account after cyber cell directive.', actionPoints: [], actionPointsHi: [], addedAt: '2026-08-26T15:30:00.000Z' }
  ])
}

const c2 = {
  incident_id: 'INC-2026-7288',
  fraud_type: 'Identity Theft',
  fraudster_identifier: '@pratham_kamath_urgent (Fake Instagram)',
  complainant_name: 'Pratham Kamath',
  amount: 0,
  urgency_level: 'MEDIUM',
  summary: 'Someone created a fake Instagram profile using the victim\'s photos and is messaging friends asking for money citing a medical emergency.',
  summary_hi: 'किसी ने पीड़ित की तस्वीरों का उपयोग करके एक नकली इंस्टाग्राम प्रोफ़ाइल बनाई है और मेडिकल इमरजेंसी का हवाला देकर दोस्तों से पैसे मांग रहा है।',
  complaint_draft: 'I, Pratham Kamath, hereby state that an unknown person has created a fake Instagram profile (@pratham_kamath_urgent) using my photos without consent. They are messaging my contacts asking for money for a fake medical emergency. Please take down the profile and investigate the IP logs.',
  complaint_draft_hi: 'मैं, प्रथम कामत, यह बयान देता हूं कि किसी अज्ञात व्यक्ति ने मेरी तस्वीरों का उपयोग करके एक नकली इंस्टाग्राम प्रोफ़ाइल (@pratham_kamath_urgent) बनाई है। वे मेरे संपर्कों को संदेश भेजकर नकली मेडिकल इमरजेंसी के लिए पैसे मांग रहे हैं। कृपया प्रोफ़ाइल को हटाएं और आईपी लॉग की जांच करें।',
  frauder_contact: '@pratham_kamath_urgent',
  bank_name: 'N/A',
  account_number: 'N/A',
  upi_id: 'N/A',
  timeline: '10 Aug 2026, noticed at 19:00 IST',
  recommended_channel: 'platform',
  recommended_channel_target: 'Instagram',
  freeze_steps: JSON.stringify([
    { step: 1, action: 'Report Profile on Instagram', actionHi: 'इंस्टाग्राम पर प्रोफ़ाइल रिपोर्ट करें', detail: 'Use Instagram in-app reporting for impersonation. Go to the fake profile → tap three dots → Report → Impersonation.', detailHi: 'इंस्टाग्राम इन-ऐप रिपोर्टिंग का उपयोग करें। फर्जी प्रोफ़ाइल पर जाएं → तीन बिंदुओं पर टैप करें → रिपोर्ट → प्रतिरूपण।', url: 'https://help.instagram.com/' },
    { step: 2, action: 'Warn Contacts', actionHi: 'संपर्कों को चेतावनी दें', detail: 'Post a status warning friends not to send money to the fake account.', detailHi: 'दोस्तों को चेतावनी देते हुए एक स्टेटस पोस्ट करें कि नकली खाते में पैसे न भेजें।' }
  ]),
  applicable_laws: JSON.stringify([
    { section: 'IT Act, Section 66C', title: 'Identity theft — fraudulent use of password, digital signature, or unique ID', titleHi: 'पहचान की चोरी — पासवर्ड, डिजिटल हस्ताक्षर या अद्वितीय पहचान का धोखाधड़ीपूर्ण उपयोग', reason: 'The fraudster stole the victim\'s identity by creating a fake profile with their photos.', reasonHi: 'धोखेबाज ने पीड़ित की तस्वीरों के साथ एक नकली प्रोफ़ाइल बनाकर उनकी पहचान चुराई।' }
  ]),
  saved_at: '2026-08-10T14:00:00.000Z',
  language: 'en',
  status: 'UNDER_INVESTIGATION',
  status_history: JSON.stringify([
    { status: 'SUBMITTED', at: '2026-08-10T14:00:00.000Z' },
    { status: 'FIR_FILED', at: '2026-08-11T10:00:00.000Z' },
    { status: 'UNDER_INVESTIGATION', at: '2026-08-12T10:00:00.000Z' }
  ]),
  evidence_images: '[]',
  updates: JSON.stringify([
    { id: '2', note: 'Instagram Trust & Safety escalated the ticket.', actionPoints: [], actionPointsHi: [], addedAt: '2026-08-12T10:00:00.000Z' }
  ])
}

async function seed() {
  for (const c of [c1, c2]) {
    await sql`
      INSERT INTO complaints (
        incident_id, fraud_type, fraudster_identifier, complainant_name,
        amount, urgency_level,
        summary, summary_hi, complaint_draft, complaint_draft_hi,
        frauder_contact, bank_name, account_number, upi_id, timeline,
        freeze_steps, applicable_laws, saved_at, language,
        status, status_history, evidence_images, updates,
        recommended_channel, recommended_channel_target
      ) VALUES (
        ${c.incident_id}, ${c.fraud_type}, ${c.fraudster_identifier}, ${c.complainant_name},
        ${c.amount}, ${c.urgency_level},
        ${c.summary}, ${c.summary_hi}, ${c.complaint_draft}, ${c.complaint_draft_hi},
        ${c.frauder_contact}, ${c.bank_name}, ${c.account_number}, ${c.upi_id}, ${c.timeline},
        ${c.freeze_steps}, ${c.applicable_laws}, ${c.saved_at}, ${c.language},
        ${c.status}, ${c.status_history}, ${c.evidence_images}, ${c.updates},
        ${c.recommended_channel ?? 'helpline'}, ${c.recommended_channel_target ?? '1930'}
      )
      ON CONFLICT (incident_id) DO NOTHING
    `
  }
  console.log('✅ Seeded 2 demo complaints into Neon')
}

seed().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1) })
