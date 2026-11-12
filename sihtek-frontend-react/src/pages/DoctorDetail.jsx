import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarCheck, CheckCircle2, MapPin, Stethoscope, XCircle } from 'lucide-react'
import { api, apiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { formatMoney, useToast } from '../components/ui'

export default function DoctorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t, loc } = useLang()
  const toast = useToast()

  const [doctor, setDoctor] = useState(null)
  const [date, setDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  })
  const [slots, setSlots] = useState([])
  const [selected, setSelected] = useState(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get(`/doctors/${id}`).then((r) => setDoctor(r.data.doctor)).catch(() => {})
  }, [id])

  const loadSlots = useCallback(() => {
    api.get(`/doctors/${id}/slots`, { params: { date } }).then((r) => setSlots(r.data.slots)).catch(() => {})
  }, [id, date])

  useEffect(() => {
    setSelected(null)
    loadSlots()
  }, [loadSlots])

  const book = async () => {
    if (!selected) return
    setBusy(true)
    try {
      await api.post('/appointments', {
        doctor_id: doctor?.user_id,
        scheduled_at: `${date} ${selected}:00`,
        reason: reason || null,
      })
      toast(t('appointments.confirmToast'))
      navigate('/appointments')
    } catch (err) {
      toast(apiError(err, t), true)
    } finally {
      setBusy(false)
    }
  }

  if (!doctor) return <p className="py-24 text-center text-slate-400">{t('doctorDetail.notFound')}</p>

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('common.back')}
      </button>

      {/* Doctor card */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
            {doctor.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{t('common.doctorPrefix')}{doctor.name}</h1>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1"><Stethoscope className="h-4 w-4" /> {loc('specialties', doctor.specialty)}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {loc('cities', doctor.city)}</span>
              <span>{doctor.completed_appointments ?? 0} {t('doctorDetail.consultationsDone')}</span>
            </p>
          </div>
          <div className="text-end">
            <p className="text-2xl font-extrabold text-brand-700">{formatMoney(doctor.consultation_fee)}</p>
            <p className="text-xs text-slate-400">{t('doctorDetail.perConsult')}</p>
          </div>
        </div>
        {doctor.bio && <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">{doctor.bio}</p>}
      </div>

      {/* Booking */}
      <div className="card mt-6 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <CalendarCheck className="h-5 w-5 text-brand-600" /> {t('doctorDetail.chooseSlot')}
        </h2>

        {!user && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {t('doctorDetail.loginToBook')}{' '}
            <button className="font-bold underline" onClick={() => navigate('/login', { state: { from: { pathname: `/medecins/${id}` } } })}>
              {t('doctorDetail.loginLink')}
            </button>
          </p>
        )}
        {user && user.role !== 'patient' && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {t('doctorDetail.onlyPatients')}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-slate-600">{t('doctorDetail.date')}</label>
          <input
            type="date"
            className="input !w-auto"
            dir="ltr"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6" dir="ltr">
          {slots.map((s) => (
            <button
              key={s.time}
              disabled={!s.available || !user || user.role !== 'patient'}
              onClick={() => setSelected(s.time)}
              className={`rounded-lg border px-2 py-2.5 text-sm font-semibold transition ${
                selected === s.time
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : s.available && user?.role === 'patient'
                    ? 'border-slate-200 bg-white text-slate-700 hover:border-brand-400 hover:bg-brand-50'
                    : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through'
              }`}
            >
              {s.time}
            </button>
          ))}
          {slots.length === 0 && <p className="col-span-6 py-4 text-center text-sm text-slate-400">{t('doctorDetail.noSlots')}</p>}
        </div>

        {user?.role === 'patient' && (
          <>
            <div className="mt-5">
              <label className="label">{t('doctorDetail.reasonLabel')}</label>
              <textarea
                className="input min-h-24"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('doctorDetail.reasonPh')}
              />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button className="btn-primary !px-6" disabled={!selected || busy} onClick={book}>
                <CalendarCheck className="h-4 w-4" /> {busy ? t('doctorDetail.booking') : t('doctorDetail.book')}
              </button>
              {selected && (
                <span className="text-sm text-slate-500">
                  {t('doctorDetail.slotChosen', { time: selected, date })}
                </span>
              )}
            </div>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {t('doctorDetail.mustConfirm')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5 text-red-400" /> {t('doctorDetail.canCancel')}
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
