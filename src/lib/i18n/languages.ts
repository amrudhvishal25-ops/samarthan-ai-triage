export type SupportedLanguage =
  | 'en' // English
  | 'hi' // Hindi (हिन्दी)
  | 'bn' // Bengali (বাংলা)
  | 'mr' // Marathi (मराठी)
  | 'te' // Telugu (తెలుగు)
  | 'ta' // Tamil (தமிழ்)
  | 'gu' // Gujarati (ગુજરાતી)
  | 'ur' // Urdu (اردو)
  | 'kn' // Kannada (ಕನ್ನಡ)
  | 'or' // Odia (ଓଡ଼ିଆ)
  | 'ml' // Malayalam (മലയാളം)
  | 'pa' // Punjabi (ਪੰਜਾਬੀ)

export interface LanguageMeta {
  code: SupportedLanguage
  name: string
  nativeName: string
  script: string
  whisperCode: string
  rtl?: boolean
  sampleState: string
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', whisperCode: 'en', sampleState: 'National / Central' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', whisperCode: 'hi', sampleState: 'North & Central India' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', whisperCode: 'bn', sampleState: 'West Bengal & Tripura' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', whisperCode: 'mr', sampleState: 'Maharashtra' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', whisperCode: 'te', sampleState: 'Andhra Pradesh & Telangana' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', whisperCode: 'ta', sampleState: 'Tamil Nadu & Puducherry' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', whisperCode: 'gu', sampleState: 'Gujarat' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'Perso-Arabic', whisperCode: 'ur', rtl: true, sampleState: 'National / J&K / Telangana' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', whisperCode: 'kn', sampleState: 'Karnataka' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia', whisperCode: 'or', sampleState: 'Odisha' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', whisperCode: 'ml', sampleState: 'Kerala' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', whisperCode: 'pa', sampleState: 'Punjab' },
]

export const LANGUAGE_MAP: Record<SupportedLanguage, LanguageMeta> = SUPPORTED_LANGUAGES.reduce((acc, l) => {
  acc[l.code] = l
  return acc
}, {} as Record<SupportedLanguage, LanguageMeta>)
