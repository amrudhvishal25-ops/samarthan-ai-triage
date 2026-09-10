// src/lib/i18n/multilingualRegex.ts
// Universal Multilingual NLP & Extraction Engine for Samarthan AI
// Supports 12 Indian Languages: en, hi, bn, mr, te, ta, gu, ur, kn, or, ml, pa

import { SupportedLanguage } from './languages'
import { FraudType } from '@/data/scenarios'

// 1. Universal Unicode Script Ranges for Indian Languages + Arabic/Urdu + Latin
export const ALL_INDIC_SCRIPTS_PATTERN =
  '[A-Za-z\\u0900-\\u097F\\u0980-\\u09FF\\u0A00-\\u0A7F\\u0A80-\\u0AFF\\u0B00-\\u0B7F\\u0B80-\\u0BFF\\u0C00-\\u0C7F\\u0C80-\\u0CFF\\u0D00-\\u0D7F\\u0600-\\u06FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF]'

// 2. Indic Numerals to Standard ASCII Digits Map
const INDIC_NUMERAL_MAP: Record<string, string> = {
  // Devanagari
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  // Bengali
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  // Gurmukhi
  '੦': '0', '੧': '1', '੨': '2', '੩': '3', '੪': '4', '੫': '5', '੬': '6', '੭': '7', '੮': '8', '੯': '9',
  // Gujarati
  '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4', '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9',
  // Odia
  '୦': '0', '୧': '1', '୨': '2', '୩': '3', '୪': '4', '୫': '5', '୬': '6', '୭': '7', '୮': '8', '୯': '9',
  // Tamil
  '௦': '0', '௧': '1', '௨': '2', '௩': '3', '௪': '4', '௫': '5', '௬': '6', '௭': '7', '௮': '8', '௯': '9',
  // Telugu
  '౦': '0', '౧': '1', '౨': '2', '౩': '3', '౪': '4', '౫': '5', '౬': '6', '౭': '7', '౮': '8', '౯': '9',
  // Kannada
  '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4', '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9',
  // Malayalam
  '൦': '0', '൧': '1', '൨': '2', '൩': '3', '൪': '4', '൫': '5', '൬': '6', '൭': '7', '൮': '8', '൯': '9',
  // Perso-Arabic / Urdu (Eastern & Western Arabic numerals)
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
}

export function normalizeIndicNumerals(input: string): string {
  if (!input) return ''
  // Replace Arabic comma (، \u060C) with ASCII comma and convert Indic numerals
  return input
    .replace(/[\u060C،]/g, ',')
    .replace(/[०-९০-৯੦-੯૦-૯୦-୯௦-௯౦-౯೦-೯൦-൯۰-۹٠-٩]/g, (ch) => INDIC_NUMERAL_MAP[ch] || ch)
}

// 3. Multilingual Amount Extractor
export function extractMultilingualAmount(text: string): number {
  if (!text) return 0
  const normalized = normalizeIndicNumerals(text)

  // 1. Currency Suffix across all 12 languages (Priority 1: exact monetary units)
  const suffixRegex = /([\d,]+)\s*(?:₹|rs\.?|inr|rupees|rupaye|रुपये|रुपया|रूपये|টাকা|રૂપિયા|રૂપિયો|రూపాయలు|రూపాయల|రూపాయి|ரூபாய்|ರೂಪಾಯಿ|ರೂಪಾಯಿಗಳು|ଟଙ୍କା|രൂപ|ਰੁਪਏ|ਰੁਪਈਆ|روپے|روپیہ)/i
  const mSuffix = normalized.match(suffixRegex)
  if (mSuffix && mSuffix[1]) {
    const clean = parseInt(mSuffix[1].replace(/,/g, ''), 10)
    if (Number.isFinite(clean) && clean > 0) return clean
  }

  // 2. Currency Prefix (₹, rs, inr, etc.)
  const prefixRegex = /(?:₹|rs\.?|inr|amount|amt|balance)\s*([\d,]+)/i
  const mPrefix = normalized.match(prefixRegex)
  if (mPrefix && mPrefix[1]) {
    const clean = parseInt(mPrefix[1].replace(/,/g, ''), 10)
    if (Number.isFinite(clean) && clean > 0) return clean
  }

  // 3. Multipliers: lakh / crore / hazar
  const multiplierRegex = /([\d,]+)\s*(?:lakh|lakhs|লাখ|लाख|લાખ|లక్ష|లక్షల|லட்சம்|لاکھ|ಲಕ್ಷ|ଲକ୍ଷ|ലക്ഷം|ਲੱਖ)/i
  const mMulti = normalized.match(multiplierRegex)
  if (mMulti && mMulti[1]) {
    const clean = parseFloat(mMulti[1].replace(/,/g, ''))
    if (Number.isFinite(clean) && clean > 0) return Math.round(clean * 100000)
  }

  const croreRegex = /([\d,]+)\s*(?:crore|crores|কোটি|करोड़|કરોડ|కోట్లు|కోటి|கோடி|کروڑ|ಕೋಟಿ|କୋଟି|കോടി|ਕਰੋੜ)/i
  const mCrore = normalized.match(croreRegex)
  if (mCrore && mCrore[1]) {
    const clean = parseFloat(mCrore[1].replace(/,/g, ''))
    if (Number.isFinite(clean) && clean > 0) return Math.round(clean * 10000000)
  }

  // 4. Standalone figure after transaction words
  const txnRegex = /(?:debited|lost|stolen|paid|transferred|cut|fraud|cut off)\s*(?:of\s*)?([\d,]+)/i
  const mTxn = normalized.match(txnRegex)
  if (mTxn && mTxn[1]) {
    const clean = parseInt(mTxn[1].replace(/,/g, ''), 10)
    if (Number.isFinite(clean) && clean > 0 && clean < 1000000000) return clean
  }

  return 0
}

