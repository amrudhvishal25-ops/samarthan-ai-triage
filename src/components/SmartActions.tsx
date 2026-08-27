import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Mail, Navigation, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react'

interface SmartActionsProps {
  bankName: string
  incidentId: string
  amount: number
  hi: boolean
  followUpPoints?: string[]
  onBankNotified?: () => void
  onPoliceRouted?: () => void
}

export default function SmartActions({ bankName, incidentId, amount, hi, followUpPoints = [], onBankNotified, onPoliceRouted }: SmartActionsProps) {
  const [locating, setLocating] = useState(false)
  const [policeStation, setPoliceStation] = useState<string | null>(null)
  const [bankNotified, setBankNotified] = useState(false)

  const handleBankEmail = () => {
    const bankMap: Record<string, string> = {
      'HDFC': 'cyberfraud@hdfcbank.com',
      'ICICI': 'antifraud@icicibank.com',
      'SBI': 'report.phishing@sbi.co.in',
      'Axis': 'nodal.officer@axisbank.com',
      'Kotak': 'fraud.control@kotak.com'
    }
    const cleanBankName = Object.keys(bankMap).find(k => bankName.toLowerCase().includes(k.toLowerCase())) || 'Unknown'
    const nodalEmail = cleanBankName !== 'Unknown' ? bankMap[cleanBankName] : 'nodal.officer@rbi.org.in'

    const subject = encodeURIComponent(`URGENT: Fraud Reporting - Incident ${incidentId}`)
    const followUpText = followUpPoints.length > 0
      ? `\n\nAdditional updates since filing:\n${followUpPoints.map(p => `- ${p}`).join('\n')}`
      : ''
    const body = encodeURIComponent(`Dear Nodal Officer,\n\nI am reporting a cyber fraud on my account.\nIncident ID: ${incidentId}\nAmount: Rs ${amount}\n\nPlease freeze the beneficiary account immediately.${followUpText}\n\nRegards,`)

    window.open(`mailto:${nodalEmail}?subject=${subject}&body=${body}`, '_blank')
    setBankNotified(true)
    onBankNotified?.()
  }

  const handleRoutePolice = () => {
    setLocating(true)
    // Simulate GPS fetch & API delay
    setTimeout(() => {
      // Pick a random station for demo
      const stations = ['Cyber Crime Station, Bandra', 'Cyber Cell, HSR Layout', 'Cyber Police, Connaught Place']
      setPoliceStation(stations[Math.floor(Math.random() * stations.length)])
      setLocating(false)
      onPoliceRouted?.()
    }, 2000)
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
        {hi ? 'स्मार्ट कार्रवाई' : 'Smart Escalation'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bank Email */}
        <button
          onClick={bankNotified ? undefined : handleBankEmail}
          disabled={bankNotified}
          className={`flex flex-col items-start gap-3 p-4 rounded-2xl border transition-all text-left ${bankNotified ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bankNotified ? 'bg-green-100' : 'bg-blue-100'}`}>
            {bankNotified ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Mail className="w-5 h-5 text-blue-600" />}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-1 flex items-center gap-1.5">
              {hi ? 'बैंक को ईमेल करें' : '1-Click Bank Email'}
              <span className="text-[9px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                {hi ? 'डेमो' : 'Simulated'}
              </span>
            </h4>
            {bankNotified ? (
              <p className="text-xs text-green-700 font-medium">{hi ? 'बैंक को सूचित किया गया (डेमो)' : 'Bank nodal officer notified (demo)'}</p>
            ) : (
              <p className="text-xs text-gray-500">{hi ? 'नोडल अधिकारी को ऑटो-ईमेल भेजें (डेमो नंबर)' : `Opens a drafted email to a demo nodal-officer address for ${bankName}`}</p>
            )}
          </div>
        </button>

        {/* Police Station */}
        <button 
          onClick={policeStation ? undefined : handleRoutePolice}
          disabled={locating || !!policeStation}
          className={`flex flex-col items-start gap-3 p-4 rounded-2xl border transition-all text-left ${policeStation ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-saffron hover:bg-orange-50/50'}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${policeStation ? 'bg-green-100' : 'bg-orange-100'}`}>
            {locating ? <Loader2 className="w-5 h-5 text-saffron animate-spin" /> : policeStation ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Navigation className="w-5 h-5 text-saffron" />}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-1 flex items-center gap-1.5">
              {hi ? 'पुलिस स्टेशन भेजें' : 'Route to Police'}
              <span className="text-[9px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                {hi ? 'डेमो' : 'Simulated'}
              </span>
            </h4>
            {locating ? (
              <p className="text-xs text-gray-500">{hi ? 'लोकेशन ट्रैक कर रहा है (डेमो)...' : 'Fetching GPS location (demo)...'}</p>
            ) : policeStation ? (
              <p className="text-xs text-green-700 font-medium">Routed to: {policeStation} (demo)</p>
            ) : (
              <p className="text-xs text-gray-500">{hi ? 'नजदीकी साइबर सेल को रिपोर्ट भेजें (डेमो)' : 'Simulates finding the nearest Cyber Cell'}</p>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}
