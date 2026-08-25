export type FraudType =
  | 'Financial Fraud'
  | 'Women/Children Related Crime'
  | 'Extortion & Blackmail'
  | 'Identity Theft'
  | 'E-Commerce Scams'
  | 'Hate Speech'
  | 'Online Ragging'
  | 'Other Cyber Crime'
  | 'UPI Fraud'
  | 'OTP Fraud'
  | 'Fake Customer Care'
  | 'Investment Scam'
  | 'Job Scam'
  | 'Other'

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export type InputType = 'voice' | 'screenshot' | 'text'

export const COMPLAINT_STATUSES = [
  'SUBMITTED',
  'BANK_NOTIFIED',
  'FIR_FILED',
  'UNDER_INVESTIGATION',
  'RESOLVED',
] as const

export type ComplaintStatus = typeof COMPLAINT_STATUSES[number]

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, { en: string; hi: string; simulated: boolean }> = {
  SUBMITTED: { en: 'Report Submitted', hi: 'रिपोर्ट दर्ज', simulated: false },
  BANK_NOTIFIED: { en: 'Bank Nodal Notified', hi: 'बैंक नोडल अधिकारी को सूचित', simulated: true },
  FIR_FILED: { en: 'FIR Filed (NCRP)', hi: 'FIR दर्ज (NCRP)', simulated: true },
  UNDER_INVESTIGATION: { en: 'Under Investigation', hi: 'जांच जारी', simulated: true },
  RESOLVED: { en: 'Resolved', hi: 'समाधान हुआ', simulated: true },
}

export interface ComplaintStatusEvent {
  status: ComplaintStatus
  at: string
}

export interface FreezeStep {
  step: number
  action: string
  actionHi: string
  detail: string
  detailHi: string
  hotline?: string
  url?: string
}

export interface TriageResult {
  incidentId: string
  victimName: string
  fraudType: FraudType
  frauderContact: string
  amount: number
  bankName: string
  accountNumber: string
  upiId?: string
  timeline: string
  complaintDraft: string
  complaintDraftHi: string
  freezeSteps: FreezeStep[]
  urgencyLevel: UrgencyLevel
  summary: string
  summaryHi: string
}

export interface Scenario {
  id: string
  title: string
  titleHi: string
  description: string
  descriptionHi: string
  fraudType: FraudType
  language: 'English' | 'Hindi' | 'Hinglish'
  inputType: InputType
  rawInput: string
  mockResponse: TriageResult
}

const generateId = () =>
  `MH-${new Date().getFullYear()}-` +
  Math.floor(10000000 + Math.random() * 90000000).toString()

