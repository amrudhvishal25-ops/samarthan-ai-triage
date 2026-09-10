'use client'

import { useTriage } from '@/context/TriageContext'
import { getTranslation, TranslationSchema } from './translations'
import { SUPPORTED_LANGUAGES, LANGUAGE_MAP, SupportedLanguage, LanguageMeta } from './languages'

export function useTranslation() {
  const { language, setLanguage } = useTriage()
  const t: TranslationSchema = getTranslation(language as SupportedLanguage)
  const currentLanguageMeta: LanguageMeta = LANGUAGE_MAP[language as SupportedLanguage] || LANGUAGE_MAP.en

  return {
    t,
    language: language as SupportedLanguage,
    setLanguage,
    languages: SUPPORTED_LANGUAGES,
    currentLanguageMeta,
    isRtl: Boolean(currentLanguageMeta.rtl),
  }
}
