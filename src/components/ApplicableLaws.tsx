import { Scale } from 'lucide-react'
import { ApplicableLaw } from '@/data/scenarios'

interface ApplicableLawsProps {
  laws: ApplicableLaw[]
  hi: boolean
}

export default function ApplicableLaws({ laws, hi }: ApplicableLawsProps) {
  if (laws.length === 0) return null

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
          <Scale className="w-4 h-4 text-indigo-500" />
          {hi ? 'लागू कानून' : 'Applicable Laws'}
        </h3>
        <span className="text-[9px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
          {hi ? 'AI सुझाव' : 'AI Suggested'}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        {hi
          ? 'इस घटना के आधार पर, ये कानूनी प्रावधान लागू हो सकते हैं। एस्केलेशन से पहले वकील या पुलिस से पुष्टि करें।'
          : 'Based on this incident, these provisions may apply. Confirm with an advocate or the police before escalating.'}
      </p>

      <div className="space-y-3">
        {laws.map((law, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl p-3.5 bg-slate-50">
            <span className="inline-block text-xs font-bold font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-2 py-0.5 mb-1.5">
              {law.section}
            </span>
            <p className="text-sm font-semibold text-gray-900 leading-snug">
              {hi ? law.titleHi : law.title}
            </p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {hi ? law.reasonHi : law.reason}
            </p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-gray-400 mt-4 pt-3 border-t border-dashed border-gray-200">
        {hi
          ? '⚠ यह कानूनी सलाह नहीं है। केवल संदर्भ के लिए — Information Technology Act, 2000 पर आधारित।'
          : '⚠ Not legal advice. For reference only — based on the Information Technology Act, 2000.'}
      </p>
    </div>
  )
}