export const SCENARIOS: Scenario[] = [
  {
    id: 'upi-scam',
    title: 'UPI Payment Scam',
    titleHi: 'UPI भुगतान घोटाला',
    description:
      'Victim received a QR code on WhatsApp promising ₹15,000 cashback from a fake SBI offer.',
    descriptionHi:
      'पीड़ित को WhatsApp पर एक QR कोड मिला जिसमें नकली SBI ऑफर पर ₹15,000 कैशबैक का वादा था।',
    fraudType: 'UPI Fraud',
    language: 'Hinglish',
    inputType: 'text',
    rawInput:
      'Bhai mujhe kal ek WhatsApp message aaya. Usne bola SBI cashback offer hai, ₹15,000 milenge. Unhone ek QR code bheja. Maine scan kiya toh mere account se ₹15,000 kat gaye. Fraudster ka number 9876543210 tha. Mera SBI account hai, last 4 digits 7823.',
    mockResponse: {
      incidentId: generateId(),
      victimName: 'Rajesh Kumar (Synthetic)',
      fraudType: 'UPI Fraud',
      frauderContact: '+91-9876543210',
      amount: 15000,
      bankName: 'State Bank of India',
      accountNumber: 'XXXX-XXXX-7823',
      upiId: 'rajesh.kumar@sbi',
      timeline: '23 Aug 2024, approx. 14:30 IST',
      summary:
        'Victim was deceived via WhatsApp with a fake SBI cashback QR code. ₹15,000 debited from victim\'s SBI account. Fraudster\'s mobile number identified.',
      summaryHi:
        'पीड़ित को WhatsApp पर नकली SBI कैशबैक QR कोड से ठगा गया। पीड़ित के SBI खाते से ₹15,000 डेबिट हुए। धोखेबाज का मोबाइल नंबर पहचाना गया।',
      complaintDraft: `To,
The Station House Officer,
Cyber Crime Cell

Subject: Complaint regarding UPI Fraud / Online Financial Fraud

Respected Sir/Madam,

I, Rajesh Kumar (Synthetic), resident of [Address], wish to lodge a formal complaint against an online fraud perpetrated against me on 23rd August 2024.

I received a WhatsApp message from mobile number +91-9876543210 claiming to represent State Bank of India and offering a cashback of ₹15,000. The fraudster sent a QR code which I scanned in good faith. Subsequently, ₹15,000 was immediately debited from my SBI account (XXXX-XXXX-7823) without my consent.

I request you to:
1. Register an FIR under Section 66C and 66D of the IT Act.
2. Initiate a bank freeze request with SBI on the fraudster's account.
3. Trace the origin of mobile number +91-9876543210.

I am attaching all relevant transaction details and WhatsApp screenshots for your reference.

Yours faithfully,
Rajesh Kumar (Synthetic)
Date: 23/08/2024`,
      complaintDraftHi: `सेवा में,
थाना प्रभारी,
साइबर क्राइम सेल

विषय: UPI धोखाधड़ी / ऑनलाइन वित्तीय धोखाधड़ी की शिकायत

मान्यवर,

मैं राजेश कुमार (सिंथेटिक), निवासी [पता], दिनांक 23 अगस्त 2024 को मेरे साथ हुई ऑनलाइन धोखाधड़ी के संबंध में औपचारिक शिकायत दर्ज करना चाहता हूँ।

मुझे मोबाइल नंबर +91-9876543210 से WhatsApp संदेश प्राप्त हुआ जिसमें SBI की ओर से ₹15,000 कैशबैक का झांसा दिया गया। धोखेबाज ने QR कोड भेजा जिसे स्कैन करने पर मेरे SBI खाते (XXXX-XXXX-7823) से ₹15,000 तुरंत डेबिट हो गए।

आपसे अनुरोध है कि IT अधिनियम की धारा 66C और 66D के तहत FIR दर्ज करें।

आपका,
राजेश कुमार (सिंथेटिक)
दिनांक: 23/08/2024`,
      freezeSteps: [
        {
          step: 1,
          action: 'Call Cybercrime Helpline 1930',
          actionHi: 'साइबर क्राइम हेल्पलाइन 1930 पर कॉल करें',
          detail:
            'Call 1930 immediately. Report the fraud and request them to initiate a chargeback hold on the fraudster\'s receiving account.',
          detailHi:
            'तुरंत 1930 पर कॉल करें। धोखाधड़ी की रिपोर्ट करें और धोखेबाज के खाते पर चार्जबैक होल्ड शुरू करने का अनुरोध करें।',
          hotline: '1930',
        },
        {
          step: 2,
          action: 'Block / Freeze your SBI account',
          actionHi: 'अपना SBI खाता ब्लॉक / फ्रीज करें',
          detail:
            'Call SBI toll-free 1800-11-2211 or visit nearest branch. Request an immediate freeze on outgoing transactions.',
          detailHi:
            'SBI टोल-फ्री 1800-11-2211 पर कॉल करें या निकटतम शाखा में जाएं। आउटगोइंग लेनदेन पर तुरंत फ्रीज का अनुरोध करें।',
          hotline: '1800-11-2211',
          url: 'https://www.onlinesbi.sbi/',
        },
        {
          step: 3,
          action: 'File complaint on cybercrime.gov.in',
          actionHi: 'cybercrime.gov.in पर शिकायत दर्ज करें',
          detail:
            'Visit the National Cyber Crime Reporting Portal and file under "Financial Fraud". Use the AI-generated complaint draft below.',
          detailHi:
            'राष्ट्रीय साइबर क्राइम रिपोर्टिंग पोर्टल पर जाएं और "Financial Fraud" के तहत शिकायत दर्ज करें।',
          url: 'https://cybercrime.gov.in',
        },
        {
          step: 4,
          action: 'Block the fraudster\'s WhatsApp number',
          actionHi: 'धोखेबाज का WhatsApp नंबर ब्लॉक करें',
          detail:
            'Block +91-9876543210 on WhatsApp and report the number to TRAI via DND app or SMS "BLOCK 9876543210" to 1909.',
          detailHi:
            'WhatsApp पर +91-9876543210 को ब्लॉक करें और TRAI DND ऐप के माध्यम से नंबर रिपोर्ट करें।',
          hotline: '1909',
        },
        {
          step: 5,
          action: 'Preserve all evidence',
          actionHi: 'सभी सबूत सुरक्षित रखें',
          detail:
            'Screenshot all WhatsApp messages, the QR code, and the bank transaction SMS. Do NOT delete them.',
          detailHi:
            'सभी WhatsApp संदेशों, QR कोड और बैंक लेनदेन SMS का स्क्रीनशॉट लें। उन्हें डिलीट न करें।',
        },
      ],
      urgencyLevel: 'CRITICAL',
    },
  },
  {
    id: 'otp-fraud',
    title: 'OTP / Bank Fraud',
    titleHi: 'OTP / बैंक धोखाधड़ी',
    description:
      'Caller impersonated HDFC bank, asked for OTP under pretext of KYC update. ₹42,000 withdrawn.',
    descriptionHi:
      'कॉलर ने HDFC बैंक का प्रतिरूप धारण किया, KYC अपडेट के बहाने OTP मांगा। ₹42,000 निकाले गए।',
    fraudType: 'OTP Fraud',
    language: 'English',
    inputType: 'text',
    rawInput:
      'Yesterday I got a call from someone saying they are from HDFC bank. They said my KYC is expiring and I will lose access to my account. They asked me to share the OTP I received to verify my identity. I trusted them and shared the OTP. Within minutes ₹42,000 was debited from my account. The caller ID showed 022-61606161. My HDFC account number ends in 9012.',
    mockResponse: {
      incidentId: generateId(),
      victimName: 'Priya Sharma (Synthetic)',
      fraudType: 'OTP Fraud',
      frauderContact: '022-61606161 (Spoofed)',
      amount: 42000,
      bankName: 'HDFC Bank',
      accountNumber: 'XXXX-XXXX-9012',
      timeline: '22 Aug 2024, approx. 11:00 IST',
      summary:
        'Victim received a vishing call from a number spoofing HDFC Bank. Fraudster obtained OTP under KYC pretext. ₹42,000 debited from victim\'s HDFC account.',
      summaryHi:
        'पीड़ित को HDFC बैंक का रूप धरे नंबर से विशिंग कॉल आई। धोखेबाज ने KYC के बहाने OTP प्राप्त किया। पीड़ित के HDFC खाते से ₹42,000 डेबिट हुए।',
      complaintDraft: `To,
The Station House Officer,
Cyber Crime Cell

Subject: Complaint regarding OTP Fraud / Vishing Attack

Respected Sir/Madam,

I, Priya Sharma (Synthetic), wish to report a telephonic fraud (vishing) committed against me on 22nd August 2024.

I received a call from 022-61606161 (spoofed HDFC number). The caller claimed to be an HDFC Bank representative and stated my KYC was expiring. Under this pretence, they obtained the OTP sent to my registered mobile. Immediately after sharing the OTP, ₹42,000 was debited from my HDFC account (XXXX-XXXX-9012).

Request:
1. Register FIR under IT Act Section 66C, 66D and IPC Section 420.
2. Initiate freeze on beneficiary account.
3. Obtain call records for 022-61606161.

Yours faithfully,
Priya Sharma (Synthetic)
Date: 22/08/2024`,
      complaintDraftHi: `सेवा में,
थाना प्रभारी,
साइबर क्राइम सेल

विषय: OTP धोखाधड़ी / विशिंग अटैक की शिकायत

मान्यवर,

मैं प्रिया शर्मा (सिंथेटिक), दिनांक 22 अगस्त 2024 को मेरे साथ हुई फोन धोखाधड़ी की रिपोर्ट करना चाहती हूँ।

मुझे 022-61606161 से कॉल आई। कॉलर ने HDFC बैंक प्रतिनिधि होने का नाटक किया और कहा कि मेरी KYC समाप्त हो रही है। इस बहाने उन्होंने OTP प्राप्त किया और तुरंत मेरे HDFC खाते (XXXX-XXXX-9012) से ₹42,000 निकाल लिए।

आपसे अनुरोध है कि IT अधिनियम की धारा 66C, 66D और IPC धारा 420 के तहत FIR दर्ज करें।

आपका,
प्रिया शर्मा (सिंथेटिक)
दिनांक: 22/08/2024`,
      freezeSteps: [
        {
          step: 1,
          action: 'Call Cybercrime Helpline 1930',
          actionHi: 'साइबर क्राइम हेल्पलाइन 1930 पर कॉल करें',
          detail:
            'Call 1930 within the golden hour. Provide the transaction reference number for fastest freeze initiation.',
          detailHi:
            'गोल्डन आवर के भीतर 1930 पर कॉल करें। सबसे तेज फ्रीज के लिए लेनदेन संदर्भ संख्या दें।',
          hotline: '1930',
        },
        {
          step: 2,
          action: 'Call HDFC Bank — Block all transactions',
          actionHi: 'HDFC बैंक को कॉल करें — सभी लेनदेन ब्लॉक करें',
          detail:
            'Call HDFC 24×7 helpline 1800-202-6161 to temporarily block your debit card and internet banking.',
          detailHi:
            'HDFC 24×7 हेल्पलाइन 1800-202-6161 पर कॉल करके अपना डेबिट कार्ड और इंटरनेट बैंकिंग अस्थायी रूप से ब्लॉक करें।',
          hotline: '1800-202-6161',
          url: 'https://www.hdfcbank.com/',
        },
        {
          step: 3,
          action: 'Change all passwords & mPIN immediately',
          actionHi: 'तुरंत सभी पासवर्ड और mPIN बदलें',
          detail:
            'Change your HDFC NetBanking password, MobileBanking mPIN, and UPI PIN right now from a secure device.',
          detailHi:
            'अभी एक सुरक्षित डिवाइस से अपना HDFC NetBanking पासवर्ड, MobileBanking mPIN और UPI PIN बदलें।',
        },
        {
          step: 4,
          action: 'File complaint on cybercrime.gov.in',
          actionHi: 'cybercrime.gov.in पर शिकायत दर्ज करें',
          detail:
            'Use the AI-generated complaint draft below to file on the National Cyber Crime Reporting Portal.',
          detailHi:
            'राष्ट्रीय साइबर क्राइम रिपोर्टिंग पोर्टल पर नीचे दिए गए AI-जनरेटेड ड्राफ्ट से शिकायत दर्ज करें।',
          url: 'https://cybercrime.gov.in',
        },
      ],
      urgencyLevel: 'CRITICAL',
    },
  },
  {
    id: 'investment-scam',
    title: 'Fake Investment / Stock Tip',
    titleHi: 'नकली निवेश / स्टॉक टिप',
    description:
      'Victim joined a WhatsApp group promising 300% returns on stocks. Invested ₹1.2L, withdrew nothing.',
    descriptionHi:
      'पीड़ित एक WhatsApp ग्रुप में शामिल हुआ जो शेयरों पर 300% रिटर्न का वादा कर रहा था। ₹1.2 लाख निवेश किया, कुछ नहीं निकाला।',
    fraudType: 'Investment Scam',
    language: 'English',
    inputType: 'text',
    rawInput:
      'Three weeks ago I was added to a WhatsApp group called "Rakesh Jhunjhunwala Tips Official". They showed fake profit screenshots and asked me to invest on their app called StockPro. I transferred ₹1,20,000 in three transactions to account number 8876543210 IFSC HDFC0001234. When I tried to withdraw my so-called profits of ₹3,80,000 they asked for a 20% tax payment first. I realized it was a scam.',
    mockResponse: {
      incidentId: generateId(),
      victimName: 'Amit Verma (Synthetic)',
      fraudType: 'Investment Scam',
      frauderContact: 'WhatsApp Group: "Rakesh Jhunjhunwala Tips Official"',
      amount: 120000,
      bankName: 'HDFC Bank',
      accountNumber: '8876543210 (IFSC: HDFC0001234)',
      timeline: '1–22 Aug 2024 (multiple transactions)',
      summary:
        'Victim was lured into a fake investment WhatsApp group using a celebrity\'s name. Transferred ₹1.2L in three transactions. Classic "pig butchering" / advance-fee scam pattern detected.',
      summaryHi:
        'पीड़ित को एक मशहूर हस्ती के नाम का उपयोग करके नकली निवेश WhatsApp ग्रुप में फंसाया गया। तीन लेनदेन में ₹1.2 लाख ट्रांसफर किया। "पिग बुचरिंग" / अग्रिम-शुल्क घोटाले का क्लासिक पैटर्न पहचाना गया।',
      complaintDraft: `To,
The Station House Officer,
Cyber Crime Cell

Subject: Complaint regarding Online Investment Fraud / Pig Butchering Scam

Respected Sir/Madam,

I, Amit Verma (Synthetic), wish to report an online investment fraud perpetrated against me between 1st August and 22nd August 2024.

I was added to a WhatsApp group called "Rakesh Jhunjhunwala Tips Official" which falsely used the identity of a well-known investor. The group lured me into investing on a fraudulent app "StockPro". I transferred ₹1,20,000 in three transactions to account number 8876543210 (IFSC: HDFC0001234). When I attempted to withdraw, I was asked to pay a "20% tax" before withdrawal — a classic advance-fee fraud pattern — which made me realize the scam.

I request:
1. Immediate freeze on account 8876543210 (HDFC0001234).
2. FIR under IT Act 66D and IPC 420, 406.
3. SEBI to be notified for fraudulent investment advice.

Yours faithfully,
Amit Verma (Synthetic)
Date: 22/08/2024`,
      complaintDraftHi: `सेवा में,
थाना प्रभारी,
साइबर क्राइम सेल

विषय: ऑनलाइन निवेश धोखाधड़ी की शिकायत

मान्यवर,

मैं अमित वर्मा (सिंथेटिक), 1 अगस्त से 22 अगस्त 2024 के बीच मेरे साथ हुई ऑनलाइन निवेश धोखाधड़ी की रिपोर्ट करना चाहता हूँ।

मुझे "Rakesh Jhunjhunwala Tips Official" नामक WhatsApp ग्रुप में जोड़ा गया। मुझे "StockPro" ऐप पर ₹1,20,000 निवेश करने के लिए धोखे से प्रेरित किया गया। निकासी के प्रयास पर "20% टैक्स" मांगे जाने पर धोखाधड़ी का एहसास हुआ।

अनुरोध: खाता 8876543210 पर तुरंत फ्रीज लगाएं।

आपका,
अमित वर्मा (सिंथेटिक)
दिनांक: 22/08/2024`,
      freezeSteps: [
        {
          step: 1,
          action: 'Call Cybercrime Helpline 1930',
          actionHi: 'साइबर क्राइम हेल्पलाइन 1930 पर कॉल करें',
          detail:
            'Report all three transaction IDs. Request freeze on the beneficiary HDFC account 8876543210.',
          detailHi:
            'तीनों लेनदेन ID रिपोर्ट करें। लाभार्थी HDFC खाते 8876543210 पर फ्रीज का अनुरोध करें।',
          hotline: '1930',
        },
        {
          step: 2,
          action: 'File complaint on cybercrime.gov.in',
          actionHi: 'cybercrime.gov.in पर शिकायत दर्ज करें',
          detail:
            'Choose "Financial Fraud → Investment / Job Fraud" category on the portal.',
          detailHi:
            'पोर्टल पर "Financial Fraud → Investment / Job Fraud" श्रेणी चुनें।',
          url: 'https://cybercrime.gov.in',
        },
        {
          step: 3,
          action: 'Report to SEBI SCORES Portal',
          actionHi: 'SEBI SCORES पोर्टल पर रिपोर्ट करें',
          detail:
            'File a complaint on SEBI SCORES at scores.sebi.gov.in for fraudulent unregistered investment advice.',
          detailHi:
            'नकली निवेश सलाह के लिए SEBI SCORES पोर्टल scores.sebi.gov.in पर शिकायत दर्ज करें।',
          url: 'https://scores.sebi.gov.in',
        },
        {
          step: 4,
          action: 'Preserve all chat screenshots & transfer receipts',
          actionHi: 'सभी चैट स्क्रीनशॉट और ट्रांसफर रसीदें सुरक्षित रखें',
          detail:
            'Export the WhatsApp chat (without media first, then with media). Save all bank transfer screenshots.',
          detailHi:
            'WhatsApp चैट एक्सपोर्ट करें। सभी बैंक ट्रांसफर स्क्रीनशॉट सेव करें।',
        },
      ],
      urgencyLevel: 'HIGH',
    },
  },
]
