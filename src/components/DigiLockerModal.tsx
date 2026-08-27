'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldCheck, Loader2, CheckCircle2, Lock } from 'lucide-react'
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
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState(false)

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => { setStep('intro'); setOtp(''); setOtpError(false) }, 300)
    }
  }, [open])

  const handleRedirect = () => {
    setStep('redirecting')
    // Simulate the DigiLocker redirect + return
    setTimeout(() => setStep('otp'), 2200)
  }

  const handleOTPVerify = () => {
    if (otp === '123456' || otp.length === 6) {
      setStep('success')
      signIn()
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1800)
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
          >
            {step !== 'success' && (
              <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors h-auto min-h-0 z-10">
                <X className="w-4 h-4" />
              </button>
            )}

            <AnimatePresence mode="wait">

              {/* INTRO STEP */}
              {step === 'intro' && (
                <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-zinc-900">Sign in with DigiLocker</h2>
                      <p className="text-xs text-zinc-500">Government of India — MeitY</p>
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-5 space-y-2">
                    <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Why DigiLocker?</p>
                    <ul className="space-y-1.5">
                      {[
                        'Aadhaar-verified identity — no fake accounts',
                        'All complaints legally tied to your profile',
                        'Secure document vault for evidence',
                      ].map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-zinc-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 mb-4 text-xs text-zinc-500">
                    <Lock className="w-3 h-3" />
                    <span>Samarthan will only access your name and Aadhaar number.</span>
                  </div>

                  <button
                    onClick={handleRedirect}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3 font-semibold text-sm transition-all shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Continue with DigiLocker
                  </button>
                  <p className="text-center text-xs text-zinc-400 mt-3">
                    You will be redirected to digilocker.gov.in
                  </p>
                </motion.div>
              )}

              {/* REDIRECTING STEP */}
              {step === 'redirecting' && (
                <motion.div key="redirecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-8 flex flex-col items-center justify-center gap-4 min-h-[220px]">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center">
                      <ShieldCheck className="w-7 h-7 text-orange-500" />
                    </div>
                    <Loader2 className="w-14 h-14 text-orange-400 animate-spin absolute inset-0" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-zinc-900">Connecting to DigiLocker…</p>
                    <p className="text-xs text-zinc-400 mt-1">Redirecting to digilocker.gov.in for verification</p>
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

                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-4">
                    <p className="text-xs text-zinc-500 mb-1">Linked Aadhaar</p>
                    <p className="text-sm font-mono font-semibold text-zinc-900">XXXX-XXXX-8421</p>
                  </div>

                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                    6-Digit OTP
                  </label>
                  <input
                    type="number"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    placeholder="______"
                    className={`w-full border rounded-xl p-3 text-center text-2xl font-mono tracking-[0.5em] text-zinc-900 bg-zinc-50 outline-none focus:ring-2 transition-all ${otpError ? 'border-red-400 focus:ring-red-200' : 'border-zinc-200 focus:ring-zinc-900'}`}
                  />
                  {otpError && <p className="text-xs text-red-500 mt-1">Incorrect OTP. Try again.</p>}
                  <p className="text-xs text-zinc-400 mt-2 mb-5">Hint: use any 6-digit number (demo mode)</p>

                  <button
                    onClick={handleOTPVerify}
                    disabled={otp.length < 6}
                    className="w-full bg-zinc-900 hover:bg-zinc-700 disabled:opacity-40 text-white rounded-xl py-3 font-semibold text-sm transition-all"
                  >
                    Verify & Sign In
                  </button>
                </motion.div>
              )}

              {/* SUCCESS STEP */}
              {step === 'success' && (
                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-8 flex flex-col items-center justify-center gap-4 min-h-[220px]">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-9 h-9 text-green-600" />
                    </div>
                  </motion.div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-zinc-900">Verified Successfully</p>
                    <p className="text-xs text-zinc-500 mt-1">Welcome, Pratham Kamath</p>
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
