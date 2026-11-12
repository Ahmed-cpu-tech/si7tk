import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ClipboardPlus } from 'lucide-react'
import { api, apiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { EmptyState, formatDateTime, Modal, PageLoader, Pagination, StatusBadge, useToast } from '../components/ui'

export default function Appointments() {
  const { user } = useAuth()
  const { t, loc } = useLang()
  const toast = useToast()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [summaryFor, setSummaryFor] = useState(null)
  const [summary, setSummary] = useState('')
  const [busy, setBusy] = useState(false)

  const FILTERS = [
    { value: '', key: 'appointments.filterAll' },
    { value: 'pending', key: 'appointments.filterPending' },
    { value: 'confirmed', key: 'appointments.filterConfirmed' },
    { value: 'completed', key: 'appointments.filterCompleted' },
    { value: 'cancelled', key: 'appointments.filterCancelled' },
  ]

  const load = useCallback(() => {
    setLoading(true)
    api
      .get('/appointments', { params: { status, page } })
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status, page])

  useEffect(() => {
    load()
  }, [load])

  const act = async (fn, ok) => {
    try {
      await fn()
      toast(ok)
      load()
    } catch (err) {
      toast(apiError(err, t), true)
    }
  }

  const confirm = (a) => act(() => api.patch(`/appointments/${a.id}/confirm`), t('appointments.confirmToast'))
  const cancel = (a) => act(() => api.patch(`/appointments/${a.id}/cancel`), t('appointments.cancelToast'))

  const complete = async () => {
    if (!summaryFor) return
    setBusy(true)
    try {
      await api.patch(`/appointments/${summaryFor.id}/complete`, { consultation_summary: summary || null })
      toast(t('appointments.completeToast'))
      setSummaryFor(null)
      setSummary('')
      load()
    } catch (err) {
      toast(apiError(err, t), true)
    } finally {
      setBusy(false)
    }
  }

  if (loading && !data) return <PageLoader />

  const isDoctor = data?.role === 'doctor'
  const appointments = data?.appointments.data ?? []

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">
          {isDoctor ? t('appointments.received') : t('appointments.mine')}
        </h1>
        {!isDoctor && user?.role === 'patient' && (
          <Link to="/medecins" className="btn-primary"><CalendarDays className="h-4 w-4" /> {t('appointments.book')}</Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatus(f.value); setPage(1) }}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              status === f.value ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {t(f.key)}
          </button>
        ))}
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-12 w-12" />}
          title={t('appointments.none')}
          subtitle={user?.role === 'patient' ? t('appointments.nonePatient') : undefined}
        />
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <div key={a.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-slate-800">
                    {isDoctor ? (a.patient?.name ?? t('nav.patient')) : `${t('common.doctorPrefix')}${a.doctor?.name}`}
                  </p>
                  <StatusBadge status={a.status} />
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDateTime(a.scheduled_at)}
                  {!isDoctor && a.doctor?.doctorProfile ? ` · ${loc('specialties', a.doctor.doctorProfile.specialty)} · ${loc('cities', a.doctor.doctorProfile.city)}` : ''}
                  {isDoctor && a.patient?.phone ? ` · ${a.patient.phone}` : ''}
                </p>
                {a.reason && <p className="mt-1.5 rounded bg-slate-50 px-3 py-2 text-sm text-slate-600">{t('appointments.reason', { reason: a.reason })}</p>}
                {a.consultation_summary && (
                  <p className="mt-1.5 rounded bg-blue-50 px-3 py-2 text-sm text-blue-800">{t('appointments.summary', { summary: a.consultation_summary })}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Doctor actions */}
                {isDoctor && a.status === 'pending' && (
                  <button className="btn-primary !px-3 !py-1.5 text-xs" onClick={() => confirm(a)}>{t('appointments.confirm')}</button>
                )}
                {isDoctor && (a.status === 'pending' || a.status === 'confirmed') && (
                  <>
                    <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => setSummaryFor(a)}>
                      <ClipboardPlus className="h-3.5 w-3.5" /> {t('appointments.complete')}
                    </button>
                    <button className="btn-danger !px-3 !py-1.5 text-xs" onClick={() => cancel(a)}>{t('appointments.cancel')}</button>
                  </>
                )}
                {isDoctor && a.status === 'completed' && (
                  <Link to={`/prescriptions/nouveau?patient_id=${a.patient_id}&appointment_id=${a.id}`} className="btn-primary !px-3 !py-1.5 text-xs">
                    <ClipboardPlus className="h-3.5 w-3.5" /> {t('appointments.rxBtn')}
                  </Link>
                )}
                {/* Patient actions */}
                {!isDoctor && (a.status === 'pending' || a.status === 'confirmed') && (
                  <button className="btn-danger !px-3 !py-1.5 text-xs" onClick={() => cancel(a)}>{t('appointments.cancel')}</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {data && (
        <Pagination
          page={data.appointments.current_page}
          lastPage={data.appointments.last_page}
          onPage={setPage}
        />
      )}

      {/* Complete consultation modal */}
      <Modal open={!!summaryFor} onClose={() => setSummaryFor(null)} title={t('appointments.completeTitle')}>
        <p className="text-sm text-slate-500">
          {t('appointments.patient')} <strong>{summaryFor?.patient?.name}</strong> · {summaryFor && formatDateTime(summaryFor.scheduled_at)}
        </p>
        <textarea
          className="input mt-3 min-h-28"
          placeholder={t('appointments.completePh')}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setSummaryFor(null)}>{t('common.close')}</button>
          <button className="btn-primary" disabled={busy} onClick={complete}>{busy ? t('common.saving') : t('appointments.markDone')}</button>
        </div>
      </Modal>
    </div>
  )
}
