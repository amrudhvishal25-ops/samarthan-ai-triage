'use client'

import { AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Circle } from 'lucide-react'
import { TriageResult } from '@/data/scenarios'
import { SupportedLanguage } from '@/lib/i18n/languages'

export interface CompulsoryField {
  key: string
  label: string
  labelHi: string
  isFilled: boolean
  value?: string
  importance: string
  importanceHi: string
}

export function getCompulsoryFields(r: TriageResult): CompulsoryField[] {
  const isFinancial = /financial|upi|otp|banking|investment|e-commerce|scam/i.test(r.fraudType)

  // 1. UTR / Txn Reference
  const hasUtr = Boolean(
    r.frauderContact &&
    !r.frauderContact.toLowerCase().includes('not provided') &&
    /(?:utr|ref|txn|transaction|imps|neft|[0-9]{12})/i.test(r.frauderContact)
  )

  // 2. Bank Name
  const hasBank = Boolean(
    r.bankName &&
    !r.bankName.toLowerCase().includes('not provided') &&
    !r.bankName.toLowerCase().includes('pending') &&
    !r.bankName.toLowerCase().includes('bank nodal desk')
  )

  // 3. Fraudster / Beneficiary Handle
  const hasFraudster = Boolean(
    (r.upiId && !r.upiId.toLowerCase().includes('not provided')) ||
    (r.fraudsterIdentifier &&
      !r.fraudsterIdentifier.toLowerCase().includes('not identified') &&
      !r.fraudsterIdentifier.toLowerCase().includes('fraudulent entity') &&
      !r.fraudsterIdentifier.toLowerCase().includes('unknown'))
  )

  // 4. Complainant Name (personal name, logged-in identity, or standard complainant designation)
  const hasComplainant = Boolean(
    r.complainantName &&
    !r.complainantName.toLowerCase().includes('not provided') &&
    !r.complainantName.toLowerCase().includes('unknown') &&
    r.complainantName.trim().length > 0
  )

  // 5. Amount
  const hasAmount = Boolean(r.amount && r.amount > 0)

  const list: CompulsoryField[] = []

  if (isFinancial) {
    list.push({
      key: 'utr',
      label: '12-Digit Transaction UTR Number',
      labelHi: '12-अंकों का UPI UTR / लेनदेन संदर्भ संख्या',
      isFilled: hasUtr,
      value: hasUtr ? r.frauderContact : undefined,
      importance: 'Mandatory for bank & NPCI golden-hour fund freeze',
      importanceHi: 'बैंक और NPCI द्वारा फंड फ्रीज करने के लिए अनिवार्य',
    })

    list.push({
      key: 'bankName',
      label: 'Debited Bank Name',
      labelHi: 'बैंक का नाम (जिससे पैसे कटे)',
      isFilled: hasBank,
      value: hasBank ? r.bankName : undefined,
      importance: 'Required to notify source Bank Nodal Officer',
      importanceHi: 'बैंक नोडल अधिकारी को तत्काल सूचित करने के लिए आवश्यक',
    })
  }

  list.push({
    key: 'fraudster',
    label: 'Fraudster / Beneficiary Identifier',
    labelHi: 'धोखेबाज़ का UPI ID / खाता / मोबाइल नंबर',
    isFilled: hasFraudster,
    value: hasFraudster ? (r.upiId || r.fraudsterIdentifier) : undefined,
    importance: 'Needed to block beneficiary account & register FIR',
    importanceHi: 'लाभार्थी खाते को ब्लॉक करने और प्राथमिकी दर्ज करने के लिए आवश्यक',
  })

  list.push({
    key: 'complainant',
    label: 'Complainant Full Name',
    labelHi: 'शिकायतकर्ता का पूरा नाम',
    isFilled: hasComplainant,
    value: hasComplainant ? r.complainantName : undefined,
    importance: 'Required for legal FIR and police statement',
    importanceHi: 'कानूनी FIR और पुलिस बयान के लिए आवश्यक',
  })

  if (isFinancial) {
    list.push({
      key: 'amount',
      label: 'Disputed Fraud Amount',
      labelHi: 'धोखाधड़ी की राशि (₹)',
      isFilled: hasAmount,
      value: hasAmount ? `₹${r.amount.toLocaleString('en-IN')}` : undefined,
      importance: 'Specifies exact claim amount for recovery',
      importanceHi: 'वसूली के लिए दावा की गई सटीक राशि',
    })
  }

  return list
}

