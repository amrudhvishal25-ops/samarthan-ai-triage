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
  const hi = language === 'hi'
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
              {hi ? '100% पूर्ण' : '100% Complete'}
            </span>
          </div>
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mt-2 leading-relaxed">
            {hi
              ? 'आपकी शिकायत बैंक फ्रीज और पुलिस FIR के लिए पूरी तरह तैयार है!'
              : 'Your complaint is fully complete for emergency fund freezing and police FIR registration.'}
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
                  {hi ? 'अनिवार्य' : 'Required'}
                </span>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {filledCount} / {totalCount} {hi ? 'पूर्ण' : 'completed'}
                </span>
              </div>
              <h3 className="text-[15px] sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-1.5 leading-snug">
                {hi
                  ? 'कार्रवाई आवश्यक: फंड फ्रीज और FIR के लिए ये विवरण ज़रूरी हैं'
                  : 'Action required — details needed to freeze funds & file FIR'}
              </h3>
            </div>
          </div>

          {onScrollToUpdates && (
            <button
              type="button"
              onClick={onScrollToUpdates}
              className="self-start sm:self-center inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all shadow-sm flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 opacity-80" />
              <span>{hi ? 'ऑटो-फिल करें' : 'Auto-fill via Updates'}</span>
              <ArrowRight className="w-3 h-3" />
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
        {fields.map((f) => (
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
                  <span className={`font-medium leading-snug ${
                    f.isFilled
                      ? 'text-emerald-900 dark:text-emerald-200'
                      : 'text-zinc-800 dark:text-zinc-200'
                  }`}>
                    {hi ? f.labelHi : f.label}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${
                      f.isFilled
                        ? 'bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {f.isFilled ? (hi ? 'पूर्ण' : 'Done') : (hi ? 'बाकी' : 'Pending')}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed line-clamp-1">
                  {f.isFilled ? f.value : hi ? f.importanceHi : f.importance}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── AI hint footer ── */}
      <div className="px-5 sm:px-6 py-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
        <div className="flex items-start gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
          <p>
            {hi
              ? 'आसान तरीका: नीचे "नई जानकारी जोड़ें" में बस लिखें (जैसे: "मेरा UTR 482910394821 है, बैंक SBI") — AI अपने-आप भर देगा!'
              : 'Skip manual entry — type details naturally in Updates below (e.g. "UTR is 482910394821, bank is SBI") and AI auto-fills for you.'}
          </p>
        </div>
      </div>
    </div>
  )
}
