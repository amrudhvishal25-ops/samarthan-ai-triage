'use client'

import React, { useRef, useState } from 'react'
import { ShieldCheck, Lock, Plus, X, Loader2, ImageOff } from 'lucide-react'
import { EvidenceImage } from '@/hooks/useComplaints'
import { SupportedLanguage } from '@/lib/i18n/languages'
import { EVIDENCE_VAULT_I18N } from '@/lib/i18n/componentTranslations'

interface EvidenceVaultProps {
  hi?: boolean
  language?: SupportedLanguage
  images: EvidenceImage[]
  onAdd: (file: File) => Promise<void> | void
  onRemove: (imageId: string) => Promise<void> | void
}

export default function EvidenceVault({ hi, language, images, onAdd, onRemove }: EvidenceVaultProps) {
  const lang: SupportedLanguage = language || (hi ? 'hi' : 'en')
  const loc = EVIDENCE_VAULT_I18N[lang] || EVIDENCE_VAULT_I18N.en
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<EvidenceImage | null>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        await onAdd(file)
      }
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm relative overflow-hidden">
      {/* Subtle decorative background watermark */}
      <Lock className="w-36 h-36 text-zinc-100 dark:text-zinc-800/30 absolute -right-8 -bottom-8 pointer-events-none select-none transition-colors" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            {loc.header}
          </h3>
          <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {loc.badge}
          </span>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 max-w-sm leading-relaxed">
          {loc.subtitle}
        </p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />

        {images.length === 0 ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full h-24 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-500 bg-zinc-50/70 hover:bg-zinc-100/70 dark:bg-zinc-950/60 dark:hover:bg-zinc-800/40 flex flex-col items-center justify-center gap-1.5 text-zinc-400 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all cursor-pointer"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <ImageOff className="w-5 h-5" />}
            <span className="text-xs font-medium">
              {uploading ? loc.uploading : loc.addEvidence}
            </span>
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {images.map(img => (
              <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setPreview(img)}
                />
                <button
                  type="button"
                  onClick={() => onRemove(img.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-zinc-50/70 hover:bg-zinc-100/70 dark:bg-zinc-950/60 dark:hover:bg-zinc-800/40 flex items-center justify-center text-zinc-400 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all cursor-pointer"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setPreview(null)}
        >
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <img src={preview.dataUrl} alt={preview.name} className="max-w-full max-h-full rounded-xl shadow-2xl" />
        </div>
      )}
    </div>
  )
}
