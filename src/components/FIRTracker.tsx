import React, { useState, useEffect } from 'react'
import { CheckCircle2, Clock, ShieldAlert } from 'lucide-react'

export default function FIRTracker({ hi }: { hi: boolean }) {
  const [currentStep, setCurrentStep] = useState(1)

  // Simulate progress over time
  useEffect(() => {
    const timer = setTimeout(() => setCurrentStep(2), 5000)
    return () => clearTimeout(timer)
  }, [])

  const steps = [
    { id: 1, title: hi ? 'रिपोर्ट बनाई गई' : 'Report Generated', desc: hi ? 'AI द्वारा सारांश तैयार' : 'AI generated official draft' },
    { id: 2, title: hi ? 'नोडल अधिकारी को भेजा गया' : 'Bank Nodal Notified', desc: hi ? 'खाता फ्रीज करने का अनुरोध' : 'Freeze request sent to bank' },
    { id: 3, title: hi ? 'FIR दर्ज (NCRP)' : 'NCRP FIR Registered', desc: hi ? 'साइबर सेल में रिपोर्ट दर्ज' : 'Awaiting police confirmation' },
    { id: 4, title: hi ? 'समाधान' : 'Resolution', desc: hi ? 'राशि वापस की गई' : 'Funds reversed/recovered' },
  ]

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wide">
        {hi ? 'FIR स्टेटस ट्रैकर' : 'Resolution Tracker'}
      </h3>
      
      <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
        {steps.map((step, idx) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isPending = step.id > currentStep
          
          return (
            <div key={step.id} className="relative pl-6">
              {/* Timeline dot */}
              <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white ${
                isCompleted ? 'border-green-500 bg-green-500' : 
                isCurrent ? 'border-blue-500 bg-blue-500 animate-pulse' : 
                'border-gray-300'
              }`} />
              
              <div className={isPending ? 'opacity-50' : ''}>
                <h4 className={`text-sm font-bold ${isCompleted ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-500'}`}>
                  {step.title}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
