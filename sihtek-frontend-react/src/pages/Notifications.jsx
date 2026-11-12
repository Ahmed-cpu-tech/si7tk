import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CalendarDays, CheckCheck, Pill } from 'lucide-react'
import { api, apiError } from '../api/client'
import { useLang } from '../context/LanguageContext'
import { EmptyState, formatShortDateTime, PageLoader, useToast } from '../components/ui'

/** Structured notification kinds (new payloads) — rendered translated client-side. */
const STRUCTURED_KINDS = [
  'appointment.request',
  'appointment.confirmed',
  'appointment.cancelled',
  'prescription.sent',
  'prescription.dispensed',
  'prescription.delivered',
]

function notifIcon(kind) {
  return kind.startsWith('appointment') ? '📅' : kind.startsWith('prescription') ? '💊' : '🔔'
}

/** Build {title, body} for a notification in the active language. */
function renderNotification(data, t) {
  if (!STRUCTURED_KINDS.includes(data.kind)) {
    // Legacy payload (old rows / fallback): use stored French text
    return { title: data.title, body: data.body }
  }
  switch (data.kind) {
    case 'appointment.request':
      return {
        title: t('notifications.appointmentRequest'),
        body: t('notifications.appointmentRequestBody', { name: data.patient_name, date: formatShortDateTime(data.scheduled_at) }),
      }
    case 'appointment.confirmed':
      return {
        title: t('notifications.appointmentConfirmed'),
        body: t('notifications.appointmentConfirmedBody', { name: data.doctor_name, date: formatShortDateTime(data.scheduled_at) }),
      }
    case 'appointment.cancelled':
      return {
        title: t('notifications.appointmentCancelled'),
        body: t('notifications.appointmentCancelledBodyBy', { name: data.cancelled_by_name, date: formatShortDateTime(data.scheduled_at) }),
      }
    case 'prescription.sent':
      return {
        title: t('notifications.prescriptionSent'),
        body: t('notifications.prescriptionSentBody', { doctor: data.doctor_name, patient: data.patient_name, count: data.medications_count }),
      }
    case 'prescription.dispensed':
      return {
        title: t('notifications.prescriptionDispensed'),
        body: t('notifications.prescriptionDispensedBody', { patient: data.patient_name, pharmacy: data.pharmacy_name, date: formatShortDateTime(data.dispensed_at) }),
      }
    case 'prescription.delivered':
      return {
        title: t('notifications.prescriptionDelivered'),
        body: t('notifications.prescriptionDeliveredBody', { pharmacy: data.pharmacy_name, date: formatShortDateTime(data.dispensed_at) }),
      }
    default:
      return { title: data.title, body: data.body }
  }
}

export default function Notifications() {
  const { t } = useLang()
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [unread, setUnread] = useState(0)

  const load = useCallback(() => {
    api.get('/notifications').then((r) => {
      setItems(r.data.notifications)
      setUnread(r.data.unread)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-read')
      toast(t('notifications.markedToast'))
      load()
    } catch (err) {
      toast(apiError(err, t), true)
    }
  }

  if (!items) return <PageLoader />

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
          <Bell className="h-6 w-6 text-brand-600" /> {t('notifications.title')}
          {unread > 0 && (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-bold text-red-700">
              {t('notifications.unread', { count: unread })}
            </span>
          )}
        </h1>
        {unread > 0 && (
          <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={markAllRead}>
            <CheckCheck className="h-3.5 w-3.5" /> {t('notifications.markAll')}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<Bell className="h-12 w-12" />} title={t('notifications.none')} subtitle={t('notifications.noneSub')} />
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const { title, body } = renderNotification(n.data, t)
            const inner = (
              <div className={`flex items-start gap-3 rounded-xl border p-4 transition ${
                n.read_at ? 'border-slate-200 bg-white' : 'border-brand-200 bg-brand-50'
              }`}>
                <span className="text-xl">{notifIcon(n.data.kind)}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm ${n.read_at ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>{title}</p>
                    {!n.read_at && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600">{body}</p>
                  <p className="mt-1 text-xs text-slate-400">{n.created_human}</p>
                </div>
              </div>
            )
            return n.data.link ? (
              <Link key={n.id} to={n.data.link} className="block" onClick={() => load()}>{inner}</Link>
            ) : (
              <div key={n.id}>{inner}</div>
            )
          })}
        </div>
      )}
    </div>
  )
}
