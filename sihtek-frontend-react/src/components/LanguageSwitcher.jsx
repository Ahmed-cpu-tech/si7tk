import { Globe } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { LANGS } from '../i18n/translations'

/**
 * Compact AR / FR / EN switcher. Reusable on public pages, auth pages and the app header.
 */
export default function LanguageSwitcher({ compact = false }) {
  const { lang, setLang } = useLang()

  return (
    <div className={`inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 ${compact ? '' : 'shadow-sm'}`} dir="ltr">
      <Globe className="mx-1 h-3.5 w-3.5 shrink-0 text-slate-400" />
      {LANGS.map((l) => (
        <button
          key={l.value}
          type="button"
          onClick={() => setLang(l.value)}
          title={l.label}
          className={`rounded-full px-2.5 py-1 text-xs font-bold transition ${
            lang === l.value ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          {l.short}
        </button>
      ))}
    </div>
  )
}