// 4. Multilingual Complainant Name Extractor
const EXPLICIT_NAME_REGEXES = [
  new RegExp(`(?:my name is|name is)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)`, 'i'),
  new RegExp(`(?:मेरा नाम)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)(?:\\s+है)?`, 'i'),
  new RegExp(`(?:আমার নাম)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)`, 'i'),
  new RegExp(`(?:माझे नाव)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)(?:\\s+आहे)?`, 'i'),
  new RegExp(`(?:నా పేరు)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)`, 'i'),
  new RegExp(`(?:என் பெயர்)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)`, 'i'),
  new RegExp(`(?:મારું નામ)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)(?:\\s+છે)?`, 'i'),
  new RegExp(`(?:میرا نام)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)(?:\\s+ہے)?`, 'i'),
  new RegExp(`(?:ನನ್ನ ಹೆಸರು)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)`, 'i'),
  new RegExp(`(?:ମୋର ନାମ|ମୋ ନାଁ)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)`, 'i'),
  new RegExp(`(?:എന്റെ പേര്)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)`, 'i'),
  new RegExp(`(?:ਮੇਰਾ ਨਾਮ)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)(?:\\s+ਹੈ)?`, 'i'),
]

// Unicode-friendly first-person intro regexes (without \b)
const I_AM_REGEXES = [
  new RegExp(`(?:^|[\\s,।.\n])(?:I am|I'm)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)`, 'i'),
  new RegExp(`(?:^|[\\s,।.\n])(?:मैं|मै)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)(?:\\s+हूँ|\\s+हुँ)?`, 'i'),
  new RegExp(`(?:^|[\\s,।.\n])(?:আমি)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)`, 'i'),
  new RegExp(`(?:^|[\\s,।.\n])(?:मी)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)`, 'i'),
  new RegExp(`(?:^|[\\s,।.\n])(?:నేను)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)`, 'i'),
  new RegExp(`(?:^|[\\s,।.\n])(?:நான்)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)`, 'i'),
  new RegExp(`(?:^|[\\s,।.\n])(?:હું|હુ)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)(?:\\s+છું)?`, 'i'),
  new RegExp(`(?:^|[\\s,।.\n])(?:میں)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)(?:\\s+ہوں)?`, 'i'),
  new RegExp(`(?:^|[\\s,।.\n])(?:ನಾನು)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)`, 'i'),
  new RegExp(`(?:^|[\\s,।.\n])(?:ମୁଁ)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)`, 'i'),
  new RegExp(`(?:^|[\\s,।.\n])(?:ഞാൻ)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)`, 'i'),
  new RegExp(`(?:^|[\\s,।.\n])(?:ਮੈਂ)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)(?:\\s+ਹਾਂ)?`, 'i'),
]

const GRAMMAR_AND_RELATION_STOPWORDS = new Set([
  'a', 'an', 'the', 'not', 'none', 'unknown', 'filing', 'writing', 'lodging', 'reporting',
  'calling', 'facing', 'complaining', 'victim', 'scammed', 'cheated', 'here', 'now',
  // relationship terms
  'father', 'mother', 'brother', 'sister', 'wife', 'husband', 'friend', 'son', 'daughter',
  'বাবা', 'মা', 'ভাই', 'বোন', 'স্ত্রী', 'স্বামী', 'বন্ধু',
  'वडील', 'आई', 'भाऊ', 'बहीण', 'पत्नी', 'पती', 'मित्र', 'माझे', 'माझ्या',
  'నాన్న', 'అమ్మ', 'తమ్ముడు', 'అన్నయ్య', 'చెల్లి', 'భార్య', 'భర్త', 'మా',
  'தந்தை', 'தாய்', 'தம்பி', 'அண்ணன்', 'மனைவி', 'கணவன்', 'என்',
  'પિતા', 'માતા', 'ભાઈ', 'બહેન', 'પત્ની', 'પતિ', 'મારા', 'મારી',
  'والد', 'والدہ', 'بھائی', 'بہن', 'بیوی', 'شوہر', 'اپنے', 'اپنی',
  'ತಂದೆ', 'ತಾಯಿ', 'ಸಹೋದರ', 'ಪತ್ನಿ', 'ಪತಿ', 'ನನ್ನ',
  'ବାପା', 'ବୋଉ', 'ଭାଇ', 'ଭଉଣୀ', 'ସ୍ତ୍ରୀ', 'ସ୍ୱାମୀ', 'ମୋ',
  'അച്ഛൻ', 'അമ്മ', 'സഹോദരൻ', 'ഭാര്യ', 'ഭർത്താവ്', 'എന്റെ',
  'ਪਿਤਾ', 'ਮਾਤਾ', 'ਭਰਾ', 'ਭੈਣ', 'ਪਤਨੀ', 'ਪਤੀ', 'ਮੇਰੇ', 'ਮੇਰੀ'
])