const REMINDER_I18N: Record<SupportedLanguage, {
  completeBadge: string
  completeText: string
  requiredBadge: string
  completed: string
  actionRequired: string
  autoFillBtn: string
  done: string
  pending: string
  aiHint: string
}> = {
  en: {
    completeBadge: '100% Complete',
    completeText: 'Your complaint is fully complete for emergency fund freezing and police FIR registration.',
    requiredBadge: 'Required',
    completed: 'completed',
    actionRequired: 'Action required — details needed to freeze funds & file FIR',
    autoFillBtn: 'Auto-fill via Updates',
    done: 'Done',
    pending: 'Pending',
    aiHint: 'Skip manual entry — type details naturally in Updates below (e.g. "UTR is 482910394821, bank is SBI") and AI auto-fills for you.',
  },
  hi: {
    completeBadge: '100% पूर्ण',
    completeText: 'आपकी शिकायत बैंक फ्रीज और पुलिस FIR के लिए पूरी तरह तैयार है!',
    requiredBadge: 'अनिवार्य',
    completed: 'पूर्ण',
    actionRequired: 'कार्रवाई आवश्यक: फंड फ्रीज और FIR के लिए ये विवरण ज़रूरी हैं',
    autoFillBtn: 'ऑटो-फिल करें',
    done: 'पूर्ण',
    pending: 'बाकी',
    aiHint: 'आसान तरीका: नीचे "नई जानकारी जोड़ें" में बस लिखें (जैसे: "मेरा UTR 482910394821 है, बैंक SBI") — AI अपने-आप भर देगा!',
  },
  bn: {
    completeBadge: '১০০% সম্পন্ন',
    completeText: 'আপনার অভিযোগটি ফান্ড ফ্রিজ এবং পুলিশ এফআইআর-এর জন্য সম্পূর্ণরূপে প্রস্তুত!',
    requiredBadge: 'বাধ্যতামূলক',
    completed: 'সম্পন্ন',
    actionRequired: 'পদক্ষেপ প্রয়োজন — ফান্ড ফ্রিজ ও এফআইআর-এর জন্য এই বিবরণ প্রয়োজন',
    autoFillBtn: 'অটো-ফিল করুন',
    done: 'সম্পন্ন',
    pending: 'বাকি',
    aiHint: 'সহজ উপায়: নিচে আপডেটে সাধারণ ভাষায় লিখুন (যেমন: "আমার UTR 482910394821, ব্যাংক SBI") — AI স্বয়ংক্রিয়ভাবে পূরণ করবে!',
  },
  mr: {
    completeBadge: '१००% पूर्ण',
    completeText: 'तुमची तक्रार निधी गोठवण्यासाठी आणि पोलीस एफआयआरसाठी पूर्णपणे तयार आहे!',
    requiredBadge: 'आवश्यक',
    completed: 'पूर्ण',
    actionRequired: 'कारवाई आवश्यक — फंड फ्रीज आणि एफआयआरसाठी हे तपशील आवश्यक आहेत',
    autoFillBtn: 'ऑटो-फिल करा',
    done: 'पूर्ण',
    pending: 'बाकी',
    aiHint: 'सोपा मार्ग: खाली अपडेट्समध्ये सामान्य भाषेत लिहा (उदा. "माझा UTR 482910394821 आहे, बँक SBI") — AI आपोआप भरेल!',
  },
  te: {
    completeBadge: '100% పూర్తయింది',
    completeText: 'మీ ఫిర్యాదు నిధుల ఫ్రీజింగ్ మరియు పోలీస్ ఎఫ్ఐఆర్ నమోదుకు పూర్తిగా సిద్ధంగా ఉంది!',
    requiredBadge: 'తప్పనిసరి',
    completed: 'పూర్తయింది',
    actionRequired: 'చర్య అవసరం — నిధులు ఫ్రీజ్ చేయడానికి మరియు ఎఫ్ఐఆర్ కోసం ఈ వివరాలు కావాలి',
    autoFillBtn: 'ఆటో-ఫిల్ చేయండి',
    done: 'పూర్తి',
    pending: 'బాకీ',
    aiHint: 'సులభమైన మార్గం: క్రింద అప్‌డేట్స్‌లో సహజంగా టైప్ చేయండి (ఉదా: "నా UTR 482910394821, బ్యాంక్ SBI") — AI దానంతటదే నింపుతుంది!',
  },
  ta: {
    completeBadge: '100% முடிந்தது',
    completeText: 'உங்கள் புகார் நிதி முடக்கம் மற்றும் காவல் துறை எஃப்ஐஆர் பதிவிற்கு முற்றிலும் தயாராக உள்ளது!',
    requiredBadge: 'கட்டாயம்',
    completed: 'முடிந்தது',
    actionRequired: 'நடவடிக்கை தேவை — நிதி முடக்கம் மற்றும் எஃப்ஐஆருக்கு இந்த விவரங்கள் தேவை',
    autoFillBtn: 'தானாக நிரப்பவும்',
    done: 'முடிந்தது',
    pending: 'நிலுவை',
    aiHint: 'எளிதான வழி: கீழே உள்ள புதுப்பிப்புகளில் விவரங்களை தட்டச்சு செய்யவும் (எ.கா: "என் UTR 482910394821, வங்கி SBI") — AI தானாக நிரப்பும்!',
  },
  gu: {
    completeBadge: '100% પૂર્ણ',
    completeText: 'તમારી ફરિયાદ ફંડ ફ્રીઝ અને પોલીસ એફઆઈઆર માટે સંપૂર્ણપણે તૈયાર છે!',
    requiredBadge: 'ફરજિયાત',
    completed: 'પૂર્ણ',
    actionRequired: 'પગલાં જરૂરી — ફંડ ફ્રીઝ અને એફઆઈઆર માટે આ વિગતો જરૂરી છે',
    autoFillBtn: 'ઓટો-ફિલ કરો',
    done: 'પૂર્ણ',
    pending: 'બાકી',
    aiHint: 'સરળ રીત: નીચે અપડેટ્સમાં સામાન્ય રીતે લખો (દા.ત. "મારો UTR 482910394821 છે, બેંક SBI") — AI આપમેળે ભરી દેશે!',
  },
  ur: {
    completeBadge: '100% مکمل',
    completeText: 'آپ کی شکایت فنڈز منجمد کرنے اور پولیس ایف آئی آر کے لیے مکمل طور پر تیار ہے!',
    requiredBadge: 'لازمی',
    completed: 'مکمل',
    actionRequired: 'کارروائی درکار ہے — رقم منجمد کرنے اور ایف آئی آر کے لیے یہ تفصیلات ضروری ہیں',
    autoFillBtn: 'خودکار اندراج کریں',
    done: 'مکمل',
    pending: 'باقی',
    aiHint: 'آسان طریقہ: نیچے اپڈیٹس میں قدرتی انداز میں لکھیں (مثلاً "میرا UTR 482910394821 ہے، بینک SBI") — AI خودکار طور پر بھر دے گا!',
  },
  kn: {
    completeBadge: '100% ಪೂರ್ಣಗೊಂಡಿದೆ',
    completeText: 'ನಿಮ್ಮ ದೂರು ಹಣ ಸ್ಥಗಿತಗೊಳಿಸಲು ಮತ್ತು ಪೊಲೀಸ್ ಎಫ್‌ಐಆರ್‌ಗೆ ಸಂಪೂರ್ಣವಾಗಿ ಸಿದ್ಧವಾಗಿದೆ!',
    requiredBadge: 'ಕಡ್ಡಾಯ',
    completed: 'ಪೂರ್ಣ',
    actionRequired: 'ಕ್ರಮ ಅಗತ್ಯ — ಹಣ ಸ್ಥಗಿತಗೊಳಿಸಲು ಮತ್ತು ಎಫ್‌ಐಆರ್‌ಗೆ ಈ ವಿವರಗಳು ಬೇಕಾಗುತ್ತವೆ',
    autoFillBtn: 'ಆಟೋ-ಫಿಲ್ ಮಾಡಿ',
    done: 'ಪೂರ್ಣ',
    pending: 'ಬಾಕಿ',
    aiHint: 'ಸುಲಭ ವಿಧಾನ: ಕೆಳಗಿನ ಅಪ್‌ಡೇಟ್ಸ್‌ನಲ್ಲಿ ಸಹಜವಾಗಿ ಬರೆಯಿರಿ (ಉದಾ: "ನನ್ನ UTR 482910394821, ಬ್ಯಾಂಕ್ SBI") — AI ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಭರ್ತಿ ಮಾಡುತ್ತದೆ!',
  },
  or: {
    completeBadge: '୧୦୦% ସମ୍ପୂର୍ଣ୍ଣ',
    completeText: 'ଆପଣଙ୍କ ଅଭିଯୋଗ ଟଙ୍କା ଫ୍ରିଜ୍ ଏବଂ ପୋଲିସ FIR ପାଇଁ ସମ୍ପୂର୍ଣ୍ଣ ପ୍ରସ୍ତୁତ!',
    requiredBadge: 'ବାଧ୍ୟତାମୂଳକ',
    completed: 'ସମ୍ପୂର୍ଣ୍ଣ',
    actionRequired: 'ପଦକ୍ଷେପ ଆବଶ୍ୟକ — ଫଣ୍ଡ ଫ୍ରିଜ୍ ଏବଂ FIR ପାଇଁ ଏହି ବିବରଣୀ ଆବଶ୍ୟକ',
    autoFillBtn: 'ଅଟୋ-ଫିଲ୍ କରନ୍ତୁ',
    done: 'ସମ୍ପୂର୍ଣ୍ଣ',
    pending: 'ବାକି',
    aiHint: 'ସହଜ ଉପାୟ: ତଳେ ଅପଡେଟ୍‌ସରେ ସାଧାରଣ ଭାବେ ଲେଖନ୍ତୁ (ଯେପରି: "ମୋର UTR 482910394821, ବ୍ୟାଙ୍କ SBI") — AI ନିଜେ ଭରିଦେବ!',
  },
  ml: {
    completeBadge: '100% പൂർത്തിയായി',
    completeText: 'നിങ്ങളുടെ പരാതി പണം മരവിപ്പിക്കുന്നതിനും പോലീസ് എഫ്ഐആറിനും പൂർണ്ണമായും തയ്യാറാണ്!',
    requiredBadge: 'നിർബന്ധം',
    completed: 'പൂർത്തിയായി',
    actionRequired: 'നടപടി ആവശ്യമാണ് — ഫണ്ട് മരവിപ്പിക്കാനും എഫ്ഐആറിനും ഈ വിവരങ്ങൾ ആവശ്യമാണ്',
    autoFillBtn: 'ഓട്ടോ-ഫിൽ ചെയ്യുക',
    done: 'പൂർത്തിയായി',
    pending: 'ബാക്കി',
    aiHint: 'എളുപ്പവഴി: താഴെയുള്ള അപ്‌ഡേറ്റുകളിൽ സാധാരണ രീതിയിൽ എഴുതുക (ഉദാ: "എന്റെ UTR 482910394821, ബാങ്ക് SBI") — AI തനിയെ പൂരിപ്പിക്കും!',
  },
  pa: {
    completeBadge: '100% ਪੂਰਾ',
    completeText: 'ਤੁਹਾਡੀ ਸ਼ਿਕਾਇਤ ਫੰਡ ਫ੍ਰੀਜ਼ ਕਰਨ ਅਤੇ ਪੁਲਿਸ ਐੱਫ.ਆਈ.ਆਰ. ਲਈ ਪੂਰੀ ਤਰ੍ਹਾਂ ਤਿਆਰ ਹੈ!',
    requiredBadge: 'ਲਾਜ਼ਮੀ',
    completed: 'ਪੂਰਾ',
    actionRequired: 'ਕਾਰਵਾਈ ਲੋੜੀਂਦੀ ਹੈ — ਫੰਡ ਫ੍ਰੀਜ਼ ਕਰਨ ਅਤੇ ਐੱਫ.ਆਈ.ਆਰ. ਲਈ ਇਹ ਵੇਰਵੇ ਜ਼ਰੂਰੀ ਹਨ',
    autoFillBtn: 'ਆਟੋ-ਫਿਲ ਕਰੋ',
    done: 'ਪੂਰਾ',
    pending: 'ਬਾਕੀ',
    aiHint: 'ਸੌਖਾ ਤਰੀਕਾ: ਹੇਠਾਂ ਅਪਡੇਟਸ ਵਿੱਚ ਕੁਦਰਤੀ ਢੰਗ ਨਾਲ ਲਿਖੋ (ਜਿਵੇਂ: "ਮੇਰਾ UTR 482910394821 ਹੈ, ਬੈਂਕ SBI") — AI ਆਪਣੇ-ਆਪ ਭਰ ਦੇਵੇਗਾ!',
  },
}

