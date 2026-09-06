'use client'

import { AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { TriageResult } from '@/data/scenarios'

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

interface CompulsoryDetailsReminderProps {
  triageResult: TriageResult
  language: 'en' | 'hi'
  onScrollToUpdates?: () => void
}

export default function CompulsoryDetailsReminder({
  triageResult,
  language,
  onScrollToUpdates,
}: CompulsoryDetailsReminderProps) {
  const hi = language === 'hi'
  const fields = getCompulsoryFields(triageResult)
  const filledCount = fields.filter((f) => f.isFilled).length
  const totalCount = fields.length
  const missingCount = totalCount - filledCount
  const percent = Math.round((filledCount / totalCount) * 100)

  if (missingCount === 0) {
    return (
      <div className="rounded-lg bg-emerald-50/80 border border-emerald-200 p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
        <div className="w-9 h-9 rounded-md bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
              {hi ? '100% पूर्ण' : '100% Complete'}
            </span>
            <span className="text-xs text-emerald-700 font-medium">
              {hi ? 'सभी अनिवार्य विवरण भरे गए हैं' : 'All compulsory details provided'}
            </span>
          </div>
          <p className="text-sm font-bold text-emerald-950 mt-1">
            {hi
              ? 'आपकी शिकायत बैंक फ्रीज और पुलिस FIR के लिए पूरी तरह तैयार है!'
              : 'Your complaint is 100% complete for emergency fund freezing and police FIR registration.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-amber-50/90 border border-amber-300 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200/70">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-md bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-extrabold uppercase tracking-wide bg-amber-200/90 text-amber-900 px-2.5 py-0.5 rounded-sm">
                {hi ? 'महत्वपूर्ण अनुस्मारक' : 'Compulsory Checklist'}
              </span>
              <span className="text-xs font-bold text-amber-900">
                {filledCount} / {fields.length} {hi ? 'विवरण भरे गए' : 'Details Completed'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 mt-1">
              {hi
                ? 'कार्रवाई आवश्यक: पुलिस FIR व बैंक लियन के लिए ये विवरण भरें'
                : 'Action Required: Compulsory details needed to freeze funds & register FIR'}
            </h3>
          </div>
        </div>

        {onScrollToUpdates && (
          <button
            type="button"
            onClick={onScrollToUpdates}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all shadow-sm flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{hi ? 'अपडेट्स में लिखकर ऑटो-फिल करें' : 'Auto-fill via Updates'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-amber-200/60 h-2 rounded-full mt-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-4">
        {fields.map((f) => (
          <div
            key={f.key}
            className={`p-3 rounded-md border transition-all text-xs flex items-start gap-2.5 ${
              f.isFilled
                ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-900'
                : 'bg-white border-amber-300 text-zinc-800 shadow-xs'
            }`}
          >
            {f.isFilled ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-sm border-2 border-amber-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className={`font-semibold ${f.isFilled ? 'text-emerald-950' : 'text-zinc-900'}`}>
                  {hi ? f.labelHi : f.label}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-sm ${
                    f.isFilled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {f.isFilled ? (hi ? 'पूर्ण' : 'Filled') : (hi ? 'बाकी' : 'Pending')}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">
                {f.isFilled ? `Value: ${f.value}` : hi ? f.importanceHi : f.importance}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Smart Auto-fill hint */}
      <div className="mt-4 pt-3 border-t border-amber-200/70 flex items-center gap-2 text-xs text-amber-900">
        <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="leading-relaxed">
          {hi
            ? '💡 आसान तरीका: फॉर्म एडिट करने की जगह नीचे "नई जानकारी जोड़ें" (Updates) में बस लिखें (जैसे: "मेरा UTR 482910394821 है और बैंक SBI है") — AI अपने-आप इन खानों को भर देगा!'
            : '💡 Fast AI Auto-Fill: Instead of filling manually, just type a quick note in the Updates section below (e.g. "My UTR is 482910394821 and bank is SBI") — our AI will automatically extract and fill these sections for you!'}
        </p>
      </div>
    </div>
  )
}
