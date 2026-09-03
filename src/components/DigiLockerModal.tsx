'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldCheck, Loader2, CheckCircle2, Lock, User, CreditCard } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface DigiLockerModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

type Step = 'intro' | 'redirecting' | 'otp' | 'success'

export default function DigiLockerModal({ open, onClose, onSuccess }: DigiLockerModalProps) {
  const { signIn } = useAuth()
  const [step, setStep] = useState<Step>('intro')
  const [name, setName] = useState('')
  const [aadhaar, setAadhaar] = useState('')
  const [nameError, setNameError] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState(false)

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('intro')
        setName('')
        setAadhaar('')
        setNameError(false)
        setOtp('')
        setOtpError(false)
      }, 300)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const getMaskedAadhaar = () => {
    const clean = aadhaar.replace(/\D/g, '')
    if (clean.length >= 4) {
      return `****-****-${clean.slice(-4)}`
    }
    return '****-****-8421'
  }

  const handleStartAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setNameError(true)
      return
    }
    setNameError(false)
    setStep('redirecting')
    setTimeout(() => setStep('otp'), 1800)
  }

  const handleOTPVerify = () => {
    if (otp.length === 6) {
      setStep('success')
      const user = signIn({
        name: name.trim(),
        aadhaar: getMaskedAadhaar(),
      })
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1600)
    } else {
      setOtpError(true)
      setTimeout(() => setOtpError(false), 1500)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={step === 'intro' ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-md overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            {step !== 'success' && (
              <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors h-auto min-h-0 z-10">
                <X className="w-4 h-4" />
              </button>
            )}

            <AnimatePresence mode="wait">

              {/* INTRO / MOCK SIGN IN STEP */}
              {step === 'intro' && (
                <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-zinc-900">Sign in with DigiLocker</h2>
                      <p className="text-xs text-zinc-500">Government of India — MeitY Sandbox</p>
                    </div>
                  </div>

                  <form onSubmit={handleStartAuth} className="space-y-4 mb-4">
                    <div>
                      <label htmlFor="digilocker-name" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                        Your Full Name (As per Govt ID) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                        <input
                          id="digilocker-name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => { setName(e.target.value); setNameError(false) }}
                          placeholder="e.g. Parichay Prabhu"
                          className={`w-full border rounded-xl pl-9.5 pr-3 py-2.5 text-sm text-zinc-900 bg-zinc-50 outline-none focus:ring-2 transition-all ${nameError ? 'border-red-400 focus:ring-red-200' : 'border-zinc-200 focus:ring-zinc-900'}`}
                        />
                      </div>
                      {nameError && <p className="text-xs text-red-500 mt-1">Please enter your name to verify identity.</p>}
                    </div>

                    <div>
                      <label htmlFor="digilocker-aadhaar" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                        Aadhaar / DigiLocker ID
                      </label>
                      <div className="relative">
                        <CreditCard className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                        <input
                          id="digilocker-aadhaar"
                          type="text"
                          value={aadhaar}
                          onChange={(e) => setAadhaar(e.target.value)}
                          placeholder="e.g. 5432 9876 1234 (optional)"
                          className="w-full border border-zinc-200 rounded-xl pl-9.5 pr-3 py-2.5 text-sm text-zinc-900 bg-zinc-50 outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                        />
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">Leave blank to use default masked ID ****-****-8421</p>
                    </div>

                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 space-y-1">
                      <p className="text-xs font-semibold text-orange-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                        Aadhaar KYC Verification
                      </p>
                      <p className="text-[11px] text-zinc-600">
                        Formal police complaint drafts & statements will be filed with this verified name.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3 font-semibold text-sm transition-all shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Continue with DigiLocker
                    </button>
                  </form>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
                    <Lock className="w-3 h-3" />
                    <span>256-bit encrypted DigiLocker mock sandbox</span>
                  </div>
                </motion.div>
              )}

              {/* REDIRECTING STEP */}
              {step === 'redirecting' && (
                <motion.div key="redirecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-8 flex flex-col items-center justify-center gap-4 min-h-[240px]">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center">
                      <ShieldCheck className="w-7 h-7 text-orange-500" />
                    </div>
                    <Loader2 className="w-14 h-14 text-orange-400 animate-spin absolute inset-0" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-zinc-900">Connecting to DigiLocker…</p>
                    <p className="text-xs text-zinc-500 mt-1">Requesting OTP authentication for <strong className="text-zinc-800">{name}</strong></p>
                  </div>
                </motion.div>
              )}

              {/* OTP STEP */}
              {step === 'otp' && (
                <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-zinc-900">Aadhaar OTP Verification</h2>
                      <p className="text-xs text-zinc-500">Enter the OTP sent to your registered mobile</p>
                    </div>
                  </div>

                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 mb-4 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Citizen:</span>
                      <span className="font-semibold text-zinc-900">{name}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Linked Aadhaar:</span>
                      <span className="font-mono font-semibold text-zinc-900">{getMaskedAadhaar()}</span>
                    </div>
                  </div>

                  <label htmlFor="otp-input" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                    6-Digit OTP
                  </label>
                  <input
                    id="otp-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    placeholder="______"
                    className={`w-full border rounded-xl p-3 text-center text-2xl font-mono tracking-[0.5em] text-zinc-900 bg-zinc-50 outline-none focus:ring-2 transition-all ${otpError ? 'border-red-400 focus:ring-red-200' : 'border-zinc-200 focus:ring-zinc-900'}`}
                  />
                  {otpError && <p className="text-xs text-red-500 mt-1">Please enter 6 digits.</p>}
                  <p className="text-xs text-zinc-400 mt-2 mb-5">Hint: enter any 6-digit code (e.g. 123456)</p>

                  <button
                    onClick={handleOTPVerify}
                    disabled={otp.length < 6}
                    className="w-full bg-zinc-900 hover:bg-zinc-700 disabled:opacity-40 text-white rounded-xl py-3 font-semibold text-sm transition-all"
                  >
                    Verify & Complete Sign In
                  </button>
                </motion.div>
              )}

              {/* SUCCESS STEP */}
              {step === 'success' && (
                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-8 flex flex-col items-center justify-center gap-4 min-h-[240px]">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-9 h-9 text-green-600" />
                    </div>
                  </motion.div>
                  <div className="text-center">
                    <p className="text-base font-bold text-zinc-900">Verified via DigiLocker</p>
                    <p className="text-sm font-semibold text-green-700 mt-0.5">Welcome, {name}</p>
                    <p className="text-xs text-zinc-400 mt-1">ID: {getMaskedAadhaar()}</p>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

