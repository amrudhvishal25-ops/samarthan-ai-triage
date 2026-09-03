import { RecommendedChannel, FraudType } from './scenarios'

// Fallback route inference from the fraud category, used when a persisted
// complaint predates recommendedChannel (older records don't store it).
export function inferChannelFromFraudType(
  fraudType: FraudType,
): { channel: RecommendedChannel; target: string } {
  switch (fraudType) {
    case 'Women/Children Related Crime':
    case 'Hate Speech':
    case 'Online Ragging':
    case 'Extortion & Blackmail':
      return { channel: 'platform', target: 'the platform' }
    case 'Identity Theft':
      return { channel: 'agency', target: 'UIDAI' }
    case 'Investment Scam':
      return { channel: 'agency', target: 'RBI Sachet' }
    case 'E-Commerce Scams':
    case 'Job Scam':
      return { channel: 'agency', target: 'National Consumer Helpline' }
    case 'Financial Fraud':
    case 'UPI Fraud':
    case 'OTP Fraud':
    case 'Fake Customer Care':
      return { channel: 'bank', target: 'the bank' }
    default:
      return { channel: 'helpline', target: '1930' }
  }
}

// Presentation details for each escalation route. The *decision* of which route
// applies is made by the triage AI (see recommendedChannel in the triage prompt);
// this file only supplies the card copy, real helpline numbers, and portal links
// the dashboard renders for that route.
//
// Helpline numbers and portals verified Sept 2026:
//   1930  — National Cyber Crime Helpline (24x7), financial fraud
//   155260 — older cybercrime helpline (still routed)
//   1098  — Childline, child in need of care/protection
//   181   — Women Helpline (national, 24x7)
//   14490 — National Commission for Women helpline
//   1947  — UIDAI Aadhaar helpline (SMS 1947 to lock Aadhaar)
//   1915  — National Consumer Helpline (SMS 8800001915)

export interface EscalationChannelCopy {
  kind: RecommendedChannel
  /** Primary action button label. */
  title: string
  titleHi: string
  /** One-line explanation shown under the section heading. */
  desc: string
  descHi: string
  /** Real phone number to expose as a tel: link, if any. */
  hotline?: string
  hotlineLabel?: string
  hotlineLabelHi?: string
  /** Secondary real number (e.g. Women Helpline alongside Childline). */
  hotline2?: string
  hotline2Label?: string
  hotline2LabelHi?: string
  /** Official portal to open (guidance — most NCRP flows are JS postbacks). */
  portalUrl?: string
  portalLabel?: string
  portalLabelHi?: string
}

const CYBERCRIME_PORTAL = 'https://cybercrime.gov.in/'

/** Case-insensitive substring match against the AI-provided target. */
function targetIs(target: string | undefined, ...needles: string[]): boolean {
  if (!target) return false
  const t = target.toLowerCase()
  return needles.some((n) => t.includes(n))
}

const HELPLINE: EscalationChannelCopy = {
  kind: 'helpline',
  title: 'Call 1930 — Cyber Helpline',
  titleHi: '1930 पर कॉल करें — साइबर हेल्पलाइन',
  desc: 'Report this incident to the national cybercrime helpline and file on the NCRP portal.',
  descHi: 'इस घटना की राष्ट्रीय साइबर हेल्पलाइन पर रिपोर्ट करें और NCRP पोर्टल पर दर्ज करें।',
  hotline: '1930',
  hotlineLabel: 'Cyber Helpline 1930',
  hotlineLabelHi: 'साइबर हेल्पलाइन 1930',
  portalUrl: CYBERCRIME_PORTAL,
  portalLabel: 'Open cybercrime.gov.in',
  portalLabelHi: 'cybercrime.gov.in खोलें',
}

const BANK: EscalationChannelCopy = {
  kind: 'bank',
  title: '1-Click Bank Email',
  titleHi: 'बैंक को ईमेल करें',
  desc: 'This is bank / UPI fraud — notify the bank nodal officer and call 1930 within the golden hour.',
  descHi: 'यह बैंक / UPI धोखाधड़ी है — बैंक नोडल अधिकारी को सूचित करें और गोल्डन ऑवर में 1930 पर कॉल करें।',
  hotline: '1930',
  hotlineLabel: 'Cyber Helpline 1930',
  hotlineLabelHi: 'साइबर हेल्पलाइन 1930',
}

