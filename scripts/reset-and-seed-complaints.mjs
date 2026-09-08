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

// 3 high-quality SUBMITTED complaints for demo:
//  1. INC-2026-7001 — has simulated edits (updates + advanced status)
//  2. INC-2026-7002 — missing the UTR, needs it added
//  3. INC-2026-7003 — fully completed end to end
const testComplaints = [
  // ─────────────────────────────────────────────────────────────────────
  // 1. WITH SIMULATED EDITS — updates array populated, status advanced
  // ─────────────────────────────────────────────────────────────────────
  {
    incident_id: 'INC-2026-7001',
    fraud_type: 'Financial Fraud',
    fraudster_identifier: 'Fake SBI KYC Caller (+91 90362 55810 / sbi.kyc.verify@okaxis)',
    complainant_name: 'Parichay Prabhu',
    amount: 96500,
    urgency_level: 'CRITICAL',
    summary: 'Complainant received a call from a person claiming to be from SBI who said the account would be frozen unless KYC was re-verified. The caller walked the complainant through an "SBI YONO update" link and had them read out an OTP, after which ₹96,500 was debited in two UPI transfers to the handle sbi.kyc.verify@okaxis.',
    summary_hi: 'शिकायतकर्ता को एक व्यक्ति का कॉल आया जिसने खुद को SBI का बताया और कहा कि KYC दोबारा सत्यापित न करने पर खाता फ्रीज हो जाएगा। कॉल करने वाले ने एक "SBI YONO अपडेट" लिंक खुलवाया और OTP पढ़वा लिया, जिसके बाद sbi.kyc.verify@okaxis हैंडल पर दो UPI ट्रांसफर में ₹96,500 कट गए।',
    complaint_draft: 'To The Cyber Crime Police Station / State Bank of India Nodal Office,\n\nI am filing this complaint regarding a financial fraud committed against me on 7 September 2026. At approximately 11:20 IST I received a phone call from +91 90362 55810. The caller claimed to be an SBI officer and stated that my account would be suspended within the hour unless I completed an urgent KYC re-verification. Under this pressure I opened a link the caller sent and, believing it to be the official SBI YONO portal, I read out a one-time password when prompted.\n\nImmediately after, two UPI debits of ₹48,250 each (total ₹96,500) were made from my SBI Savings Account ****-****-8421 to the beneficiary UPI handle sbi.kyc.verify@okaxis. Transaction reference numbers are UTR 512930184477 and UTR 512930184491, both dated 7 September 2026.\n\nI request immediate lien-marking of the beneficiary account, registration of an FIR under Sections 66C and 66D of the Information Technology Act 2000, and recovery of the defrauded amount.\n\n[Complainant address / city — to be provided]',
    complaint_draft_hi: 'साइबर अपराध थाना / भारतीय स्टेट बैंक नोडल अधिकारी,\n\nमैं 7 सितंबर 2026 को मेरे साथ हुई वित्तीय धोखाधड़ी के संबंध में यह शिकायत दर्ज कर रहा हूँ। लगभग 11:20 बजे मुझे +91 90362 55810 से कॉल आया। कॉल करने वाले ने खुद को SBI अधिकारी बताया और कहा कि तत्काल KYC पुनः सत्यापन न करने पर एक घंटे में मेरा खाता निलंबित हो जाएगा। दबाव में आकर मैंने उनके भेजे लिंक को खोला और आधिकारिक SBI YONO पोर्टल समझकर OTP पढ़ दिया।\n\nइसके तुरंत बाद मेरे SBI बचत खाते ****-****-8421 से ₹48,250 के दो UPI ट्रांसफर (कुल ₹96,500) लाभार्थी UPI हैंडल sbi.kyc.verify@okaxis को किए गए। लेनदेन संदर्भ संख्या UTR 512930184477 और UTR 512930184491 हैं, दोनों 7 सितंबर 2026 के।\n\nकृपया लाभार्थी खाते पर तत्काल रोक लगाएं, IT अधिनियम 2000 की धारा 66C और 66D के तहत FIR दर्ज करें और ठगी गई राशि की वसूली करें।\n\n[शिकायतकर्ता का पता / शहर — प्रदान किया जाना है]',
    frauder_contact: '+91 90362 55810; UPI: sbi.kyc.verify@okaxis; UTR: 512930184477, 512930184491',
    bank_name: 'State Bank of India',
    account_number: 'xxxx-xxxx-8421',
    upi_id: 'sbi.kyc.verify@okaxis',
    timeline: '7 Sep 2026, 11:20–11:34 IST',
    recommended_channel: 'bank',
    recommended_channel_target: 'State Bank of India Nodal Desk',
    freeze_steps: JSON.stringify([
      { step: 1, action: 'Dial 1930 NCRP Helpline', actionHi: '1930 राष्ट्रीय हेल्पलाइन डायल करें', detail: 'Quote UTR 512930184477 and 512930184491 to trigger an immediate interbank hold on the beneficiary account.', detailHi: 'लाभार्थी खाते पर तुरंत रोक के लिए UTR 512930184477 और 512930184491 बताएं।', hotline: '1930' },
      { step: 2, action: 'File a written dispute with SBI', actionHi: 'SBI में लिखित विवाद दर्ज करें', detail: 'Contact the SBI Cyber Fraud Cell on 1800-11-2211 and submit the unauthorised-transaction dispute form within 3 days to retain zero-liability protection.', detailHi: 'SBI साइबर फ्रॉड सेल 1800-11-2211 पर संपर्क करें और शून्य-देयता सुरक्षा हेतु 3 दिनों के भीतर अनधिकृत-लेनदेन विवाद फॉर्म जमा करें।', hotline: '1800-11-2211' },
    ]),
    applicable_laws: JSON.stringify([
      { section: 'Section 66D IT Act 2000', title: 'Cheating by Personation using a Computer Resource', titleHi: 'कंप्यूटर संसाधन द्वारा प्रतिरूपण से धोखाधड़ी', reason: 'The fraudster impersonated an SBI officer over a phone call and a spoofed KYC portal to deceive the complainant.', reasonHi: 'धोखेबाज ने फोन कॉल और फर्जी KYC पोर्टल के जरिए SBI अधिकारी बनकर शिकायतकर्ता को ठगा।' },
      { section: 'Section 66C IT Act 2000', title: 'Identity Theft & Fraudulent Use of Credentials', titleHi: 'पहचान की चोरी और क्रेडेंशियल का धोखाधड़ीपूर्ण उपयोग', reason: 'The OTP obtained by deception was used to authorise UPI transfers without the account holder\'s genuine consent.', reasonHi: 'धोखे से प्राप्त OTP का उपयोग खाताधारक की वास्तविक सहमति के बिना UPI ट्रांसफर के लिए किया गया।' },
    ]),
    saved_at: '2026-09-07T06:05:00.000Z',
    language: 'en',
    status: 'UNDER_INVESTIGATION',
    status_history: JSON.stringify([
      { status: 'SUBMITTED', at: '2026-09-07T06:05:00.000Z', note: 'Complaint logged via Samarthan AI intake' },
      { status: 'BANK_NOTIFIED', at: '2026-09-07T06:31:00.000Z', note: 'SBI Nodal desk acknowledged — ref SBI/CY/2026/11207' },
      { status: 'UNDER_INVESTIGATION', at: '2026-09-08T09:15:00.000Z', note: 'Assigned to Cyber Crime Cell, Bengaluru Urban' },
    ]),
    evidence_images: JSON.stringify([]),
    updates: JSON.stringify([
      {
        id: 'up-7001-a',
        note: 'Added the two UPI transaction reference numbers (UTR 512930184477 and 512930184491) after retrieving them from the SBI SMS alerts. Draft complaint updated to cite both.',
        actionPoints: ['Keep the SBI SMS screenshots ready for the investigating officer', 'Download the account statement for 7 Sep 2026 as PDF'],
        actionPointsHi: ['जांच अधिकारी के लिए SBI SMS स्क्रीनशॉट तैयार रखें', '7 सितंबर 2026 का खाता विवरण PDF के रूप में डाउनलोड करें'],
        addedAt: '2026-09-07T07:40:00.000Z',
      },
      {
        id: 'up-7001-b',
        note: 'SBI Cyber Fraud Cell confirmed a temporary lien of ₹96,500 has been placed on the beneficiary account pending police direction.',
        actionPoints: ['Submit the signed unauthorised-transaction dispute form to the branch', 'Follow up with the 1930 acknowledgement number in 48 hours'],
        actionPointsHi: ['शाखा में हस्ताक्षरित अनधिकृत-लेनदेन विवाद फॉर्म जमा करें', '48 घंटों में 1930 पावती संख्या के साथ फॉलो-अप करें'],
        addedAt: '2026-09-08T10:05:00.000Z',
      },
    ]),
  },

  // ─────────────────────────────────────────────────────────────────────
  // 2. MISSING THE UTR — needs the transaction reference added
  // ─────────────────────────────────────────────────────────────────────
  {
    incident_id: 'INC-2026-7002',
    fraud_type: 'E-Commerce Scams',
    fraudster_identifier: 'ShopNimbus Deals (Instagram @shopnimbus.deals / +91 96541 20873)',
    complainant_name: 'Parichay Prabhu',
    amount: 31999,
    urgency_level: 'HIGH',
    summary: 'Complainant ordered a laptop advertised at a heavy discount by an Instagram storefront and paid ₹31,999 by UPI to a merchant handle. The seller shared a courier tracking ID that does not exist on any logistics network and then stopped responding. The exact bank transaction reference (UTR) for the payment has not yet been located.',
    summary_hi: 'शिकायतकर्ता ने एक इंस्टाग्राम स्टोर द्वारा भारी छूट पर विज्ञापित लैपटॉप ऑर्डर किया और एक मर्चेंट हैंडल को UPI से ₹31,999 का भुगतान किया। विक्रेता ने एक कूरियर ट्रैकिंग आईडी दी जो किसी लॉजिस्टिक्स नेटवर्क पर मौजूद नहीं है और फिर जवाब देना बंद कर दिया। भुगतान का सटीक बैंक लेनदेन संदर्भ (UTR) अभी तक नहीं मिला है।',
    complaint_draft: 'To The Cyber Crime Police Station / National Consumer Helpline,\n\nI am filing this complaint regarding an online shopping fraud. On 6 September 2026 I placed an order for a laptop advertised by the Instagram page @shopnimbus.deals. As instructed by the seller I paid ₹31,999 from my HDFC Bank account ****-****-5102 via UPI to the merchant handle shopnimbus.pay@okhdfcbank.\n\nAfter payment the seller sent me a courier tracking ID (SNB-IN-8841207) which returns no result on any recognised logistics tracking service. The seller has since stopped replying to messages and calls to +91 96541 20873 go unanswered.\n\nI am in the process of retrieving the exact UPI transaction reference number (UTR) from my bank and will provide it as soon as it is available. I request registration of a cyber fraud case, a payment recall to the beneficiary account, and recovery of ₹31,999.\n\n[Complainant address / city — to be provided]',
    complaint_draft_hi: 'साइबर अपराध थाना / राष्ट्रीय उपभोक्ता हेल्पलाइन,\n\nमैं एक ऑनलाइन शॉपिंग धोखाधड़ी के संबंध में यह शिकायत दर्ज कर रहा हूँ। 6 सितंबर 2026 को मैंने इंस्टाग्राम पेज @shopnimbus.deals द्वारा विज्ञापित एक लैपटॉप का ऑर्डर दिया। विक्रेता के निर्देशानुसार मैंने अपने HDFC बैंक खाते ****-****-5102 से UPI द्वारा मर्चेंट हैंडल shopnimbus.pay@okhdfcbank को ₹31,999 का भुगतान किया।\n\nभुगतान के बाद विक्रेता ने एक कूरियर ट्रैकिंग आईडी (SNB-IN-8841207) भेजी जो किसी भी मान्यता प्राप्त लॉजिस्टिक्स सेवा पर कोई परिणाम नहीं देती। इसके बाद विक्रेता ने संदेशों का जवाब देना बंद कर दिया है और +91 96541 20873 पर कॉल का उत्तर नहीं मिलता।\n\nमैं अपने बैंक से सटीक UPI लेनदेन संदर्भ संख्या (UTR) प्राप्त करने की प्रक्रिया में हूँ और उपलब्ध होते ही उसे प्रदान करूँगा। कृपया साइबर धोखाधड़ी का मामला दर्ज करें, लाभार्थी खाते में भुगतान वापस बुलाएं और ₹31,999 की वसूली करें।\n\n[शिकायतकर्ता का पता / शहर — प्रदान किया जाना है]',
    frauder_contact: '+91 96541 20873; Instagram: @shopnimbus.deals; UPI: shopnimbus.pay@okhdfcbank; UTR: not yet provided',
    bank_name: 'HDFC Bank',
    account_number: 'xxxx-xxxx-5102',
    upi_id: 'shopnimbus.pay@okhdfcbank',
    timeline: '6 Sep 2026, 19:45 IST',
    recommended_channel: 'bank',
    recommended_channel_target: 'HDFC Bank Cyber Grievance Cell',
    freeze_steps: JSON.stringify([
      { step: 1, action: 'Retrieve the UTR and call 1930', actionHi: 'UTR प्राप्त करें और 1930 पर कॉल करें', detail: 'Open the HDFC app or SMS history, find the 12-digit UPI reference for the ₹31,999 payment, then call 1930 and quote it so the beneficiary account can be held.', detailHi: 'HDFC ऐप या SMS इतिहास खोलें, ₹31,999 भुगतान का 12-अंकीय UPI संदर्भ खोजें, फिर 1930 पर कॉल करके बताएं ताकि लाभार्थी खाता रोका जा सके।', hotline: '1930' },
      { step: 2, action: 'Raise a UPI dispute with HDFC Bank', actionHi: 'HDFC बैंक में UPI विवाद दर्ज करें', detail: 'Call HDFC on 1800-202-6161 and file a merchant-fraud / non-delivery dispute for a payment recall once the UTR is in hand.', detailHi: 'HDFC को 1800-202-6161 पर कॉल करें और UTR मिलने पर भुगतान वापसी हेतु मर्चेंट-धोखाधड़ी / गैर-वितरण विवाद दर्ज करें।', hotline: '1800-202-6161' },
      { step: 3, action: 'Report to the National Consumer Helpline', actionHi: 'राष्ट्रीय उपभोक्ता हेल्पलाइन पर रिपोर्ट करें', detail: 'Register the e-commerce non-delivery on 1915 / consumerhelpline.gov.in with the order screenshots and the fake tracking ID.', detailHi: 'ऑर्डर स्क्रीनशॉट और फर्जी ट्रैकिंग आईडी के साथ 1915 / consumerhelpline.gov.in पर ई-कॉमर्स गैर-वितरण दर्ज करें।', hotline: '1915' },
    ]),
    applicable_laws: JSON.stringify([
      { section: 'Section 66D IT Act 2000', title: 'Cheating by Personation using a Computer Resource', titleHi: 'कंप्यूटर संसाधन द्वारा प्रतिरूपण से धोखाधड़ी', reason: 'A fraudulent online storefront was operated to induce payment for goods that were never dispatched.', reasonHi: 'कभी न भेजे गए सामान के भुगतान हेतु एक फर्जी ऑनलाइन स्टोर संचालित किया गया।' },
      { section: 'Section 318(4) BNS', title: 'Cheating and Dishonestly Inducing Delivery of Property', titleHi: 'धोखाधड़ी और बेईमानी से संपत्ति की डिलीवरी के लिए प्रेरित करना', reason: 'The complainant was dishonestly induced to transfer ₹31,999 against a false promise of delivery.', reasonHi: 'शिकायतकर्ता को डिलीवरी के झूठे वादे पर ₹31,999 ट्रांसफर करने के लिए बेईमानी से प्रेरित किया गया।' },
    ]),
    saved_at: '2026-09-08T05:10:00.000Z',
    language: 'en',
    status: 'SUBMITTED',
    status_history: JSON.stringify([
      { status: 'SUBMITTED', at: '2026-09-08T05:10:00.000Z', note: 'Complaint logged via Samarthan AI intake — UTR pending' },
    ]),
    evidence_images: JSON.stringify([]),
    updates: JSON.stringify([
      {
        id: 'up-7002-a',
        note: 'Transaction reference (UTR) is still to be added. Requested the UPI reference number from HDFC customer care; expected on the registered mobile within 24 hours. The complaint and freeze steps will be updated once it is received.',
        actionPoints: ['Check HDFC SMS / app statement for the 12-digit UTR of the ₹31,999 payment', 'Once found, reply here with the UTR so 1930 and the bank dispute can be actioned'],
        actionPointsHi: ['₹31,999 भुगतान के 12-अंकीय UTR के लिए HDFC SMS / ऐप विवरण जांचें', 'मिलने पर UTR यहाँ भेजें ताकि 1930 और बैंक विवाद पर कार्रवाई हो सके'],
        addedAt: '2026-09-08T05:12:00.000Z',
      },
    ]),
  },

  // ─────────────────────────────────────────────────────────────────────
  // 3. FULLY COMPLETED — every field rich, evidence + updates, FIR filed
  // ─────────────────────────────────────────────────────────────────────
  {
    incident_id: 'INC-2026-7003',
    fraud_type: 'Extortion & Blackmail',
    fraudster_identifier: 'RapidRupee Loan App recovery agents (+91 88213 74655 / recover.rapidrupee@ybl)',
    complainant_name: 'Parichay Prabhu',
    amount: 27000,
    urgency_level: 'CRITICAL',
    summary: 'Complainant installed an instant-loan app called "RapidRupee" that demanded access to contacts and the photo gallery at install. A small loan of ₹6,000 was disbursed and then aggressively "recovered". Agents morphed the complainant\'s photographs, created a defamatory image, and circulated it to family contacts on WhatsApp demanding ₹27,000 to stop. ₹27,000 was paid under threat in three UPI transfers.',
    summary_hi: 'शिकायतकर्ता ने "RapidRupee" नामक एक इंस्टेंट-लोन ऐप इंस्टॉल किया जिसने इंस्टॉल के समय संपर्कों और फोटो गैलरी तक पहुँच माँगी। ₹6,000 का छोटा ऋण दिया गया और फिर आक्रामक रूप से "वसूला" गया। एजेंटों ने शिकायतकर्ता की तस्वीरों को मॉर्फ किया, एक अपमानजनक छवि बनाई और उसे रोकने के लिए ₹27,000 की माँग करते हुए परिवार के संपर्कों को WhatsApp पर भेजा। धमकी के तहत तीन UPI ट्रांसफर में ₹27,000 का भुगतान किया गया।',
    complaint_draft: 'To The Deputy Commissioner of Police / Cyber Crime Cell,\n\nI am filing this complaint regarding online extortion and the non-consensual misuse of my photographs. On 1 September 2026 I installed an instant-loan application named "RapidRupee" which, at installation, took access to my contact list and photo gallery. A loan of ₹6,000 was credited to me.\n\nFrom 3 September 2026 I began receiving abusive calls and WhatsApp messages from +91 88213 74655 demanding immediate repayment of an inflated amount. On 4 September the recovery agents sent me a morphed, defamatory image made from my personal photographs and threatened to circulate it to my family and colleagues. They did send it to at least four of my saved contacts.\n\nUnder this threat I made three UPI payments totalling ₹27,000 to the handle recover.rapidrupee@ybl on 4 and 5 September 2026. Transaction references are UTR 730915482201, UTR 730915482233 and UTR 730915482250.\n\nI request registration of an FIR under Section 66E of the IT Act 2000 and Section 308(2) of the BNS, the immediate takedown of the RapidRupee application, preservation of the app operator\'s KYC and server logs, and directions to the beneficiary bank to freeze and reverse the amount.\n\n[Complainant address / city — to be provided]',
    complaint_draft_hi: 'पुलिस उपायुक्त / साइबर अपराध प्रकोष्ठ,\n\nमैं ऑनलाइन जबरन वसूली और मेरी तस्वीरों के गैर-सहमति दुरुपयोग के संबंध में यह शिकायत दर्ज कर रहा हूँ। 1 सितंबर 2026 को मैंने "RapidRupee" नामक एक इंस्टेंट-लोन ऐप इंस्टॉल किया जिसने इंस्टॉलेशन के समय मेरी संपर्क सूची और फोटो गैलरी तक पहुँच ले ली। मुझे ₹6,000 का ऋण जमा किया गया।\n\n3 सितंबर 2026 से मुझे +91 88213 74655 से अपमानजनक कॉल और WhatsApp संदेश मिलने लगे जिनमें बढ़ी हुई राशि की तत्काल वापसी की माँग की गई। 4 सितंबर को वसूली एजेंटों ने मेरी व्यक्तिगत तस्वीरों से बनी एक मॉर्फ्ड, अपमानजनक छवि भेजी और उसे मेरे परिवार व सहकर्मियों को फैलाने की धमकी दी। उन्होंने इसे मेरे कम से कम चार सहेजे गए संपर्कों को भेजा।\n\nइस धमकी के तहत मैंने 4 और 5 सितंबर 2026 को handle recover.rapidrupee@ybl को तीन UPI भुगतान में कुल ₹27,000 दिए। लेनदेन संदर्भ UTR 730915482201, UTR 730915482233 और UTR 730915482250 हैं।\n\nकृपया IT अधिनियम 2000 की धारा 66E और BNS की धारा 308(2) के तहत FIR दर्ज करें, RapidRupee ऐप को तत्काल हटवाएं, ऐप संचालक के KYC व सर्वर लॉग सुरक्षित रखें, और लाभार्थी बैंक को राशि फ्रीज व वापस करने के निर्देश दें।\n\n[शिकायतकर्ता का पता / शहर — प्रदान किया जाना है]',
    frauder_contact: '+91 88213 74655; UPI: recover.rapidrupee@ybl; UTR: 730915482201, 730915482233, 730915482250',
    bank_name: 'Kotak Mahindra Bank',
    account_number: 'xxxx-xxxx-6640',
    upi_id: 'recover.rapidrupee@ybl',
    timeline: '1 Sep 2026 (install) – 5 Sep 2026 (last payment), IST',
    recommended_channel: 'helpline',
    recommended_channel_target: 'National Cyber Crime Helpline 1930',
    freeze_steps: JSON.stringify([
      { step: 1, action: 'File a formal FIR with the Cyber Police', actionHi: 'साइबर पुलिस में औपचारिक FIR दर्ज करें', detail: 'Extortion with morphed images is treated as a zero-tolerance offence. Call 1930, then attend the cyber station with the chat exports and the three UTRs, and request police protection.', detailHi: 'मॉर्फ्ड छवियों से जबरन वसूली को गंभीर अपराध माना जाता है। 1930 पर कॉल करें, फिर चैट एक्सपोर्ट और तीन UTR के साथ साइबर थाने जाएं और पुलिस सुरक्षा का अनुरोध करें।', hotline: '1930' },
      { step: 2, action: 'Report the images to WhatsApp and Meta', actionHi: 'WhatsApp और Meta को छवियाँ रिपोर्ट करें', detail: 'Use the in-app report option for each account that sent or received the morphed image, and email the Meta Grievance Officer to have the content and accounts removed.', detailHi: 'मॉर्फ्ड छवि भेजने या प्राप्त करने वाले हर खाते के लिए इन-ऐप रिपोर्ट विकल्प का उपयोग करें, और सामग्री व खातों को हटवाने के लिए Meta शिकायत अधिकारी को ईमेल करें।' },
      { step: 3, action: 'Revoke app permissions and preserve evidence', actionHi: 'ऐप अनुमतियाँ रद्द करें और साक्ष्य सुरक्षित रखें', detail: 'Do not delete the app before the police have imaged your phone. Revoke its contacts and storage permissions, take dated screenshots of every threat, and back them up.', detailHi: 'पुलिस द्वारा फोन की इमेजिंग से पहले ऐप न हटाएं। इसकी संपर्क व स्टोरेज अनुमतियाँ रद्द करें, हर धमकी के दिनांकित स्क्रीनशॉट लें और उनका बैकअप रखें।' },
    ]),
    applicable_laws: JSON.stringify([
      { section: 'Section 66E IT Act 2000', title: 'Violation of Privacy', titleHi: 'निजता का उल्लंघन', reason: 'Private photographs of the complainant were captured, altered and transmitted to third parties without consent.', reasonHi: 'शिकायतकर्ता की निजी तस्वीरों को सहमति के बिना लिया, बदला और तीसरे पक्ष को भेजा गया।' },
      { section: 'Section 308(2) BNS', title: 'Extortion by Threat of Injury to Reputation', titleHi: 'प्रतिष्ठा को क्षति की धमकी से जबरन वसूली', reason: 'Payment of ₹27,000 was obtained by threatening to publish defamatory morphed content.', reasonHi: 'अपमानजनक मॉर्फ्ड सामग्री प्रकाशित करने की धमकी देकर ₹27,000 का भुगतान वसूला गया।' },
      { section: 'Section 67 IT Act 2000', title: 'Publishing Obscene Material in Electronic Form', titleHi: 'इलेक्ट्रॉनिक रूप में अश्लील सामग्री प्रकाशित करना', reason: 'The morphed image circulated to the complainant\'s contacts was obscene and defamatory in nature.', reasonHi: 'शिकायतकर्ता के संपर्कों को भेजी गई मॉर्फ्ड छवि प्रकृति में अश्लील और अपमानजनक थी।' },
    ]),
    saved_at: '2026-09-05T04:30:00.000Z',
    language: 'en',
    status: 'FIR_FILED',
    status_history: JSON.stringify([
      { status: 'SUBMITTED', at: '2026-09-05T04:30:00.000Z', note: 'Complaint logged via Samarthan AI intake' },
      { status: 'PLATFORM_REPORTED', at: '2026-09-05T05:10:00.000Z', note: 'Morphed image and 5 accounts reported to WhatsApp / Meta Grievance Desk' },
      { status: 'FIR_FILED', at: '2026-09-06T11:45:00.000Z', note: 'FIR No. 318/2026 registered under Section 66E IT Act & Section 308(2) BNS at Cyber Crime PS' },
    ]),
    evidence_images: JSON.stringify([
      { id: 'ev-7003-1', name: 'whatsapp-threat-thread-4sep.png', dataUrl: '', addedAt: '2026-09-05T04:45:00.000Z' },
      { id: 'ev-7003-2', name: 'rapidrupee-app-permissions.png', dataUrl: '', addedAt: '2026-09-05T04:47:00.000Z' },
      { id: 'ev-7003-3', name: 'upi-payment-history-27000.png', dataUrl: '', addedAt: '2026-09-05T04:50:00.000Z' },
    ]),
    updates: JSON.stringify([
      {
        id: 'up-7003-a',
        note: 'Added all three UPI transaction references (UTR 730915482201, 730915482233, 730915482250) totalling ₹27,000 and attached the payment-history screenshot.',
        actionPoints: ['Carry printed copies of the three UTR SMS alerts to the cyber station'],
        actionPointsHi: ['तीन UTR SMS अलर्ट की मुद्रित प्रतियाँ साइबर थाने ले जाएं'],
        addedAt: '2026-09-05T05:05:00.000Z',
      },
      {
        id: 'up-7003-b',
        note: 'WhatsApp confirmed the reported accounts were banned and the offending media was removed from its servers. Reference META/GRV/2026/44119.',
        actionPoints: ['Save the Meta acknowledgement email for the case file'],
        actionPointsHi: ['केस फ़ाइल के लिए Meta पावती ईमेल सहेजें'],
        addedAt: '2026-09-05T18:20:00.000Z',
      },
      {
        id: 'up-7003-c',
        note: 'FIR No. 318/2026 registered. Investigating Officer: SI R. Nair, Cyber Crime PS. Bank freeze request for the beneficiary Kotak account issued the same day.',
        actionPoints: ['Collect the FIR copy from the station', 'Submit a bank dispute letter to Kotak quoting FIR 318/2026'],
        actionPointsHi: ['थाने से FIR की प्रति लें', 'FIR 318/2026 का हवाला देते हुए Kotak को बैंक विवाद पत्र जमा करें'],
        addedAt: '2026-09-06T12:00:00.000Z',
      },
    ]),
  },
]

async function resetAndSeed() {
  console.log('🗑️  Deleting all existing complaints from Neon database...')
  await sql`DELETE FROM complaints;`
  console.log('✅ All old complaints deleted.')

  console.log(`🌱 Seeding ${testComplaints.length} high-quality complaints...`)

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
    console.log(`  ✓ ${c.incident_id}  ${c.fraud_type}  ₹${c.amount}  [${c.status}]`)
  }

  const check = await sql`SELECT count(*) FROM complaints;`
  console.log(`\n🎉 Done. Complaint count in Neon DB: ${check[0].count}`)
}

resetAndSeed().catch((err) => {
  console.error('❌ Reset & Seed failed:', err)
  process.exit(1)
})
