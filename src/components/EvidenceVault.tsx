'use client'

import React, { useRef, useState } from 'react'
import { ShieldCheck, Lock, Plus, X, Loader2, ImageOff } from 'lucide-react'
import { EvidenceImage } from '@/hooks/useComplaints'

interface EvidenceVaultProps {
  hi: boolean
  images: EvidenceImage[]
  onAdd: (file: File) => Promise<void> | void
  onRemove: (imageId: string) => Promise<void> | void
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function EvidenceVault({ hi, images, onAdd, onRemove }: EvidenceVaultProps) {
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
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm relative overflow-hidden">
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
            ? 'स्क्रीनशॉट, चैट और अन्य सबूत यहाँ जोड़ें और देखें।'
            : 'Add screenshots, chats, and other evidence here. Stored with your complaint.'}
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
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full h-24 rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-400 bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-gray-600 transition-all"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageOff className="w-5 h-5" />}
            <span className="text-xs font-medium">
              {uploading ? (hi ? 'अपलोड हो रहा है…' : 'Uploading…') : (hi ? 'साक्ष्य जोड़ें' : 'Add evidence')}
            </span>
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {images.map(img => (
              <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-slate-50">
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setPreview(img)}
                />
                <button
                  onClick={() => onRemove(img.id)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-6"
          onClick={() => setPreview(null)}
        >
          <button
            onClick={() => setPreview(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <img src={preview.dataUrl} alt={preview.name} className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  )
}
