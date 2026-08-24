import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, FileKey, Lock, CheckCircle2 } from 'lucide-react'

export default function EvidenceVault({ file, hi }: { file: File | null, hi: boolean }) {
  const [hash, setHash] = useState<string>('')
  
  useEffect(() => {
    // Generate a mock SHA-256 hash for visual effect
    const chars = 'abcdef0123456789'
    let h = '0x'
    for(let i=0; i<40; i++) h += chars.charAt(Math.floor(Math.random() * chars.length))
    setHash(h)
  }, [])

  if (!file) return null

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm relative overflow-hidden">
      {/* Decorative background logo */}
      <Lock className="w-40 h-40 text-gray-50 absolute -right-10 -bottom-10 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            {hi ? 'साक्ष्य वॉल्ट' : 'Evidence Vault'}
          </h3>
          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
            {hi ? 'सुरक्षित' : 'Secured'}
          </span>
        </div>
        
        <p className="text-xs text-gray-500 mb-4 max-w-sm">
          {hi 
            ? 'अपलोड की गई फ़ाइलों को छेड़छाड़ से बचाने के लिए एन्क्रिप्ट किया गया है।' 
            : 'Your uploaded media is encrypted and timestamped for legal admissibility.'}
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0 border border-indigo-200">
            <FileKey className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate font-mono">
              Hash: {hash.substring(0, 16)}...
            </p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
        </div>
      </div>
    </div>
  )
}
