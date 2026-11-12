import { translations, LANG_KEY } from './translations'

/**
 * Raw language getter — usable outside React (axios interceptor, date formatters).
 */
export function getLang() {
  return localStorage.getItem(LANG_KEY) || 'ar'
}

/**
 * Fallback order when a key is missing in the active language.
 */
const FALLBACKS = ['fr', 'en', 'ar']

/**
 * Translate a dot key in the current language with {param} interpolation.
 * Falls back to the other languages, then to the raw key (easier debugging).
 */
export function translate(lang, key, params) {
  let value
  for (const l of [lang, ...FALLBACKS.filter((f) => f !== lang)]) {
    try {
      value = key.split('.').reduce((acc, part) => acc[part], translations[l])
    } catch {
      value = undefined
    }
    if (typeof value === 'string') break
  }
  if (typeof value !== 'string') return key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replaceAll(`{${k}}`, String(v))
    }
  }
  return value
}

/**
 * Localize a stored French value (specialty, city) for display.
 * Unknown values (e.g. custom data) are returned unchanged.
 */
export function localize(lang, group, value) {
  if (!value) return value
  const map = translations[lang]?.[group]
  return map?.[value] ?? value
}
