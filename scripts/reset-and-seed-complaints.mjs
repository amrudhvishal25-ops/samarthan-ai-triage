import { neon } from '@neondatabase/serverless'
import fs from 'node:fs'
import path from 'node:path'

// Load .env.local
let dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
      for (const line of lines) {
        const match = line.match(/^\s*DATABASE_URL\s*=\s*(.*)?\s*$/)
        if (match) {
          dbUrl = match[1].trim().replace(/^['"]|['"]$/g, '')
          break
        }
      }
    }
  } catch {}
}

if (!dbUrl) {
  console.error('❌ DATABASE_URL not found')
  process.exit(1)
}

const sql = neon(dbUrl)

const testComplaints = [
  {
    incident_id: 'INC-2026-1048',
    fraud_type: 'Financial Fraud',
    fraudster_identifier: 'OLX Buyer (+91 98451 22890 / paytm-fast-seller@pty)',
    complainant_name: 'Parichay Prabhu',
    amount: 45000,
    urgency_level: 'CRITICAL',
    summary: 'Victim attempted to sell furniture on OLX. The buyer sent a fraudulent QR code claiming it was to receive payment. Scanning it authorized an unauthorized debit of ₹45,000 from SBI account.',
    summary_hi: 'पीड़ित ने OLX पर फर्नीचर बेचने का प्रयास किया। खरीदार ने पैसे भेजने के बहाने एक धोखाधड़ीपूर्ण QR कोड भेजा। इसे स्कैन करते ही SBI खाते से ₹45,000 कट गए।',
    complaint_draft: 'To The Cyber Crime Police Station / State Bank of India Nodal Office,\n\nI, Parichay Prabhu, state that on 4 Sep 2026, an unknown individual posing as a furniture buyer on OLX sent a QR code via WhatsApp (+91 98451 22890). Believing I would receive payment, I scanned it which immediately debited ₹45,000 from my SBI Account xxxx-xxxx-8421 to beneficiary handle paytm-fast-seller@pty (UTR: 429108392019). I request immediate lien-marking and FIR registration under IT Act Section 66C and 66D.',
    complaint_draft_hi: 'साइबर अपराध थाना / भारतीय स्टेट बैंक नोडल अधिकारी,\n\nमैं, परिचय प्रभु, यह बयान देता हूँ कि 4 सितंबर 2026 को OLX पर फर्नीचर खरीदार बनकर आए अज्ञात व्यक्ति (+91 98451 22890) ने WhatsApp पर QR कोड भेजा। भुगतान प्राप्त होने के भ्रम में स्कैन करने पर मेरे SBI खाते से ₹45,000 कट गए (UTR: 429108392019)। कृपया लाभार्थी खाते पर तत्काल रोक लगाएं और IT एक्ट 66C और 66D के तहत FIR दर्ज करें।',
    frauder_contact: '+91 98451 22890; UTR: 429108392019',
    bank_name: 'State Bank of India',
    account_number: 'xxxx-xxxx-8421',
    upi_id: 'paytm-fast-seller@pty',
    timeline: '4 Sep 2026, 14:15 IST',
    recommended_channel: 'bank',
    recommended_channel_target: 'State Bank of India Nodal Desk',
    freeze_steps: JSON.stringify([
      { step: 1, action: 'Dial 1930 NCRP Helpline', actionHi: '1930 राष्ट्रीय हेल्पलाइन डायल करें', detail: 'Quote UTR 429108392019 to trigger immediate interbank freeze.', detailHi: 'तुरंत बैंक फ्रीज शुरू कराने के लिए UTR 429108392019 बताएं।', hotline: '1930' },
      { step: 2, action: 'Submit Lien Request to SBI', actionHi: 'SBI में लियन मार्किंग आवेदन जमा करें', detail: 'Contact SBI Cyber Fraud Cell at 1800-11-2211.', detailHi: 'SBI साइबर फ्रॉड सेल 1800-11-2211 पर संपर्क करें।', hotline: '1800-11-2211' }
    ]),
    applicable_laws: JSON.stringify([
      { section: 'Section 66D IT Act 2000', title: 'Cheating by Personation using Computer Resource', titleHi: 'कंप्यूटर संसाधन द्वारा प्रतिरूपण', reason: 'Fraudster impersonated a legitimate online buyer to deceive complainant.', reasonHi: 'धोखेबाज ने खरीदार का नाटक कर पीड़ित को ठगा।' },
      { section: 'Section 66C IT Act 2000', title: 'Identity Theft & Unauthorized Credential Use', titleHi: 'पहचान की चोरी और अनाधिकृत क्रेडेंशियल उपयोग', reason: 'Fraudulent payment link crafted to deceive UPI authentication.', reasonHi: 'UPI भुगतान लिंक के माध्यम से अनधिकृत निकासी।' }
    ]),
    saved_at: '2026-09-04T08:45:00.000Z',
    language: 'en',
    status: 'UNDER_INVESTIGATION',
    status_history: JSON.stringify([
      { status: 'SUBMITTED', at: '2026-09-04T08:45:00.000Z', note: 'Complaint logged via Samarthan AI Intake' },
      { status: 'BANK_NOTIFIED', at: '2026-09-04T09:02:00.000Z', note: 'SBI Nodal desk issued acknowledgment ref SBI/CY/2026/8912' },
      { status: 'UNDER_INVESTIGATION', at: '2026-09-05T11:30:00.000Z', note: 'Assigned to Cyber Crime Cell, Bengaluru Urban' }
    ]),
    evidence_images: JSON.stringify([]),
    updates: JSON.stringify([
      { id: 'up-1', note: 'SBI Cyber Desk placed a temporary lien of ₹45,000 on the recipient wallet.', actionPoints: ['Keep bank dispute letter ready'], actionPointsHi: ['बैंक विवाद पत्र तैयार रखें'], addedAt: '2026-09-05T14:00:00.000Z' }
    ])
  },
  {
    incident_id: 'INC-2026-2184',
    fraud_type: 'Investment Scam',
    fraudster_identifier: 'Apex Institutional Wealth Club (Telegram @apex_vip_desk)',
    complainant_name: 'Vikramaditya Sengupta',
    amount: 185000,
    urgency_level: 'CRITICAL',
    summary: 'Victim added to a VIP stock trading channel on Telegram promising guaranteed pre-IPO allotments. Transferred ₹1,85,000 across two IMPS transfers before withdrawals were blocked.',
    summary_hi: 'पीड़ित को टेलीग्राम पर प्री-आईपीओ शेयर आवंटन का झांसा देकर एक वीआईपी ग्रुप में जोड़ा गया। दो IMPS लेनदेन में ₹1,85,000 ट्रांसफर करने के बाद निकासी रोक दी गई।',
    complaint_draft: 'To The Station House Officer / Cyber Crime Cell,\n\nI was deceived into investing ₹1,85,000 into a fraudulent platform operated via Telegram handle @apex_vip_desk. The administrators fabricated SEBI certificates and claimed guaranteed IPO returns. When I requested a withdrawal, they demanded an additional 30% advance tax. I request urgent action under Section 66D IT Act and Section 318(4) BNS.',
    complaint_draft_hi: 'थाना प्रभारी / साइबर अपराध प्रकोष्ठ,\n\nमुझे टेलीग्राम हैंडल @apex_vip_desk द्वारा संचालित एक फर्जी निवेश समूह में ₹1,85,000 निवेश करने के लिए धोखा दिया गया। निकासी का अनुरोध करने पर 30% अतिरिक्त टैक्स मांगा गया। कृपया IT एक्ट 66D और BNS 318(4) के तहत कानूनी कार्रवाई करें।',
    frauder_contact: 'Telegram: @apex_vip_desk; Phone: +91 91234 56789',
    bank_name: 'HDFC Bank',
    account_number: 'xxxx-xxxx-5102',
    upi_id: 'apexwealth@cmsidfc',
    timeline: '2 Sep 2026, 11:30 IST',
    recommended_channel: 'agency',
    recommended_channel_target: 'SEBI SCORES & RBI Sachet Portal',
    freeze_steps: JSON.stringify([
      { step: 1, action: 'File Report on RBI Sachet Portal', actionHi: 'RBI सचेत पोर्टल पर शिकायत दर्ज करें', detail: 'Register unauthorized non-banking deposit scam.', detailHi: 'अनधिकृत गैर-बैंकिंग जमा घोटाले की रिपोर्ट दर्ज करें।', url: 'https://sachet.rbi.org.in' },
      { step: 2, action: 'Notify HDFC Cyber Unit', actionHi: 'HDFC साइबर यूनिट को सूचित करें', detail: 'Furnish UTR numbers 810293810231 and 810293810232.', detailHi: 'UTR नंबर 810293810231 और 810293810232 प्रदान करें।', hotline: '1800-202-6161' }
    ]),
    applicable_laws: JSON.stringify([
      { section: 'Section 66D IT Act 2000', title: 'Cheating by Personation using Computer Resource', titleHi: 'कंप्यूटर संसाधन द्वारा प्रतिरूपण', reason: 'Impersonated registered SEBI research analyst.', reasonHi: 'पंजीकृत SEBI विश्लेषक होने का फर्जी दावा किया।' },
      { section: 'Section 318(4) BNS', title: 'Cheating and Dishonestly Inducing Delivery of Property', titleHi: 'धोखाधड़ी और संपत्ति की डिलीवरी के लिए प्रेरित करना', reason: 'Induced victim to deposit ₹1,85,000 with fraudulent promises of profit.', reasonHi: 'मुनाफे का झूठा वादा करके धन जमा करवाया।' }
    ]),
    saved_at: '2026-09-02T06:00:00.000Z',
    language: 'en',
    status: 'BANK_NOTIFIED',
    status_history: JSON.stringify([
      { status: 'SUBMITTED', at: '2026-09-02T06:00:00.000Z', note: 'Case captured via Samarthan' },
      { status: 'BANK_NOTIFIED', at: '2026-09-02T06:25:00.000Z', note: 'Freezing notice dispatched to beneficiary nodal bank' }
    ]),
    evidence_images: JSON.stringify([]),
    updates: JSON.stringify([
      { id: 'up-2', note: 'Submitted Telegram chat export and payment screenshots to Cyber Crime unit.', actionPoints: ['Preserve PDF statement of HDFC account'], actionPointsHi: ['HDFC खाते का PDF विवरण सुरक्षित रखें'], addedAt: '2026-09-03T09:00:00.000Z' }
    ])
  },
  {
    incident_id: 'INC-2026-3490',
    fraud_type: 'Extortion & Blackmail',
    fraudster_identifier: 'CashQuick Instant Credit App (+91 88765 43210)',
    complainant_name: 'Ananya Deshmukh',
    amount: 12000,
    urgency_level: 'HIGH',
    summary: 'Victim installed an unverified instant loan app which accessed photo gallery and contacts. Scammers morphed photographs and sent blackmail messages to family demanding ₹12,000 extortion.',
    summary_hi: 'पीड़ित ने एक अनधिकृत इंस्टेंट लोन ऐप डाउनलोड किया जिसने संपर्कों और गैलरी को एक्सेस कर लिया। धोखेबाजों ने तस्वीरों को मॉर्फ कर परिवार को ब्लैकमेल करना शुरू कर दिया।',
    complaint_draft: 'To The Deputy Commissioner of Police / Cyber Cell,\n\nI am lodging an urgent complaint against illegal loan recovery operators associated with CashQuick App (+91 88765 43210). They have stolen my contact list and morphed private photos, sending them via WhatsApp to my relatives demanding extortion money. I request immediate takedown of the application and criminal proceedings under Section 66E IT Act and Section 308(2) BNS.',
    complaint_draft_hi: 'पुलिस उपायुक्त / साइबर अपराध शाखा,\n\nमैं कैशक्विक ऐप (+91 88765 43210) के अवैध रिकवरी एजेंटों के खिलाफ शिकायत दर्ज कर रही हूँ। उन्होंने मेरी तस्वीरों को मॉर्फ करके मेरे रिश्तेदारों को भेजकर जबरन वसूली की मांग की है। कृपया IT एक्ट 66E और BNS 308(2) के तहत FIR दर्ज करें।',
    frauder_contact: '+91 88765 43210',
    bank_name: 'N/A',
    account_number: 'N/A',
    upi_id: 'loanrecover99@ybl',
    timeline: '30 Aug 2026, 18:00 IST',
    recommended_channel: 'helpline',
    recommended_channel_target: 'National Cyber Crime Helpline 1930',
    freeze_steps: JSON.stringify([
      { step: 1, action: 'File Formal FIR with Cyber Police', actionHi: 'साइबर पुलिस में औपचारिक FIR दर्ज करें', detail: 'Zero-tolerance extortion protocol with police protection request.', detailHi: 'जबरन वसूली के खिलाफ पुलिस सुरक्षा का अनुरोध करें।', hotline: '1930' },
      { step: 2, action: 'Revoke App Permissions & Uninstall', actionHi: 'ऐप अनुमतियां रद्द करें और अनइंस्टॉल करें', detail: 'Block numbers on WhatsApp and notify close family contacts.', detailHi: 'व्हाट्सएप पर नंबर ब्लॉक करें और परिजनों को सचेत करें।' }
    ]),
    applicable_laws: JSON.stringify([
      { section: 'Section 66E IT Act 2000', title: 'Violation of Privacy', titleHi: 'निजता का उल्लंघन', reason: 'Capturing, publishing or transmitting private images without consent.', reasonHi: 'सहमति के बिना निजी तस्वीरों को मॉर्फ और प्रसारित करना।' },
      { section: 'Section 308(2) BNS', title: 'Extortion by Threat of Injury or Reputation Loss', titleHi: 'प्रतिष्ठा या चोट के भय से जबरन वसूली', reason: 'Threatening social defamation to extort money.', reasonHi: 'धन वसूलने के लिए सामाजिक बदनामी की धमकी देना।' }
    ]),
    saved_at: '2026-08-30T12:30:00.000Z',
    language: 'en',
    status: 'FIR_FILED',
    status_history: JSON.stringify([
      { status: 'SUBMITTED', at: '2026-08-30T12:30:00.000Z', note: 'Intake completed' },
      { status: 'FIR_FILED', at: '2026-08-31T10:15:00.000Z', note: 'FIR No. 204/2026 registered under Section 66E IT Act' }
    ]),
    evidence_images: JSON.stringify([]),
    updates: JSON.stringify([
      { id: 'up-3', note: 'Threatening WhatsApp accounts reported to Meta and suspended by cyber team.', actionPoints: ['Attend statement recording at cyber station'], actionPointsHi: ['साइबर थाने में बयान दर्ज कराएं'], addedAt: '2026-08-31T16:00:00.000Z' }
    ])
  },
  {
    incident_id: 'INC-2026-4821',
    fraud_type: 'Identity Theft',
    fraudster_identifier: '@rohan_mehra_urgent (Fake Profile)',
    complainant_name: 'Rohan Mehra',
    amount: 0,
    urgency_level: 'MEDIUM',
    summary: 'Scammer cloned victim\'s public Instagram profile, copied photos and bio, and solicited money from followers claiming an emergency hospital admission.',
    summary_hi: 'धोखेबाज ने पीड़ित के इंस्टाग्राम प्रोफाइल की नकल की, तस्वीरें कॉपी कीं और इमरजेंसी का बहाना बनाकर दोस्तों से पैसे मांगे।',
    complaint_draft: 'To Meta Grievance Officer / National Cybercrime Portal,\n\nI am reporting identity theft and impersonation on Instagram. An unknown person created account @rohan_mehra_urgent using my pictures and personal identity to solicit financial aid fraudulently. I request prompt profile takedown and preservation of IP access logs.',
    complaint_draft_hi: 'मेटा शिकायत अधिकारी / राष्ट्रीय साइबर अपराध पोर्टल,\n\nमैं इंस्टाग्राम पर पहचान की चोरी की रिपोर्ट कर रहा हूँ। किसी अज्ञात व्यक्ति ने मेरी तस्वीरों का उपयोग करके फर्जी अकाउंट @rohan_mehra_urgent बनाया है। कृपया इस खाते को तुरंत निलंबित करें।',
    frauder_contact: '@rohan_mehra_urgent',
    bank_name: 'N/A',
    account_number: 'N/A',
    upi_id: 'N/A',
    timeline: '25 Aug 2026, 20:00 IST',
    recommended_channel: 'platform',
    recommended_channel_target: 'Instagram Trust & Safety Desk',
    freeze_steps: JSON.stringify([
      { step: 1, action: 'In-App Impersonation Report', actionHi: 'इन-ऐप प्रतिरूपण रिपोर्ट दर्ज करें', detail: 'Report account via Instagram profile three-dot menu.', detailHi: 'इंस्टाग्राम प्रोफ़ाइल पर जाकर रिपोर्ट विकल्प चुनें।' },
      { step: 2, action: 'Broadcast Story Warning', actionHi: 'फॉलोअर्स के लिए चेतावनी संदेश जारी करें', detail: 'Notify followers not to transfer money to the fake account.', detailHi: 'फॉलोअर्स को नकली खाते में पैसे न भेजने के लिए सचेत करें।' }
    ]),
    applicable_laws: JSON.stringify([
      { section: 'Section 66C IT Act 2000', title: 'Identity Theft', titleHi: 'पहचान की चोरी', reason: 'Misuse of electronic identity and likeness.', reasonHi: 'इलेक्ट्रॉनिक पहचान और तस्वीरों का अनधिकृत उपयोग।' }
    ]),
    saved_at: '2026-08-25T14:30:00.000Z',
    language: 'en',
    status: 'RESOLVED',
    status_history: JSON.stringify([
      { status: 'SUBMITTED', at: '2026-08-25T14:30:00.000Z', note: 'Case created' },
      { status: 'PLATFORM_REPORTED', at: '2026-08-25T15:00:00.000Z', note: 'Escalated to Meta Grievance Desk' },
      { status: 'RESOLVED', at: '2026-08-27T09:40:00.000Z', note: 'Fake profile successfully taken down by platform' }
    ]),
    evidence_images: JSON.stringify([]),
    updates: JSON.stringify([
      { id: 'up-4', note: 'Instagram confirmed account deletion and verified no funds were transferred.', actionPoints: [], actionPointsHi: [], addedAt: '2026-08-27T09:40:00.000Z' }
    ])
  },
  {
    incident_id: 'INC-2026-5912',
    fraud_type: 'E-Commerce Scams',
    fraudster_identifier: 'TrendElectronics Online (+91 94321 09876)',
    complainant_name: 'Sneha Kulkarni',
    amount: 24999,
    urgency_level: 'HIGH',
    summary: 'Victim purchased a tablet from an advertised Instagram storefront. After payment of ₹24,999, the tracking number was fake and support numbers were disconnected.',
    summary_hi: 'पीड़ित ने एक विज्ञापित इंस्टाग्राम स्टोर से टैबलेट खरीदा। ₹24,999 का भुगतान करने के बाद फर्जी ट्रैकिंग नंबर दिया गया और संपर्क बंद कर दिया गया।',
    complaint_draft: 'To The Cyber Crime Station / Consumer Forum,\n\nI ordered an electronic device from trendelec-india.shop paying ₹24,999 via UPI to merchant paytmqr2810@paytm. The seller provided a fictitious courier tracking ID and thereafter blocked all communications. I request registration of cyber fraud case and recovery of funds.',
    complaint_draft_hi: 'साइबर अपराध थाना / उपभोक्ता फोरम,\n\nमैंने trendelec-india.shop से ₹24,999 का टैबलेट खरीदा। व्यापारी paytmqr2810@paytm को भुगतान के बाद फर्जी ट्रैकिंग नंबर दिया गया और संपर्क काट दिया गया। कृपया राशि की वसूली हेतु कार्रवाई करें।',
    frauder_contact: '+91 94321 09876; UPI: paytmqr2810@paytm',
    bank_name: 'Axis Bank',
    account_number: 'xxxx-xxxx-3918',
    upi_id: 'paytmqr2810@paytm',
    timeline: '28 Aug 2026, 16:20 IST',
    recommended_channel: 'bank',
    recommended_channel_target: 'Axis Bank Cyber Grievance Cell',
    freeze_steps: JSON.stringify([
      { step: 1, action: 'Chargeback / Recall Request with Axis Bank', actionHi: 'एक्सिस बैंक में चार्जकॉल अनुरोध दर्ज करें', detail: 'Request payment recall under merchant fraud dispute.', detailHi: 'मर्चेंट फ्रॉड विवाद के तहत भुगतान वापस बुलाने का अनुरोध करें।', hotline: '1860-419-5555' },
      { step: 2, action: 'Report to National Consumer Helpline', actionHi: 'राष्ट्रीय उपभोक्ता हेल्पलाइन 1915 पर शिकायत करें', detail: 'Register e-commerce scam docket with NCH.', detailHi: 'उपभोक्ता फोरम में ई-कॉमर्स धोखाधड़ी दर्ज करें।', hotline: '1915' }
    ]),
    applicable_laws: JSON.stringify([
      { section: 'Section 66D IT Act 2000', title: 'Cheating by Personation using Computer Resource', titleHi: 'कंप्यूटर संसाधन द्वारा धोखाधड़ी', reason: 'Operating a fraudulent online commercial portal to induce payment.', reasonHi: 'फर्जी वेबसाइट चलाकर ग्राहकों से धोखाधड़ी करना।' }
    ]),
    saved_at: '2026-08-28T10:50:00.000Z',
    language: 'en',
    status: 'SUBMITTED',
    status_history: JSON.stringify([
      { status: 'SUBMITTED', at: '2026-08-28T10:50:00.000Z', note: 'Case logged on portal' }
    ]),
    evidence_images: JSON.stringify([]),
    updates: JSON.stringify([])
  },
  {
    incident_id: 'INC-2026-6303',
    fraud_type: 'Financial Fraud',
    fraudster_identifier: 'PowerDisconnection Desk (+91 97654 32190)',
    complainant_name: 'Citizen Complainant',
    amount: 8500,
    urgency_level: 'HIGH',
    summary: 'Received an alarming SMS claiming electricity power would be disconnected at night unless unpaid dues of ₹8,500 were cleared immediately via link.',
    summary_hi: 'बिजली बिल बकाया होने पर रात को बिजली काटने का धमकी भरा SMS आया। दिए गए लिंक से भुगतान करते ही ₹8,500 की अनधिकृत निकासी हो गई।',
    complaint_draft: 'To The Cyber Crime Station House Officer,\n\nI received an urgent spoofed SMS threatening immediate power disconnection. The link redirected to a malicious quick-pay portal which deducted ₹8,500 without generating a receipt. I request freezing of the recipient account and investigation under Section 66C/66D IT Act.',
    complaint_draft_hi: 'साइबर अपराध थाना प्रभारी,\n\nमुझे बिजली काटने का धमकी भरा फर्जी SMS मिला। लिंक पर जाने पर ₹8,500 की अनधिकृत निकासी हो गई। कृपया IT एक्ट 66C/66D के तहत आरोपी का खाता फ्रीज करें।',
    frauder_contact: '+91 97654 32190; UTR: 591029381023',
    bank_name: 'Punjab National Bank',
    account_number: 'xxxx-xxxx-1029',
    upi_id: 'powerdesk99@pnb',
    timeline: '6 Sep 2026, 17:00 IST',
    recommended_channel: 'bank',
    recommended_channel_target: 'Punjab National Bank Nodal Officer',
    freeze_steps: JSON.stringify([
      { step: 1, action: 'Call 1930 Helpline', actionHi: '1930 हेल्पलाइन पर कॉल करें', detail: 'Quote UTR 591029381023 to initiate golden hour freeze.', detailHi: 'गोल्डन ऑवर फ्रीज के लिए UTR 591029381023 बताएं।', hotline: '1930' },
      { step: 2, action: 'Notify Discom Vigilance', actionHi: 'बिजली वितरण कंपनी को सूचित करें', detail: 'Report spoofed sender ID to state power distribution company.', detailHi: 'फर्जी सेंडर आईडी की शिकायत बिजली कंपनी को करें।' }
    ]),
    applicable_laws: JSON.stringify([
      { section: 'Section 66D IT Act 2000', title: 'Cheating by Personation', titleHi: 'प्रतिरूपण द्वारा धोखाधड़ी', reason: 'Impersonating government utility provider.', reasonHi: 'सरकारी बिजली वितरण विभाग का फर्जी रूप धारण करना।' },
      { section: 'Section 66C IT Act 2000', title: 'Identity Theft', titleHi: 'पहचान की चोरी', reason: 'Spoofing legitimate utility header to deceive user.', reasonHi: 'फर्जी हेडर के जरिए क्रेडेंशियल चुराना।' }
    ]),
    saved_at: '2026-09-06T11:30:00.000Z',
    language: 'en',
    status: 'SUBMITTED',
    status_history: JSON.stringify([
      { status: 'SUBMITTED', at: '2026-09-06T11:30:00.000Z', note: 'Filed automatically via WhatsApp Bot (+916303807967)' }
    ]),
    evidence_images: JSON.stringify([]),
    updates: JSON.stringify([
      { id: 'up-init', citizenPhone: '+916303807967', note: 'WhatsApp Bot linked active case', addedAt: '2026-09-06T11:30:00.000Z' }
    ])
  }
]

async function resetAndSeed() {
  console.log('🗑️  Deleting all existing complaints from Neon database...')
  const deleteResult = await sql`DELETE FROM complaints;`
  console.log('✅ All old complaints deleted successfully.')

  console.log(`🌱 Seeding ${testComplaints.length} fresh, realistic complaints...`)

  for (const c of testComplaints) {
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
        ${c.recommended_channel}, ${c.recommended_channel_target}
      )
    `
    console.log(`  ✓ Inserted ${c.incident_id} (${c.fraud_type} - ₹${c.amount}) [${c.status}]`)
  }

  const check = await sql`SELECT count(*) FROM complaints;`
  console.log(`\n🎉 Done! Current complaint count in Neon DB: ${check[0].count}`)
}

resetAndSeed().catch((err) => {
  console.error('❌ Reset & Seed failed:', err)
  process.exit(1)
})
