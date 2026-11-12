import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Info, Loader2, X } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { getLang } from '../i18n'

/* ─────────────────────────── Loaders ─────────────────────────── */

export function Spinner({ className = 'h-5 w-5' }) {
  return <Loader2 className={`animate-spin ${className}`} />
}

export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
    </div>
  )
}

/* ─────────────────────────── Empty state ─────────────────────── */

export function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      {icon && <div className="text-slate-300">{icon}</div>}
      <p className="font-medium text-slate-700">{title}</p>
      {subtitle && <p className="max-w-sm text-sm text-slate-500">{subtitle}</p>}
    </div>
  )
}

/* ─────────────────────────── Status badges ───────────────────── */

const STATUS_TONES = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-slate-200 text-slate-600',
  completed: 'bg-blue-100 text-blue-800',
  sent: 'bg-amber-100 text-amber-800',
  dispensed: 'bg-emerald-100 text-emerald-800',
  given: 'bg-emerald-100 text-emerald-800',
  unavailable: 'bg-red-100 text-red-700',
}

export function StatusBadge({ status }) {
  const { t } = useLang()
  const tone = STATUS_TONES[status] ?? 'bg-slate-100 text-slate-600'
  const label = t(`statuses.${status}`)
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>{label}</span>
}

/* ─────────────────────────── Stat card ───────────────────────── */

export function StatCard({ icon, label, value, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    violet: 'bg-violet-50 text-violet-600',
  }
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${tones[tone] ?? tones.brand}`}>{icon}</div>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  )
}

/* ─────────────────────────── Pagination ──────────────────────── */

export function Pagination({ page, lastPage, onPage }) {
  const { t } = useLang()
  if (lastPage <= 1) return null
  return (
    <div className="flex items-center justify-end gap-2 py-4">
      <button className="btn-secondary !px-3 !py-1.5" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronRight className="h-4 w-4 rtl:rotate-180" /> {t('common.prev')}
      </button>
      <span className="text-sm text-slate-500">{t('common.page', { page, last: lastPage })}</span>
      <button className="btn-secondary !px-3 !py-1.5" disabled={page >= lastPage} onClick={() => onPage(page + 1)}>
        {t('common.next')} <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
      </button>
    </div>
  )
}

/* ─────────────────────────── Modal ───────────────────────────── */

export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="card relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ─────────────────────────── Toasts ──────────────────────────── */

const ToastContext = createContext({ toast: () => {} })

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const { dir } = useLang()

  const toast = useCallback((message, error = false) => {
    const id = Date.now() + Math.random()
    setToasts((list) => [...list, { id, message, error }])
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 5000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* end-5 follows the direction (right in LTR, left in RTL) */}
      <div className="fixed bottom-5 end-5 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg transition ${
              item.error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-sm">{item.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext).toast
}

/* ─────────────────────────── Date & money helpers ────────────── */

const LOCALES = { ar: 'ar-MA', en: 'en-GB' }

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString(LOCALES[getLang()] ?? 'ar-MA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString(LOCALES[getLang()] ?? 'ar-MA', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Date only (no time) used in notification bodies. */
export function formatShortDateTime(iso) {
  return new Date(iso).toLocaleString(LOCALES[getLang()] ?? 'ar-MA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatMoney(v) {
  return getLang() === 'ar' ? `${Number(v).toFixed(0)} د.م.` : `${Number(v).toFixed(0)} DH`
}
