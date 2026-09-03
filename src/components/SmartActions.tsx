import React, { useState } from 'react'
import {
  Mail, Navigation, CheckCircle2, Loader2, Phone, ExternalLink,
  Instagram, Landmark,
} from 'lucide-react'
import { RecommendedChannel } from '@/data/scenarios'
import { getEscalationChannel } from '@/data/escalationChannels'

interface SmartActionsProps {
  bankName: string
  incidentId: string
  amount: number
  hi: boolean
  victimName?: string
  summary?: string
  recommendedChannel?: RecommendedChannel
  recommendedChannelTarget?: string
  followUpPoints?: string[]
  onBankNotified?: () => void
  onPlatformReported?: () => void
  onPoliceRouted?: () => void
}

const BANK_EMAIL_MAP: Record<string, string> = {
  'HDFC': 'cyberfraud@hdfcbank.com',
  'ICICI': 'antifraud@icicibank.com',
  'SBI': 'report.phishing@sbi.co.in',
  'Axis': 'nodal.officer@axisbank.com',
  'Kotak': 'fraud.control@kotak.com',
}

export default function SmartActions({
  bankName, incidentId, amount, hi, victimName, summary,
  recommendedChannel, recommendedChannelTarget,
  followUpPoints = [], onBankNotified, onPlatformReported, onPoliceRouted,
}: SmartActionsProps) {
  const [locating, setLocating] = useState(false)
  const [policeStation, setPoliceStation] = useState<string | null>(null)
  const [primaryDone, setPrimaryDone] = useState(false)

  const ch = getEscalationChannel(recommendedChannel, recommendedChannelTarget)
  const followUpText = followUpPoints.length > 0
    ? `\n\nAdditional updates since filing:\n${followUpPoints.map(p => `- ${p}`).join('\n')}`
    : ''

  const handleBankEmail = () => {
    const cleanBankName = Object.keys(BANK_EMAIL_MAP).find(k => bankName.toLowerCase().includes(k.toLowerCase())) || 'Unknown'
    const nodalEmail = cleanBankName !== 'Unknown' ? BANK_EMAIL_MAP[cleanBankName] : 'nodal.officer@rbi.org.in'
    const subject = encodeURIComponent(`URGENT: Fraud Reporting - Incident ${incidentId}`)
    const body = encodeURIComponent(`Dear Nodal Officer,\n\nI am reporting a cyber fraud on my account.\nIncident ID: ${incidentId}\nAmount: Rs ${amount}\n\nPlease freeze the beneficiary account immediately.${followUpText}\n\nRegards,`)
    window.open(`mailto:${nodalEmail}?subject=${subject}&body=${body}`, '_blank')
    setPrimaryDone(true)
    onBankNotified?.()
  }

  const handlePlatformOrAgencyReport = () => {
    // Simulated: draft a report body and copy it. Live version has the AI
    // pre-fill and submit the actual platform / agency report.
    const target = recommendedChannelTarget || 'the platform'
    const offender = victimName && victimName !== 'Not Identified' ? victimName : 'the reported account'
    const draft = [
      `Report to: ${target}`,
      `Incident ID: ${incidentId}`,
      `Reported account / entity: ${offender}`,
      summary ? `\nWhat happened:\n${summary}` : '',
      followUpText,
      `\nRequested action: Take down / block the account and preserve records for law enforcement (NCRP).`,
    ].join('\n')
    navigator.clipboard?.writeText(draft).catch(() => {})
    if (ch.portalUrl) window.open(ch.portalUrl, '_blank', 'noopener,noreferrer')
    setPrimaryDone(true)
    onPlatformReported?.()
  }

  const handleRoutePolice = () => {
    setLocating(true)
    setTimeout(() => {
      const stations = ['Cyber Crime Station, Bandra', 'Cyber Cell, HSR Layout', 'Cyber Police, Connaught Place']
      setPoliceStation(stations[Math.floor(Math.random() * stations.length)])
      setLocating(false)
      onPoliceRouted?.()
    }, 2000)
  }

  const kind = ch.kind
  const primaryIcon = primaryDone
    ? <CheckCircle2 className="w-5 h-5 text-green-600" />
    : kind === 'bank' ? <Mail className="w-5 h-5 text-blue-600" />
    : kind === 'platform' ? <Instagram className="w-5 h-5 text-pink-600" />
    : kind === 'agency' ? <Landmark className="w-5 h-5 text-indigo-600" />
    : <Phone className="w-5 h-5 text-blue-600" />

  const primaryAction = kind === 'bank' ? handleBankEmail : handlePlatformOrAgencyReport
  const primaryDoneText = kind === 'bank'
    ? (hi ? 'बैंक को सूचित किया गया (डेमो)' : 'Bank nodal officer notified (demo)')
    : (hi ? 'रिपोर्ट का मसौदा तैयार — क्लिपबोर्ड पर कॉपी (डेमो)' : 'Report drafted & copied to clipboard (demo)')

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-wide">
        {hi ? 'स्मार्ट कार्रवाई' : 'Smart Escalation'}
      </h3>
      <p className="text-xs text-gray-500 mb-4">{hi ? ch.descHi : ch.desc}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary channel-driven action */}
        <button
          onClick={primaryDone ? undefined : primaryAction}
          disabled={primaryDone}
          className={`flex flex-col items-start gap-3 p-4 rounded-2xl border transition-all text-left ${primaryDone ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${primaryDone ? 'bg-green-100' : kind === 'platform' ? 'bg-pink-100' : kind === 'agency' ? 'bg-indigo-100' : 'bg-blue-100'}`}>
            {primaryIcon}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-1 flex items-center gap-1.5">
              {hi ? ch.titleHi : ch.title}
              <span className="text-[9px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                {hi ? 'डेमो' : 'Simulated'}
              </span>
            </h4>
            {primaryDone ? (
              <p className="text-xs text-green-700 font-medium">{primaryDoneText}</p>
            ) : (
              <p className="text-xs text-gray-500">
                {kind === 'bank'
                  ? (hi ? `${bankName} के नोडल अधिकारी को ड्राफ्ट ईमेल खोलें (डेमो पता)` : `Opens a drafted email to a demo nodal-officer address for ${bankName}`)
                  : (hi ? `${recommendedChannelTarget || 'प्लेटफ़ॉर्म'} के लिए रिपोर्ट का मसौदा तैयार करें` : `Drafts a takedown report for ${recommendedChannelTarget || 'the platform'}`)}
              </p>
            )}
          </div>
        </button>

        {/* Route to Police — always available */}
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

      {/* Real helpline numbers + portal for this route */}
      {(ch.hotline || ch.portalUrl) && (
        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1">
            {hi ? 'असली संपर्क' : 'Real contacts'}
          </span>
          {ch.hotline && (
            <a href={`tel:${ch.hotline}`} className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              {hi ? ch.hotlineLabelHi : ch.hotlineLabel}
            </a>
          )}
          {ch.hotline2 && (
            <a href={`tel:${ch.hotline2}`} className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              {hi ? ch.hotline2LabelHi : ch.hotline2Label}
            </a>
          )}
          {ch.portalUrl && (
            <a href={ch.portalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 border border-gray-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              {hi ? ch.portalLabelHi : ch.portalLabel}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
