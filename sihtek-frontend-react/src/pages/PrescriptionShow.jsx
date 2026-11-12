import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, CircleAlert, PackageCheck, Printer } from 'lucide-react'
import { api, apiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { formatDateTime, PageLoader, Spinner, StatusBadge, useToast } from '../components/ui'

export default function PrescriptionShow() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t, loc } = useLang()
  const toast = useToast()

  const [prescription, setPrescription] = useState(null)
  const [stock, setStock] = useState({})
  const [lines, setLines] = useState({})
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    api.get(`/prescriptions/${id}`).then((r) => {
      setPrescription(r.data.prescription)
      setStock(r.data.stock ?? {})
      const init = {}
      for (const m of r.data.prescription.medications ?? []) {
        init[m.id] = { status: m.status === 'pending' ? 'given' : m.status, quantity: m.quantity }
      }
      setLines(init)
    }).catch(() => {})
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (!prescription) return <PageLoader />

  const isPharmacy = user?.role === 'pharmacy'
  const canDispense = isPharmacy && prescription.status === 'sent'

  const dispense = async () => {
    setBusy(true)
    try {
      await api.post(`/prescriptions/${prescription.id}/dispense`, {
        lines: (prescription.medications ?? []).map((m) => ({
          id: m.id,
          status: lines[m.id]?.status ?? 'given',
          quantity: lines[m.id]?.quantity ?? m.quantity,
        })),
      })
      toast(t('show.dispenseToast'))
      load()
    } catch (err) {
      toast(apiError(err, t), true)
    } finally {
      setBusy(false)
    }
  }

  const givenCount = (prescription.medications ?? []).filter((m) => m.status === 'given').length
  const totalCount = prescription.medications?.length ?? 0

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <Link to="/prescriptions" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('show.back')}
        </Link>
        <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5" /> {t('show.print')}
        </button>
      </div>

      {/* Prescription sheet */}
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-5 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-100">{t('show.medicalRx')}</p>
            <p className="text-2xl font-extrabold">{t('show.no')} {String(prescription.id).padStart(5, '0')}</p>
          </div>
          <StatusBadge status={prescription.status} />
        </div>

        <div className="grid gap-4 border-b border-slate-100 p-6 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">{t('show.doctor')}</p>
            <p className="mt-0.5 font-bold text-slate-800">{t('common.doctorPrefix')}{prescription.doctor?.name}</p>
            {prescription.doctor?.doctorProfile && (
              <p className="text-sm text-slate-500">
                {loc('specialties', prescription.doctor.doctorProfile.specialty)} · {loc('cities', prescription.doctor.doctorProfile.city)}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">{t('show.patient')}</p>
            <p className="mt-0.5 font-bold text-slate-800">{prescription.patient?.name}</p>
            {prescription.patient?.phone && <p className="text-sm text-slate-500" dir="ltr">{prescription.patient.phone}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">{t('show.pharmacy')}</p>
            <p className="mt-0.5 font-bold text-slate-800">{prescription.pharmacy?.name}</p>
            <p className="text-sm text-slate-500">{loc('cities', prescription.pharmacy?.city)}</p>
          </div>
        </div>

        {/* Medications */}
        <div className="p-6">
          <h3 className="mb-4 font-bold text-slate-700">{t('show.treatment', { count: totalCount })}</h3>
          <div className="space-y-3">
            {prescription.medications?.map((m) => {
              const s = stock[m.name.toLowerCase()]
              return (
                <div key={m.id} className={`rounded-xl border p-4 ${m.status === 'given' ? 'border-emerald-200 bg-emerald-50' : m.status === 'unavailable' ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800">{m.name}</p>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {m.dosage && <span className="me-3">{t('show.dosage')} <strong>{m.dosage}</strong></span>}
                        {m.duration && <span className="me-3">{t('show.duration')} <strong>{m.duration}</strong></span>}
                        <span>{t('show.quantity')} <strong>{m.quantity}</strong></span>
                      </p>
                      {m.instructions && <p className="mt-1.5 text-sm italic text-slate-600">« {m.instructions} »</p>}
                    </div>

                    {canDispense ? (
                      <div className="flex items-center gap-2">
                        {s && (
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${s.stock_qty === 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {t('show.stock', { qty: s.stock_qty })}
                          </span>
                        )}
                        <select
                          className="input !w-auto !py-1.5 text-xs"
                          value={lines[m.id]?.status ?? 'given'}
                          onChange={(e) => setLines((ls) => ({ ...ls, [m.id]: { ...ls[m.id], status: e.target.value } }))}
                        >
                          <option value="given">{t('show.delivered')}</option>
                          <option value="unavailable">{t('show.unavailable')}</option>
                        </select>
                        <input
                          type="number"
                          min={0}
                          max={999}
                          className="input !w-20 !py-1.5 text-xs"
                          value={lines[m.id]?.quantity ?? m.quantity}
                          onChange={(e) => setLines((ls) => ({ ...ls, [m.id]: { ...ls[m.id], quantity: Number(e.target.value) } }))}
                        />
                      </div>
                    ) : (
                      <span className="shrink-0">
                        {m.status === 'given' && <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> {t('show.delivered')}</span>}
                        {m.status === 'unavailable' && <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-600"><CircleAlert className="h-4 w-4" /> {t('show.unavailable')}</span>}
                        {m.status === 'pending' && <StatusBadge status="pending" />}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer / status timeline */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-slate-50 px-6 py-4 text-sm text-slate-500">
          <span>{t('show.createdOn', { date: formatDateTime(prescription.created_at) })}</span>
          {prescription.dispensed_at && (
            <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <PackageCheck className="h-4 w-4" /> {t('show.pickedOn', { date: formatDateTime(prescription.dispensed_at) })}
            </span>
          )}
        </div>
      </div>

      {/* Pharmacy action */}
      {canDispense && (
        <div className="card flex flex-wrap items-center justify-between gap-3 border-brand-200 bg-brand-50 p-5">
          <div>
            <p className="font-bold text-slate-800">{t('show.validateTitle')}</p>
            <p className="text-sm text-slate-500">{t('show.validateDesc', { given: givenCount, count: totalCount })}</p>
          </div>
          <button className="btn-primary" disabled={busy} onClick={dispense}>
            {busy ? <Spinner /> : <PackageCheck className="h-4 w-4" />} {t('show.confirmDispense')}
          </button>
        </div>
      )}
    </div>
  )
}