export function extractMultilingualComplainant(text: string): string | null {
  if (!text) return null

  // 1. Try explicit patterns first
  for (const rx of EXPLICIT_NAME_REGEXES) {
    const match = text.match(rx)
    if (match && match[1]) {
      const candidate = match[1].replace(/[।.,!?;:]+$/, '').trim()
      if (!GRAMMAR_AND_RELATION_STOPWORDS.has(candidate.toLowerCase()) && candidate.length > 1) {
        return candidate
      }
    }
  }

  // 2. Try first-person patterns
  for (const rx of I_AM_REGEXES) {
    const match = text.match(rx)
    if (match && match[1]) {
      const candidate = match[1].replace(/[।.,!?;:]+$/, '').trim()
      const firstWord = candidate.split(/\s+/)[0].toLowerCase()
      if (!GRAMMAR_AND_RELATION_STOPWORDS.has(firstWord) && candidate.length > 1) {
        return candidate
      }
    }
  }

  return null
}

// 5. Multilingual "On Behalf Of" Target Extractor
export function extractMultilingualOnBehalfOf(text: string): string | null {
  if (!text) return null

  // Secondary indicator: explicit mention of "her/his name is X" after on-behalf statement:
  // e.g., "माझ्या आईच्या वतीने... त्यांचे नाव सुनंदा कदम आहे", "त्याचे नाव रोहन मोहिते", "तिचे नाव कविता जाधव", "তাঁর নাম কল্পনা সরকার", "ആമെ పేరు కమలమ్మ"
  const victimNameMatch = text.match(new RegExp(`(?:त्यांचे नाव|त्याचे नाव|तिचे नाव|त्यांचं नाव|त्यांचा नाव|তাঁর নাম|ആമെ పేరు|వారి పేరు|அவர் பெயர்|அவரது பெயர்|તેમનું નામ|ان کا نام|ಅವರ ಹೆಸರು|ତାଙ୍କ ନାମ|ତାଙ୍କ ନାଁ|അവരുടെ പേര്|അദ്ദേഹത്തിന്റെ പേര്|ਉਹਨਾਂ ਦਾ ਨਾਮ|ਉਸਦਾ ਨਾਮ)\\s+(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)`, 'i'))
  if (victimNameMatch && victimNameMatch[1]) {
    const clean = victimNameMatch[1].replace(/[।.,!?;:]+$/, '').trim()
    if (clean.length > 1 && !/^(आहे|છે|ਹੈ|ആണ്|არის)$/.test(clean)) return clean
  }

  // Pattern 1: English "on behalf of X"
  const enMatch = text.match(/(?:on behalf of|behalf of)\s+(?:my\s+(?:father|mother|brother|sister|friend|wife|husband|colleague|relative|parent|uncle|aunt)\s+)?([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?)/i)
  if (enMatch && enMatch[1] && !/^(him|her|them|someone|a|an|the|my|this|anyone|family|i|we)$/i.test(enMatch[1])) {
    return enMatch[1].trim()
  }

  // Pattern 2: Hindi "... की ओर से / ... की तरफ से"
  const hiMatch = text.match(new RegExp(`(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)\\s+(?:की ओर से|की तरफ से|के behalf)`, 'i'))
  if (hiMatch && hiMatch[1] && !/^(उनके|इसके|अपने|किसी|सबके)$/i.test(hiMatch[1])) {
    return hiMatch[1].trim()
  }

  // Pattern 3: Bengali "...-এর পক্ষ থেকে / ...র পক্ষ থেকে / ...র তরফ থেকে"
  const bnMatch = text.match(new RegExp(`(?:আমার\\s+(?:বাবা|মা|ভাই|বোন|স্ত্রী|স্বামী|বন্ধু)\\s+)?(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)(?:-এর|এর|র)?\\s+(?:পক্ষ থেকে|তরফ থেকে)`, 'i'))
  if (bnMatch && bnMatch[1]) {
    const clean = bnMatch[1].replace(/[-এরর]$/, '').trim()
    if (clean && !/^(তাদের|তার|আমার|কারো)$/.test(clean)) return clean
  }

  // Pattern 4: Marathi "...यांच्या वतीने / ...च्या वतीने"
  const mrMatch = text.match(new RegExp(`(?:माझे|माझ्या)?\\s*(?:वडील|आई|भाऊ|बहीण|पत्नी|पती|मित्र)?\\s*(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)(?:\\s+यांच्या वतीने|\\s+च्या वतीने)`, 'i'))
  if (mrMatch && mrMatch[1]) {
    const clean = mrMatch[1].trim()
    if (clean && !/^(त्यांच्या|माझ्या|आपल्या|वडील|आई|भाऊ|बहीण|पत्नी|पती|मित्र)$/.test(clean)) return clean
  }

  // Pattern 5: Telugu "...తరపున / ...వారి తరపున"
  const teMatch = text.match(new RegExp(`(?:మా\\s+(?:నాన్నగారు|అమ్మగారు|తమ్ముడు|అన్నయ్య|భార్య|స్నేహితుడు|తండ్రి|అమ్మ)\\s+)?(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)(?:\\s+తరపున|\\s+వారి తరపున)`, 'i'))
  if (teMatch && teMatch[1]) {
    const clean = teMatch[1].trim()
    if (clean && !/^(వారి|నా|మా)$/.test(clean)) return clean
  }

  // Pattern 6: Tamil "...சார்பாக"
  const taMatch = text.match(new RegExp(`(?:என்\\s+(?:தந்தை|தாயார்|தம்பி|அண்ணன்|மனைவி|நண்பர்|அம்மா|அப்பா)\\s+)?(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)(?:\\s+சார்பாக)`, 'i'))
  if (taMatch && taMatch[1]) {
    const clean = taMatch[1].trim()
    if (clean && !/^(அவர்கள்|என்|நமது)$/.test(clean)) return clean
  }

  // Pattern 7: Gujarati "...વતી / ...તરફથી"
  const guMatch = text.match(new RegExp(`(?:મારા\\s+(?:પિતા|માતા|ભાઈ|બહેન|પત્ની|મિત્ર)\\s+)?(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)(?:\\s+વતી|\\s+તરફથી)`, 'i'))
  if (guMatch && guMatch[1]) {
    const clean = guMatch[1].trim()
    if (clean && !/^(તેમના|મારા|કોઈના)$/.test(clean)) return clean
  }

  // Pattern 8: Urdu "...کی جانب سے / ...کی طرف سے"
  const urMatch = text.match(new RegExp(`(?:اپنے|اپنی)?\\s*(?:والد|والدہ|بھائی|بہن|دوست|اہلیہ)?\\s*(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)(?:\\s+کی جانب سے|\\s+کی طرف سے)`, 'i'))
  if (urMatch && urMatch[1]) {
    const clean = urMatch[1].trim()
    if (clean && !/^(ان|اپنے|کسی|والد|والدہ|بھائی|بہن|دوست|اہلیہ)$/.test(clean)) return clean
  }

  // Pattern 9: Kannada "...ಅವರ ಪರವಾಗಿ / ...ಪರವಾಗಿ"
  const knMatch = text.match(new RegExp(`(?:ನನ್ನ\\s+(?:ತಂದೆ|ತಾಯಿ|ಸಹೋದರ|ಪತ್ನಿ|ಸ್ನೇಹಿತ|ಅಪ್ಪ|ಅಮ್ಮ)\\s+)?(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)(?:\\s+ಅವರ ಪರವಾಗಿ|\\s+ಪರವಾಗಿ)`, 'i'))
  if (knMatch && knMatch[1]) {
    const clean = knMatch[1].trim()
    if (clean && !/^(ಅವರ|ನನ್ನ|ಯಾರಾದರೂ)$/.test(clean)) return clean
  }

  // Pattern 10: Odia "...ଙ୍କ ତରଫରୁ / ...ତରଫରୁ"
  const orMatch = text.match(new RegExp(`(?:ମୋ\\s+(?:ବାପା|ବୋଉ|ଭାଇ|ସ୍ତ୍ରୀ|ବନ୍ଧୁ|ମା)\\s+)?(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)(?:ଙ୍କ\\s+ତରଫରୁ|\\s+ତରଫରୁ)`, 'i'))
  if (orMatch && orMatch[1]) {
    const clean = orMatch[1].trim()
    if (clean && !/^(ତାଙ୍କ|ମୋ|କାହାର)$/.test(clean)) return clean
  }

  // Pattern 11: Malayalam "...-ന് വേണ്ടി / ...ക്ക് വേണ്ടി / ...വേണ്ടി"
  const mlMatch = text.match(new RegExp(`(?:എന്റെ\\s+(?:അച്ഛൻ|അമ്മ|സഹോദരൻ|ഭാര്യ|സുഹൃത്ത്)\\s+)?(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)(?:-ന് വേണ്ടി|ന് വേണ്ടി|ക്ക് വേണ്ടി|\\s+വേണ്ടി|യുടെ പേരിൽ)`, 'i'))
  if (mlMatch && mlMatch[1]) {
    const clean = mlMatch[1].trim()
    if (clean && !/^(അവരുടെ|എന്റെ|സുഹൃത്ത്)$/.test(clean)) return clean
  }

  // Pattern 12: Punjabi "...ਵੱਲੋਂ / ...ਦੀ ਤਰਫੋਂ"
  const paMatch = text.match(new RegExp(`(?:ਮੇਰੇ|ਮੇਰੀ)?\\s*(?:ਪਿਤਾ|ਮਾਤਾ|ਭਰਾ|ਪਤਨੀ|ਦੋਸਤ)?\\s*(?:ਜੀ)?\\s*(${ALL_INDIC_SCRIPTS_PATTERN}+(?:\\s+${ALL_INDIC_SCRIPTS_PATTERN}+)?)(?:\\s+ਵੱਲੋਂ|\\s+ਦੀ ਤਰਫੋਂ)`, 'i'))
  if (paMatch && paMatch[1]) {
    const clean = paMatch[1].trim()
    if (clean && !/^(ਉਹਨਾਂ|ਮੇਰੇ|ਕਿਸੇ|ਪਿਤਾ|ਮਾਤਾ|ਭਰਾ|ਪਤਨੀ|ਦੋਸਤ)$/.test(clean)) return clean
  }

  return null
}

// 6. Universal Multilingual Category Normalizer
export const MULTILINGUAL_CATEGORY_MAP: Record<string, FraudType> = {
  // English
  'Financial Fraud': 'Financial Fraud',
  'Women/Children Related Crime': 'Women/Children Related Crime',
  'Extortion & Blackmail': 'Extortion & Blackmail',
  'Identity Theft': 'Identity Theft',
  'E-Commerce Scams': 'E-Commerce Scams',
  'Investment Scam': 'Investment Scam',
  'Other Cyber Crime': 'Other Cyber Crime',

  // Hindi
  'वित्तीय धोखाधड़ी': 'Financial Fraud',
  'महिला/बाल अपराध': 'Women/Children Related Crime',
  'जबरन वसूली': 'Extortion & Blackmail',
  'पहचान की चोरी': 'Identity Theft',
  'ई-कॉमर्स धोखाधड़ी': 'E-Commerce Scams',
  'निवेश धोखाधड़ी': 'Investment Scam',
  'अन्य साइबर अपराध': 'Other Cyber Crime',

  // Bengali
  'আর্থিক প্রতারণা': 'Financial Fraud',
  'আর্থিক জালিয়াতি': 'Financial Fraud',
  'নারী/শিশু সংক্রান্ত অপরাধ': 'Women/Children Related Crime',
  'তোলাবাজি ও ব্ল্যাকমেল': 'Extortion & Blackmail',
  'পরিচয় চুরি': 'Identity Theft',
  'ই-কমার্স স্ক্যাম': 'E-Commerce Scams',
  'বিনিয়োগ কেলেঙ্কারি': 'Investment Scam',
  'অন্যান্য সাইবার অপরাধ': 'Other Cyber Crime',

  // Marathi
  'आर्थिक फसवणूक': 'Financial Fraud',
  'महिला/बालक संबंधित गुन्हे': 'Women/Children Related Crime',
  'खंडणी आणि ब्लॅकमेल': 'Extortion & Blackmail',
  'ओळख चोरी': 'Identity Theft',
  'ई-कॉमर्स घोटाळे': 'E-Commerce Scams',
  'गुंतवणूक घोटाळा': 'Investment Scam',
  'इतर सायबर गुन्हे': 'Other Cyber Crime',

  // Telugu
  'ఆర్థిక మోసం': 'Financial Fraud',
  'మహిళలు/పిల్లల సంబంధిత నేరాలు': 'Women/Children Related Crime',
  'దోపిడీ & బ్లాక్‌మెయిల్': 'Extortion & Blackmail',
  'గుర్తింపు దొంగతనం': 'Identity Theft',
  'ఇ-కామర్స్ స్కామ్‌లు': 'E-Commerce Scams',
  'పెట్టుబడి మోసం': 'Investment Scam',
  'ఇతర సైబర్ నేరాలు': 'Other Cyber Crime',

  // Tamil
  'நிதி மோசடி': 'Financial Fraud',
  'பெண்கள்/குழந்தைகள் தொடர்பான குற்றங்கள்': 'Women/Children Related Crime',
  'பறிப்பு & பிளாக்மெயில்': 'Extortion & Blackmail',
  'அடையாள திருட்டு': 'Identity Theft',
  'இ-காமர்ஸ் மோசடிகள்': 'E-Commerce Scams',
  'முதலீட்டு மோசடி': 'Investment Scam',
  'பிற இணையக் குற்றங்கள்': 'Other Cyber Crime',

  // Gujarati
  'નાણાકીય છેતરપિંડી': 'Financial Fraud',
  'મહિલા/બાળ સંબંધિત ગુના': 'Women/Children Related Crime',
  'ખંડણી અને બ્લેકમેલ': 'Extortion & Blackmail',
  'ઓળખની ચોરી': 'Identity Theft',
  'ઇ-કોમર્સ કૌભાંડો': 'E-Commerce Scams',
  'રોકાણ કૌભાંડ': 'Investment Scam',
  'અન્ય સાયબર ક્રાઈમ': 'Other Cyber Crime',

  // Urdu
  'مالیاتی دھوکہ دہی': 'Financial Fraud',
  'خواتین/بچوں سے متعلق جرائم': 'Women/Children Related Crime',
  'بھتہ خوری اور بلیک میلنگ': 'Extortion & Blackmail',
  'شناخت کی چوری': 'Identity Theft',
  'ای کامرس گھوٹالے': 'E-Commerce Scams',
  'سرمایہ کاری کا فراڈ': 'Investment Scam',
  'دیگر سائبر جرائم': 'Other Cyber Crime',

  // Kannada
  'ಹಣಕಾಸು ವಂಚನೆ': 'Financial Fraud',
  'ಮಹಿಳೆಯರು/ಮಕ್ಕಳ ಸಂಬಂಧಿತ ಅಪರಾಧ': 'Women/Children Related Crime',
  'ಸುಲಿಗೆ ಮತ್ತು ಬ್ಲ್ಯಾಕ್‌ಮೇಲ್': 'Extortion & Blackmail',
  'ಗುರುತಿನ ಕಳ್ಳತನ': 'Identity Theft',
  'ಇ-ಕಾಮರ್ಸ್ ವಂಚನೆಗಳು': 'E-Commerce Scams',
  'ಹೂಡಿಕೆ ವಂಚನೆ': 'Investment Scam',
  'ಇತರ ಸೈಬರ್ ಅಪರಾಧಗಳು': 'Other Cyber Crime',

  // Odia
  'ଆର୍ଥିକ ଠକେଇ': 'Financial Fraud',
  'ମହିଳା/ଶିଶୁ ସମ୍ବନ୍ଧୀୟ ଅପରାଧ': 'Women/Children Related Crime',
  'ଜବରଦସ୍ତ ଆଦାୟ ଓ ବ୍ଲାକମେଲ': 'Extortion & Blackmail',
  'ପରିଚୟ ଚୋରି': 'Identity Theft',
  'ଇ-କମର୍ସ ଠକେଇ': 'E-Commerce Scams',
  'ନିବେଶ ଠକେଇ': 'Investment Scam',
  'ଅନ୍ୟାନ୍ୟ ସାଇବର ଅପରାଧ': 'Other Cyber Crime',

  // Malayalam
  'സാമ്പത്തിക തട്ടിപ്പ്': 'Financial Fraud',
  'സ്ത്രീകൾ/കുട്ടികൾ സംബന്ധമായ കുറ്റകൃത്യം': 'Women/Children Related Crime',
  'ഭീഷണിപ്പെടുത്തലും ബ്ലാക്ക് മെയിലിംഗും': 'Extortion & Blackmail',
  'ഐഡന്റിറ്റി മോഷണം': 'Identity Theft',
  'ഇ-കൊമേഴ്‌സ് തട്ടിപ്പുകൾ': 'E-Commerce Scams',
  'നിക്ഷേപ തട്ടിപ്പ്': 'Investment Scam',
  'മറ്റ് സൈബർ കുറ്റകൃത്യങ്ങൾ': 'Other Cyber Crime',

  // Punjabi
  'ਵਿੱਤੀ ਧੋਖਾਧੜੀ': 'Financial Fraud',
  'ਔਰਤਾਂ/ਬੱਚਿਆਂ ਨਾਲ ਸਬੰਧਤ ਅਪਰਾਧ': 'Women/Children Related Crime',
  'ਜਬਰੀ ਵਸੂਲੀ ਅਤੇ ਬਲੈਕਮੇਲ': 'Extortion & Blackmail',
  'ਪਛਾਣ ਦੀ ਚੋਰੀ': 'Identity Theft',
  'ਈ-ਕਾਮਰਸ ਘੁਟਾਲੇ': 'E-Commerce Scams',
  'ਨਿਵੇਸ਼ ਘੁਟਾਲਾ': 'Investment Scam',
  'ਹੋਰ ਸਾਈਬਰ ਅਪਰਾਧ': 'Other Cyber Crime'
}

export function normalizeCategoryHint(hint: string | null | undefined): FraudType | null {
  if (!hint) return null
  const trimmed = hint.trim()
  return MULTILINGUAL_CATEGORY_MAP[trimmed] || null
}

// 7. Multilingual Single-Word Greetings & Navigation Detector for WhatsApp
export const MULTILINGUAL_GREETINGS_OR_NAV_REGEX =
  /^(?:status|track|reset|\/reset|restart|clear|hi|hello|hey|hlo|hii|yes|no|[1-9]|1[0-2]|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣|🔟|1️⃣0️⃣|1️⃣1️⃣|1️⃣2️⃣|help|madad|namaste|pranam|সাহায্য|নমস্কার|मदत|नमस्कार|సహాయం|నమస్కారం|உதவி|வணக்கம்|મદદ|નમસ્તે|مدد|سلام|سلام علیکم|ಆದರ್ಶ|ಸಹಾಯ|ನಮಸ್ಕಾರ|ସାହାଯ୍ୟ|ନମସ୍କାର|സഹായം|നമസ്കാരം|ਮਦਦ|ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ)$/i

// 8. Official Regional State Police Complaint FIR Templates (for Fallback)
export function getRegionalComplaintDraft(
  lang: SupportedLanguage,
  complainantName: string,
  onBehalfOf: string | null,
  fraudType: string,
  incidentDetails: string,
  amount: number,
  utr?: string
): string {
  const lossText = amount > 0 ? `₹${amount.toLocaleString('en-IN')}` : ''
  const utrText = utr ? `(Ref/UTR: ${utr})` : ''

  switch (lang) {
    case 'bn':
      return `প্রতি,\nঅধ্যক্ষ মহাশয় / অফিসার-ইন-চার্জ,\nসাইবার ক্রাইম পুলিশ স্টেশন।\n\nবিষয়: ${fraudType} সংক্রান্ত আনুষ্ঠানিক সাইবার অপরাধ অভিযোগ।\n\nমাননীয় মহাশয়,\nআমি, ${complainantName}${onBehalfOf ? ` (${onBehalfOf}-এর পক্ষ থেকে)` : ''}, বিনীতভাবে জানাচ্ছি যে একটি সাইবার প্রতারণার ঘটনা ঘটেছে। ${lossText ? `এতে আর্থিক ক্ষতি হয়েছে: ${lossText} ${utrText}।` : ''}\n\nঘটনার বিবরণ:\n${incidentDetails}\n\nতথ্যপ্রযুক্তি আইন (IT Act 2000) ধারা ৬৬ডি ও প্রাসঙ্গিক ধারায় তদন্ত করে অপরাধীদের বিরুদ্ধে আইনানুগ ব্যবস্থা গ্রহণ এবং খোয়া যাওয়া অর্থ পুনরুদ্ধারের বিনীত অনুরোধ জানাচ্ছি।\n\nবিনীত,\n${complainantName}`

    case 'mr':
      return `प्रति,\nपोलीस निरीक्षक,\nसायबर क्राईम पोलीस ठाणे.\n\nविषय: ${fraudType} बाबत अधिकृत तक्रार नोंदवणेबाबत.\n\nमहोदय,\nमी, ${complainantName}${onBehalfOf ? ` (${onBehalfOf} यांच्या वतीने)` : ''}, या पत्राद्वारे कळवतो की माझ्यासोबत ऑनलाईन फसवणुकीची घटना घडली आहे. ${lossText ? `यात नुकसान झालेली रक्कम: ${lossText} ${utrText}.` : ''}\n\nघटनेचा तपशील:\n${incidentDetails}\n\nकृपया माहिती तंत्रज्ञान कायदा (IT Act) कलम ६६ डी व भारतीय न्याय संहितेनुसार त्वरित गुन्हा नोंदवून कारवाई करावी ही नम्र विनंती.\n\nआपला नम्र,\n${complainantName}`

    case 'te':
      return `స్వీకర్త,\nస్టేషన్ హౌస్ ఆఫీసర్,\nసైబర్ క్రైమ్ పోలీస్ స్టేషన్.\n\nవిషయం: ${fraudType} పై అధికారిక సైబర్ నేర ఫిర్యాదు.\n\nగౌరవనీయులైన అయ్యా/అమ్మా,\nనేను, ${complainantName}${onBehalfOf ? ` (${onBehalfOf} తరపున)` : ''}, ఈ క్రింది సైబర్ మోసం గురించి ఫిర్యాదు చేస్తున్నాను. ${lossText ? `నష్టపోయిన మొత్తం: ${lossText} ${utrText}.` : ''}\n\nసంఘటన వివరాలు:\n${incidentDetails}\n\nఐటీ చట్టం సెక్షన్ 66D కింద విచారణ జరిపి తగిన చట్టపరమైన చర్యలు తీసుకోవాలని కోరుతున్నాను.\n\nభవదీయుడు,\n${complainantName}`

    case 'ta':
      return `பெறுநர்,\nகாவல் நிலைய பொறுப்பு அதிகாரி,\nசைபர் கிரைம் காவல் நிலையம்.\n\nபொருள்: ${fraudType} தொடர்பான முறையான குற்றப் புகார்.\n\nமதிப்பிற்குரிய ஐயா,\nநான், ${complainantName}${onBehalfOf ? ` (${onBehalfOf} சார்பாக)` : ''}, இணையதள மோசடி குறித்து இப்புகாரைப் பதிவு செய்கிறேன். ${lossText ? `இழப்புத் தொகை: ${lossText} ${utrText}.` : ''}\n\nசம்பவ விவரம்:\n${incidentDetails}\n\nதகவல் தொழில்நுட்பச் சட்டம் (IT Act) பிரிவு 66D கீழ் உரிய நடவடிக்கை எடுத்து பணத்தை மீட்க உதவ வேண்டுகிறேன்.\n\nஇப்படிக்கு,\n${complainantName}`

    case 'gu':
      return `પ્રતિ,\nપોલીસ ઈન્સ્પેક્ટર સાહેબ,\nસાયબર ક્રાઈમ પોલીસ સ્ટેશન.\n\nવિષય: ${fraudType} અંગે ઔપચારિક સાયબર ફરિયાદ બાબત.\n\nમાનનીય સાહેબ,\nહું, ${complainantName}${onBehalfOf ? ` (${onBehalfOf} વતી)` : ''}, સાયબર છેતરપિંડી અંગે આ ફરિયાદ નોંધાવી રહ્યો છું. ${lossText ? `ગુમાવેલી રકમ: ${lossText} ${utrText}.` : ''}\n\nઘટનાની વિગતો:\n${incidentDetails}\n\nઆઈટી એક્ટ કલમ 66D હેઠળ તપાસ હાથ ધરી યોગ્ય કાયદેસર કાર્યવાહી કરવા નમ્ર વિનંતી છે.\n\nઆપનો વિશ્વાસુ,\n${complainantName}`

    case 'ur':
      return `بخدمت جناب،\nاسٹیشن ہاؤس آفیسر،\nسائبر کرائم پولیس اسٹیشن۔\n\nموضوع: ${fraudType} کے متعلق باضابطہ سائبر شکایت۔\n\nجناب عالی،\nمیں، ${complainantName}${onBehalfOf ? ` (${onBehalfOf} کی جانب سے)` : ''}، سائبر دھوکہ دہی کی شکایت درج کرا رہا ہوں۔ ${lossText ? `نقصان شدہ رقم: ${lossText} ${utrText}۔` : ''}\n\nواقعے کی تفصیل:\n${incidentDetails}\n\nآئی ٹی ایکٹ کی دفعہ 66D کے تحت قانونی کارروائی کی التماس ہے۔\n\nالعبد،\n${complainantName}`

    case 'kn':
      return `ರವರಿಗೆ,\nಠಾಣಾಧಿಕಾರಿಗಳು,\nಸೈಬರ್ ಕ್ರೈಮ್ ಪೊಲೀಸ್ ಠಾಣೆ.\n\nವಿಷಯ: ${fraudType} ಕುರಿತು ಅಧಿಕೃತ ದೂರು ದಾಖಲಿಸುವ ಬಗ್ಗೆ.\n\nಮಾನ್ಯರೇ,\nನಾನು, ${complainantName}${onBehalfOf ? ` (${onBehalfOf} ಅವರ ಪರವಾಗಿ)` : ''}, ಈ ಸೈಬರ್ ವಂಚನೆ ಕುರಿತು ದೂರು ನೀಡುತ್ತಿದ್ದೇನೆ. ${lossText ? `ಕಳೆದುಕೊಂಡ ಹಣ: ${lossText} ${utrText}.` : ''}\n\nಘಟನೆಯ ವಿವರ:\n${incidentDetails}\n\nಮಾಹಿತಿ ತಂತ್ರಜ್ಞಾನ ಕಾಯ್ದೆ ಕಲಂ 66D ಅಡಿಯಲ್ಲಿ ಕಾನೂನು ಕ್ರಮ ಕೈಗೊಳ್ಳಬೇಕಾಗಿ ವಿನಂತಿ.\n\nತಮ್ಮ ವಿಶ್ವಾಸಿ,\n${complainantName}`

    case 'or':
      return `ମାନ୍ୟବର,\nଥାନା ଅଧିକାରୀ,\nସାଇବର କ୍ରାଇମ ପୋଲିସ ଷ୍ଟେସନ।\n\nବିଷୟ: ${fraudType} ସମ୍ପର୍କରେ ଆନୁଷ୍ଠାନିକ ଅଭିଯୋଗ।\n\nମହାଶୟ,\nମୁଁ, ${complainantName}${onBehalfOf ? ` (${onBehalfOf} ଙ୍କ ତରଫରୁ)` : ''}, ସାଇବର ଠକେଇ ସମ୍ପର୍କରେ ଜଣାଉଛି। ${lossText ? `କ୍ଷତିଗ୍ରସ୍ତ ରାଶି: ${lossText} ${utrText}।` : ''}\n\nଘଟଣାର ବିବରଣୀ:\n${incidentDetails}\n\nଆଇଟି ଆକ୍ଟ ଧାରା 66D ଅନୁଯାୟୀ କାର୍ଯ୍ୟାନୁଷ୍ଠାନ ଗ୍ରହଣ କରିବାକୁ ବିନମ୍ର ପ୍ରାର୍ଥନା।\n\nଆପଣଙ୍କର ବିଶ୍ୱସ୍ତ,\n${complainantName}`

    case 'ml':
      return `ബഹുമാനപ്പെട്ട,\nസ്റ്റേഷൻ ഹൗസ് ഓഫീസർ,\nസൈബർ ക്രൈം പോലീസ് സ്റ്റേഷൻ.\n\nവിഷയം: ${fraudType} സംബന്ധിച്ച ഔദ്യോഗിക സൈബർ കുറ്റകൃത്യ പരാതി.\n\nബഹുമാനപ്പെട്ട സർ,\nഞാൻ, ${complainantName}${onBehalfOf ? ` (${onBehalfOf}-ന് വേണ്ടി)` : ''}, ഓൺലൈൻ തട്ടിപ്പ് സംബന്ധിച്ച് ഈ പരാതി സമർപ്പിക്കുന്നു. ${lossText ? `നഷ്ടപ്പെട്ട തുക: ${lossText} ${utrText}.` : ''}\n\nസംഭവ വിവരണം:\n${incidentDetails}\n\nഐടി നിയമം സെക്ഷൻ 66D പ്രകാരം നടപടി സ്വീകരിക്കണമെന്ന് അപേക്ഷിക്കുന്നു.\n\nവിശ്വസ്തതയോടെ,\n${complainantName}`

    case 'pa':
      return `ਸੇਵਾ ਵਿਖੇ,\nਮੁੱਖ ਅਫਸਰ (SHO),\nਸਾਈਬਰ ਕ੍ਰਾਈਮ ਪੁਲਿਸ ਸਟੇਸ਼ਨ।\n\nਵਿਸ਼ਾ: ${fraudType} ਸੰਬੰਧੀ ਰਸਮੀ ਸ਼ਿਕਾਇਤ।\n\nਜਨਾਬ,\nਮੈਂ, ${complainantName}${onBehalfOf ? ` (${onBehalfOf} ਵੱਲੋਂ)` : ''}, ਇਸ ਸਾਈਬਰ ਧੋਖਾਧੜੀ ਬਾਰੇ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰਵਾ ਰਿਹਾ ਹਾਂ। ${lossText ? `ਨੁਕਸਾਨ ਹੋਈ ਰਕਮ: ${lossText} ${utrText}।` : ''}\n\nਘਟਨਾ ਦਾ ਵੇਰਵਾ:\n${incidentDetails}\n\nਆਈਟੀ ਐਕਟ ਦੀ ਧਾਰਾ 66D ਤਹਿਤ ਕਾਨੂੰਨੀ ਕਾਰਵਾਈ ਕਰਕੇ ਨਿਆਂ ਦਿਵਾਇਆ ਜਾਵੇ।\n\nਤੁਹਾਡਾ ਸ਼ੁਭਚਿੰਤਕ,\n${complainantName}`

    default:
      return `To,\nThe Station House Officer,\nCyber Crime Police Station.\n\nSubject: Formal Cybercrime Complaint regarding ${fraudType}\n\nRespected Sir/Madam,\n\nI, ${complainantName}${onBehalfOf ? ` (on behalf of ${onBehalfOf})` : ''}, am lodging this formal complaint regarding cyber fraud. ${lossText ? `Financial loss incurred: ${lossText} ${utrText}.` : ''}\n\nIncident Details:\n${incidentDetails}\n\nPlease take immediate legal action under Section 66D of the IT Act 2000.\n\nYours faithfully,\n${complainantName}`
  }
}
