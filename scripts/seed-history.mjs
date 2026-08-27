import { neon } from '@neondatabase/serverless'

const DB = 'postgresql://neondb_owner:npg_9UVPupCwLb0c@ep-blue-lab-azl82wp3.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
const sql = neon(DB)

const c1 = {
  incident_id: 'INC-2026-9041',
  fraud_type: 'Financial Fraud',
  victim_name: 'Unknown Scammer (Olx)',
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
  freeze_steps: JSON.stringify([
    { title: 'Call 1930', desc: 'Report the transaction immediately.' },
    { title: 'Contact SBI', desc: 'Call 1800-425-3800 to block your debit card.' }
  ]),
  applicable_laws: JSON.stringify([
    { id: 'sec_318_4', title: 'BNS Section 318(4)', desc: 'Cheating and dishonestly inducing delivery of property.' },
    { id: 'it_66d', title: 'IT Act Section 66D', desc: 'Cheating by personation by using computer resource.' }
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
  victim_name: 'Fake Instagram Profile',
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
  freeze_steps: JSON.stringify([
    { title: 'Report Profile', desc: 'Use Instagram in-app reporting for impersonation.' },
    { title: 'Warn Contacts', desc: 'Post a status warning friends not to send money.' }
  ]),
  applicable_laws: JSON.stringify([
    { id: 'it_66c', title: 'IT Act Section 66C', desc: 'Identity theft.' }
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
        incident_id, fraud_type, victim_name, amount, urgency_level,
        summary, summary_hi, complaint_draft, complaint_draft_hi,
        frauder_contact, bank_name, account_number, upi_id, timeline,
        freeze_steps, applicable_laws, saved_at, language,
        status, status_history, evidence_images, updates
      ) VALUES (
        ${c.incident_id}, ${c.fraud_type}, ${c.victim_name}, ${c.amount}, ${c.urgency_level},
        ${c.summary}, ${c.summary_hi}, ${c.complaint_draft}, ${c.complaint_draft_hi},
        ${c.frauder_contact}, ${c.bank_name}, ${c.account_number}, ${c.upi_id}, ${c.timeline},
        ${c.freeze_steps}, ${c.applicable_laws}, ${c.saved_at}, ${c.language},
        ${c.status}, ${c.status_history}, ${c.evidence_images}, ${c.updates}
      )
      ON CONFLICT (incident_id) DO NOTHING
    `
  }
  console.log('✅ Seeded 2 demo complaints into Neon')
}

seed().catch(console.error)
