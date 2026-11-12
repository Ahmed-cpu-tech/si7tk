import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { LANG_KEY, LANGS } from '../i18n/translations'
import { getLang, translate, localize } from '../i18n'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getLang)

  // Apply <html lang / dir> so the whole layout flips (RTL for Arabic).
  useEffect(() => {
    const meta = LANGS.find((l) => l.value === lang) ?? LANGS[0]
    document.documentElement.lang = lang
    document.documentElement.dir = meta.dir
    localStorage.setItem(LANG_KEY, lang)
  }, [lang])

  const setLang = useCallback((next) => setLangState(next), [])

  const value = useMemo(() => ({
    lang,
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    setLang,
    /** t('dashboard.hello', { name: 'Ali' }) */
    t: (key, params) => translate(lang, key, params),
    /** localize('cities', 'Casablanca') → الدار البيضاء */
    loc: (group, value) => localize(lang, group, value),
  }), [lang, setLang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>')
  return ctx
}