export function getEscalationChannel(
  channel: RecommendedChannel | undefined,
  target: string | undefined,
): EscalationChannelCopy {
  switch (channel) {
    case 'bank':
      return BANK

    case 'platform': {
      const name = target && target !== 'Not Provided' ? target : 'the platform'
      return {
        kind: 'platform',
        title: `Report to ${name}`,
        titleHi: `${name} को रिपोर्ट करें`,
        desc: `This is online harassment / impersonation — report the account to ${name} and the cyber cell's Women & Child wing.`,
        descHi: `यह ऑनलाइन उत्पीड़न / प्रतिरूपण है — खाते की ${name} और साइबर सेल की महिला व बाल शाखा को रिपोर्ट करें।`,
        hotline: '1098',
        hotlineLabel: 'Childline 1098',
        hotlineLabelHi: 'चाइल्डलाइन 1098',
        hotline2: '181',
        hotline2Label: 'Women Helpline 181',
        hotline2LabelHi: 'महिला हेल्पलाइन 181',
        portalUrl: CYBERCRIME_PORTAL,
        portalLabel: 'NCRP — Report Crime against Women / Child',
        portalLabelHi: 'NCRP — महिला / बाल अपराध रिपोर्ट करें',
      }
    }

    case 'agency': {
      if (targetIs(target, 'uidai', 'aadhaar')) {
        return {
          kind: 'agency',
          title: 'Escalate to UIDAI',
          titleHi: 'UIDAI को भेजें',
          desc: 'Your Aadhaar is being misused — lock your Aadhaar with UIDAI and report the identity theft.',
          descHi: 'आपके आधार का दुरुपयोग हो रहा है — UIDAI के साथ आधार लॉक करें और पहचान की चोरी की रिपोर्ट करें।',
          hotline: '1947',
          hotlineLabel: 'UIDAI Helpline 1947',
          hotlineLabelHi: 'UIDAI हेल्पलाइन 1947',
          portalUrl: 'https://resident.uidai.gov.in/aadhaar-lockunlock',
          portalLabel: 'UIDAI — Lock / Unlock Aadhaar',
          portalLabelHi: 'UIDAI — आधार लॉक / अनलॉक',
        }
      }
      if (targetIs(target, 'income tax', 'pan')) {
        return {
          kind: 'agency',
          title: 'Report PAN misuse — Income Tax',
          titleHi: 'PAN दुरुपयोग रिपोर्ट करें — आयकर',
          desc: 'Your PAN is being misused — raise a grievance on the Income Tax portal and file the identity theft complaint.',
          descHi: 'आपके PAN का दुरुपयोग हो रहा है — आयकर पोर्टल पर शिकायत दर्ज करें और पहचान चोरी की शिकायत करें।',
          hotline: '1930',
          hotlineLabel: 'Cyber Helpline 1930',
          hotlineLabelHi: 'साइबर हेल्पलाइन 1930',
          portalUrl: 'https://www.incometax.gov.in/',
          portalLabel: 'Income Tax — Grievance',
          portalLabelHi: 'आयकर — शिकायत',
        }
      }
      if (targetIs(target, 'sachet', 'rbi', 'deposit', 'investment')) {
        return {
          kind: 'agency',
          title: 'Report to RBI Sachet',
          titleHi: 'RBI सचेत को रिपोर्ट करें',
          desc: 'This is an unregistered investment / deposit scheme — report the entity on RBI Sachet and call 1930.',
          descHi: 'यह एक अपंजीकृत निवेश / जमा योजना है — RBI सचेत पर संस्था की रिपोर्ट करें और 1930 पर कॉल करें।',
          hotline: '1930',
          hotlineLabel: 'Cyber Helpline 1930',
          hotlineLabelHi: 'साइबर हेल्पलाइन 1930',
          portalUrl: 'https://sachet.rbi.org.in/',
          portalLabel: 'RBI Sachet — Help Your Regulator',
          portalLabelHi: 'RBI सचेत — Help Your Regulator',
        }
      }
      // Default agency = e-commerce / marketplace non-delivery
      return {
        kind: 'agency',
        title: 'File with Consumer Helpline',
        titleHi: 'उपभोक्ता हेल्पलाइन में दर्ज करें',
        desc: 'This is a marketplace / delivery scam — file with the National Consumer Helpline and call 1930 if money was lost.',
        descHi: 'यह एक मार्केटप्लेस / डिलीवरी घोटाला है — राष्ट्रीय उपभोक्ता हेल्पलाइन में दर्ज करें और पैसा गया हो तो 1930 पर कॉल करें।',
        hotline: '1915',
        hotlineLabel: 'Consumer Helpline 1915',
        hotlineLabelHi: 'उपभोक्ता हेल्पलाइन 1915',
        portalUrl: 'https://consumerhelpline.gov.in/',
        portalLabel: 'National Consumer Helpline',
        portalLabelHi: 'राष्ट्रीय उपभोक्ता हेल्पलाइन',
      }
    }

    case 'helpline':
    default:
      return HELPLINE
  }
}
