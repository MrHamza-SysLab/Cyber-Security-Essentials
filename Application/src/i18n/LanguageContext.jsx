import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { UI } from './ui'

const STORAGE_KEY = 'cse_lang_v1'
const LanguageContext = createContext(null)

function readStoredLang() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'ur' ? 'ur' : 'en'
  } catch {
    return 'en'
  }
}

function applyDocumentLang(lang) {
  const root = document.documentElement
  const ur = lang === 'ur'
  root.lang = ur ? 'ur' : 'en'
  root.dir = ur ? 'rtl' : 'ltr'
  root.classList.toggle('lang-ur', ur)
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const initial = typeof document !== 'undefined' ? readStoredLang() : 'en'
    if (typeof document !== 'undefined') applyDocumentLang(initial)
    return initial
  })

  useEffect(() => {
    applyDocumentLang(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore quota / private mode
    }
    document.title = lang === 'ur' ? 'گیم پر مبنی ٹریننگ' : 'Game-Based Training'
  }, [lang])

  const setLang = useCallback((next) => {
    setLangState(next === 'ur' ? 'ur' : 'en')
  }, [])

  const toggleLang = useCallback(() => {
    setLangState((current) => (current === 'ur' ? 'en' : 'ur'))
  }, [])

  const isUr = lang === 'ur'

  const t = useCallback(
    (key, fallback) => {
      if (isUr && UI.ur[key] != null) return UI.ur[key]
      if (UI.en[key] != null) return UI.en[key]
      return fallback ?? key
    },
    [isUr],
  )

  /** Pick bilingual field: lu(obj, 'title') → obj.titleUr when Urdu else obj.title */
  const lu = useCallback(
    (obj, field) => {
      if (!obj) return ''
      if (isUr && obj[`${field}Ur`] != null) return obj[`${field}Ur`]
      return obj[field] ?? ''
    },
    [isUr],
  )

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, isUr, t, lu }),
    [lang, setLang, toggleLang, isUr, t, lu],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