const FIELD_I18N: Record<string, Record<SupportedLanguage, { label: string; importance: string }>> = {
  utr: {
    en: { label: '12-Digit Transaction UTR Number', importance: 'Mandatory for bank & NPCI golden-hour fund freeze' },
    hi: { label: '12-अंकों का UPI UTR / लेनदेन संदर्भ संख्या', importance: 'बैंक और NPCI द्वारा फंड फ्रीज करने के लिए अनिवार्य' },
    bn: { label: '১২-সংখ্যার লেনদেন UTR নম্বর', importance: 'ব্যাংক ও NPCI দ্বারা অবিলম্বে ফান্ড ফ্রিজ করার জন্য বাধ্যতামূলক' },
    mr: { label: '१२-अंकी व्यवहार UTR क्रमांक', importance: 'बँक आणि NPCI द्वारे फंड फ्रीज करण्यासाठी आवश्यक' },
    te: { label: '12-అంకెల లావాదేవీ UTR సంఖ్య', importance: 'బ్యాంక్ మరియు NPCI ద్వారా నిధులు ఫ్రీజ్ చేయడానికి తప్పనిసరి' },
    ta: { label: '12-இலக்க பரிவர்த்தனை UTR எண்', importance: 'வங்கி மற்றும் NPCI மூலம் நிதி முடக்கத்திற்கு கட்டாயமானது' },
    gu: { label: '12-અંકનો ટ્રાન્ઝેક્શન UTR નંબર', importance: 'બેંક અને NPCI દ્વારા ફંડ ફ્રીઝ કરવા માટે ફરજિયાત' },
    ur: { label: '12-ہندسوں کا ٹرانزیکشن UTR نمبر', importance: 'بینک اور NPCI کے ذریعے رقم منجمد کرنے کے لیے لازمی' },
    kn: { label: '12-ಅಂಕಿಯ ವಹಿವಾಟು UTR ಸಂಖ್ಯೆ', importance: 'ಬ್ಯಾಂಕ್ ಮತ್ತು NPCI ಮೂಲಕ ಹಣ ಸ್ಥಗಿತಗೊಳಿಸಲು ಕಡ್ಡಾಯ' },
    or: { label: '୧୨-ଅଙ୍କ ବିଶିଷ୍ଟ କାରବାର UTR ନମ୍ବର', importance: 'ବ୍ୟାଙ୍କ ଏବଂ NPCI ଦ୍ୱାରା ଫଣ୍ଡ ଫ୍ରିଜ୍ ପାଇଁ ବାଧ୍ୟତାମୂଳକ' },
    ml: { label: '12-അക്ക ഇടപാട് UTR നമ്പർ', importance: 'ബാങ്കും NPCI-യും വഴി ഫണ്ട് മരവിപ്പിക്കാൻ നിർബന്ധമാണ്' },
    pa: { label: '12-ਅੰਕਾਂ ਦਾ ਲੈਣ-ਦੇਣ UTR ਨੰਬਰ', importance: 'ਬੈਂਕ ਅਤੇ NPCI ਦੁਆਰਾ ਫੰਡ ਫ੍ਰੀਜ਼ ਕਰਨ ਲਈ ਲਾਜ਼ਮੀ' },
  },
  bankName: {
    en: { label: 'Debited Bank Name', importance: 'Required to notify source Bank Nodal Officer' },
    hi: { label: 'बैंक का नाम (जिससे पैसे कटे)', importance: 'बैंक नोडल अधिकारी को तत्काल सूचित करने के लिए आवश्यक' },
    bn: { label: 'ব্যাংকের নাম (যেখান থেকে টাকা কেটেছে)', importance: 'ব্যাংক নোডাল অফিসারকে অবিলম্বে জানানোর জন্য প্রয়োজন' },
    mr: { label: 'बँकेचे नाव (ज्यातून पैसे कापले)', importance: 'बँक नोडल अधिकाऱ्यास त्वरित सूचित करण्यासाठी आवश्यक' },
    te: { label: 'డెబిట్ అయిన బ్యాంక్ పేరు', importance: 'బ్యాంక్ నోడల్ అధికారికి తెలియజేయడానికి అవసరం' },
    ta: { label: 'பணம் கழிக்கப்பட்ட வங்கியின் பெயர்', importance: 'வங்கி நோடல் அதிகாரிக்கு தெரிவிக்க அவசியம்' },
    gu: { label: 'બેંકનું નામ (જેમાંથી પૈસા કપાયા)', importance: 'બેંક નોડલ અધિકારીને જાણ કરવા માટે જરૂરી' },
    ur: { label: 'بینک کا نام (جس سے رقم کٹی)', importance: 'بینک نوڈل آفیسر کو مطلع کرنے کے لیے ضروری' },
    kn: { label: 'ಹಣ ಕಡಿತಗೊಂಡ ಬ್ಯಾಂಕ್ ಹೆಸರು', importance: 'ಬ್ಯಾಂಕ್ ನೋಡಲ್ ಅಧಿಕಾರಿಗೆ ತಿಳಿಸಲು ಅಗತ್ಯ' },
    or: { label: 'ବ୍ୟାଙ୍କର ନାମ (ଯେଉଁଥିରୁ ଟଙ୍କା କଟିଛି)', importance: 'ବ୍ୟାଙ୍କ ନୋଡାଲ ଅଧିକାରୀଙ୍କୁ ଜଣାଇବା ପାଇଁ ଆବଶ୍ୟକ' },
    ml: { label: 'ഡെബിറ്റ് ചെയ്ത ബാങ്കിന്റെ പേര്', importance: 'ബാങ്ക് നോഡൽ ഓഫീസറെ അറിയിക്കാൻ ആവശ്യമാണ്' },
    pa: { label: 'ਬੈਂਕ ਦਾ ਨਾਮ (ਜਿਸ ਵਿੱਚੋਂ ਪੈਸੇ ਕੱਟੇ)', importance: 'ਬੈਂਕ ਨੋਡਲ ਅਧਿਕਾਰੀ ਨੂੰ ਸੂਚਿਤ ਕਰਨ ਲਈ ਲੋੜੀਂਦਾ' },
  },
  fraudster: {
    en: { label: 'Fraudster / Beneficiary Identifier', importance: 'Needed to block beneficiary account & register FIR' },
    hi: { label: 'धोखेबाज़ का UPI ID / खाता / मोबाइल नंबर', importance: 'लाभार्थी खाते को ब्लॉक करने और प्राथमिकी दर्ज करने के लिए आवश्यक' },
    bn: { label: 'প্রতারকের UPI ID / অ্যাকাউন্ট / নম্বর', importance: 'প্রতারকের অ্যাকাউন্ট ব্লক এবং এফআইআর করার জন্য প্রয়োজনীয়' },
    mr: { label: 'फसवणूक करणाऱ्याचा UPI ID / खाते / फोन', importance: 'खाते ब्लॉक करण्यासाठी आणि एफआयआर नोंदवण्यासाठी आवश्यक' },
    te: { label: 'మోసగాడి UPI ID / ఖాతా / ఫోన్ నంబర్', importance: 'ఖాతాను బ్లాక్ చేయడానికి మరియు ఎఫ్ఐఆర్ నమోదుకు అవసరం' },
    ta: { label: 'மோசடி செய்பவரின் UPI ID / கணக்கு / எண்', importance: 'கணக்கை முடக்கவும் எஃப்ஐஆர் பதிவு செய்யவும் தேவை' },
    gu: { label: 'ઠગનો UPI ID / ખાતું / મોબાઇલ નંબર', importance: 'ખાતું બ્લોક કરવા અને એફઆઈઆર નોંધવા માટે જરૂરી' },
    ur: { label: 'دھوکے باز کا UPI ID / اکاؤنٹ / فون نمبر', importance: 'اکاؤنٹ بلاک کرنے اور ایف آئی آر درج کرانے کے لیے درکار' },
    kn: { label: 'ವಂಚಕನ UPI ID / ಖಾತೆ / ಮೊಬೈಲ್ ಸಂಖ್ಯೆ', importance: 'ಖಾತೆ ಬ್ಲಾಕ್ ಮಾಡಲು ಮತ್ತು ಎಫ್‌ಐಆರ್ ದಾಖಲಿಸಲು ಅಗತ್ಯ' },
    or: { label: 'ଠକର UPI ID / ଆକାଉଣ୍ଟ / ମୋବାଇଲ୍ ନମ୍ବର', importance: 'ଆକାଉଣ୍ଟ ବ୍ଲକ୍ ଏବଂ FIR ଦାଖଲ ପାଇଁ ଆବଶ୍ୟକ' },
    ml: { label: 'തട്ടിപ്പുകാരന്റെ UPI ID / അക്കൗണ്ട് / ഫോൺ', importance: 'അക്കൗണ്ട് തടയാനും എഫ്ഐആർ ഫയൽ ചെയ്യാനും ആവശ്യമാണ്' },
    pa: { label: 'ਧੋਖੇਬਾਜ਼ ਦਾ UPI ID / ਖਾਤਾ / ਮੋਬਾਈਲ ਨੰਬਰ', importance: 'ਖਾਤਾ ਬਲਾਕ ਕਰਨ ਅਤੇ ਐੱਫ.ਆੀ.ਆਰ. ਦਰਜ ਕਰਨ ਲਈ ਲੋੜੀਂਦਾ' },
  },
  complainant: {
    en: { label: 'Complainant Full Name', importance: 'Required for legal FIR and police statement' },
    hi: { label: 'शिकायतकर्ता का पूरा नाम', importance: 'कानूनी FIR और पुलिस बयान के लिए आवश्यक' },
    bn: { label: 'অভিযোগকারীর পুরো নাম', importance: 'আইনি এফআইআর এবং পুলিশের বিবৃতির জন্য প্রয়োজনীয়' },
    mr: { label: 'तक्रारदाराचे पूर्ण नाव', importance: 'कायदेशीर एफआयआर आणि पोलीस जबाबासाठी आवश्यक' },
    te: { label: 'ఫిర్యాదుదారుని పూర్తి పేరు', importance: 'చట్టపరమైన ఎఫ్ఐఆర్ మరియు పోలీసు స్టేట్‌మెంట్ కోసం అవసరం' },
    ta: { label: 'புகார்தாரரின் முழுப் பெயர்', importance: 'சட்டப்பூர்வ எஃப்ஐஆர் மற்றும் காவல்துறை வாக்குமூலத்திற்கு தேவை' },
    gu: { label: 'ફરિયાદીનું પૂરું નામ', importance: 'કાનૂની એફઆઈઆર અને પોલીસ નિવેદન માટે જરૂરી' },
    ur: { label: 'شکایت کنندہ کا مکمل نام', importance: 'قانونی ایف آئی آر اور پولیس بیان کے لیے لازمی' },
    kn: { label: 'ದೂರುದಾರರ ಪೂರ್ಣ ಹೆಸರು', importance: 'ಕಾನೂನುಬದ್ಧ ಎಫ್‌ಐಆರ್ ಮತ್ತು ಪೊಲೀಸ್ ಹೇಳಿಕೆಗೆ ಅಗತ್ಯ' },
    or: { label: 'ଅଭିଯୋଗକାରୀଙ୍କ ପୂରା ନାମ', importance: 'ଆଇନଗତ FIR ଏବଂ ପୋଲିସ ବୟାନ ପାଇଁ ଆବଶ୍ୟକ' },
    ml: { label: 'പരാതിക്കാരന്റെ പൂർണ്ണമായ പേര്', importance: 'നിയമപരമായ എഫ്ഐആറിനും പോലീസ് മൊഴിക്കും ആവശ്യമാണ്' },
    pa: { label: 'ਸ਼ਿਕਾਇਤਕਰਤਾ ਦਾ ਪੂਰਾ ਨਾਮ', importance: 'ਕਾਨੂੰਨੀ ਐੱਫ.ਆਈ.ਆਰ. ਅਤੇ ਪੁਲਿਸ ਬਿਆਨ ਲਈ ਲੋੜੀਂਦਾ' },
  },
  amount: {
    en: { label: 'Disputed Fraud Amount', importance: 'Specifies exact claim amount for recovery' },
    hi: { label: 'धोखाधड़ी की राशि (₹)', importance: 'वसूली के लिए दावा की गई सटीक राशि' },
    bn: { label: 'প্রতারণার আর্থিক পরিমাণ (₹)', importance: 'টাকা উদ্ধারের জন্য নির্দিষ্ট দাবিকৃত পরিমাণ' },
    mr: { label: 'फसवणुकीची रक्कम (₹)', importance: 'वसुलीसाठी दावा केलेली अचूक रक्कम' },
    te: { label: 'మోసపోయిన మొత్తం (₹)', importance: 'రికవరీ కోసం ఖచ్చితమైన దావా మొత్తం' },
    ta: { label: 'மோசடி செய்யப்பட்ட தொகை (₹)', importance: 'மீட்புக்கான சரியான உரிமை கோரல் தொகை' },
    gu: { label: 'છેતરપિંડીની રકમ (₹)', importance: 'રિકવરી માટે દાવો કરેલી ચોક્કસ રકમ' },
    ur: { label: 'فراڈ کی متنازعہ رقم (₹)', importance: 'ریکوری کے لیے دعویٰ کی گئی درست رقم' },
    kn: { label: 'ವಂಚನೆಗೊಳಗಾದ ಮೊತ್ತ (₹)', importance: 'ಮರುಪಡೆಯುವಿಕೆಗಾಗಿ ನಿಖರವಾದ ಕ್ಲೈಮ್ ಮೊತ್ತ' },
    or: { label: 'ଠକେଇ ହୋଇଥିବା ରାଶି (₹)', importance: 'ପ୍ରତ୍ୟାର୍ପଣ ପାଇଁ ଦାବି କରାଯାଇଥିବା ସଠିକ୍ ରାଶି' },
    ml: { label: 'തട്ടിപ്പ് തുക (₹)', importance: 'വീണ്ടെടുക്കലിനായി കൃത്യമായ ക്ലെയിം തുക' },
    pa: { label: 'ਧੋਖਾਧੜੀ ਦੀ ਰਕਮ (₹)', importance: 'ਵਸੂਲੀ ਲਈ ਦਾਅਵਾ ਕੀਤੀ ਸਹੀ ਰਕਮ' },
  },
}

interface CompulsoryDetailsReminderProps {
  triageResult: TriageResult
  language: SupportedLanguage
  onScrollToUpdates?: () => void
}

export default function CompulsoryDetailsReminder({
  triageResult,
  language,
  onScrollToUpdates,
}: CompulsoryDetailsReminderProps) {
  const t = REMINDER_I18N[language] || REMINDER_I18N.en
  const fields = getCompulsoryFields(triageResult)
  const filledCount = fields.filter((f) => f.isFilled).length
  const totalCount = fields.length
  const missingCount = totalCount - filledCount
  const percent = Math.round((filledCount / totalCount) * 100)

  /* ── All complete ── */
  if (missingCount === 0) {
    return (
      <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-5 sm:p-6 flex items-start gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-800/60 px-2.5 py-1 rounded-full">
              {t.completeBadge}
            </span>
          </div>
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mt-2 leading-relaxed indic-body">
            {t.completeText}
          </p>
        </div>
      </div>
    )
  }

  /* ── Incomplete ── */
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">

      {/* ── Header ── */}
      <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 bg-gradient-to-br from-amber-50/80 via-white to-white dark:from-amber-950/30 dark:via-zinc-900 dark:to-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 dark:bg-amber-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/50 px-2.5 py-1 rounded-full">
                  {t.requiredBadge}
                </span>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {filledCount} / {totalCount} {t.completed}
                </span>
              </div>
              <h3 className="text-[15px] sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-1.5 leading-snug indic-headline">
                {t.actionRequired}
              </h3>
            </div>
          </div>

          {onScrollToUpdates && (
            <button
              type="button"
              onClick={onScrollToUpdates}
              className="self-start sm:self-center inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all shadow-sm flex-shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 opacity-80" />
              <span>{t.autoFillBtn}</span>
              <ArrowRight className="w-3 h-3 rtl:rotate-180" />
            </button>
          )}
        </div>

        {/* ── Progress bar ── */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500 dark:from-amber-500 dark:to-emerald-400 transition-all duration-700 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-[11px] font-mono font-semibold text-zinc-400 dark:text-zinc-500 tabular-nums flex-shrink-0">
            {percent}%
          </span>
        </div>
      </div>

      {/* ── Checklist grid ── */}
      <div className="px-5 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {fields.map((f) => {
          const fieldMeta = FIELD_I18N[f.key]?.[language] || FIELD_I18N[f.key]?.en
          const labelText = fieldMeta?.label || (language === 'hi' ? f.labelHi : f.label)
          const importanceText = fieldMeta?.importance || (language === 'hi' ? f.importanceHi : f.importance)

          return (
            <div
              key={f.key}
              className={`group relative p-3.5 rounded-xl border text-xs transition-all ${
                f.isFilled
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/25 border-emerald-200/70 dark:border-emerald-800/40'
                  : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/60'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {f.isFilled ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-[1px]" />
                ) : (
                  <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-600 flex-shrink-0 mt-[1px]" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-medium leading-snug indic-body ${
                      f.isFilled
                        ? 'text-emerald-900 dark:text-emerald-200'
                        : 'text-zinc-800 dark:text-zinc-200'
                    }`}>
                      {labelText}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${
                        f.isFilled
                          ? 'bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300'
                          : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {f.isFilled ? t.done : t.pending}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed line-clamp-1 indic-body">
                    {f.isFilled ? f.value : importanceText}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── AI hint footer ── */}
      <div className="px-5 sm:px-6 py-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
        <div className="flex items-start gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
          <p className="indic-body">
            {t.aiHint}
          </p>
        </div>
      </div>
    </div>
  )
}
