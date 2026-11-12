import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Pill, Plus, Send, Trash2 } from 'lucide-react'
import { api, apiError } from '../api/client'
import { useLang } from '../context/LanguageContext'
import { useToast } from '../components/ui'

const EMPTY_LINE = { name: '', dosage: '', duration: '', quantity: 1, instructions: '' }

export default function PrescriptionCreate() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { t, loc } = useLang()
  const toast = useToast()

  const [patients, setPatients] = useState([])
  const [pharmacies, setPharmacies] = useState([])
  const [patientId, setPatientId] = useState(params.get('patient_id') ?? '')
  const [appointmentId] = useState(params.get('appointment_id') ?? '')
  const [pharmacyId, setPharmacyId] = useState('')
  const [lines, setLines] = useState([{ ...EMPTY_LINE }])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get('/prescriptions/create-data', { params: { patient_id: params.get('patient_id'), appointment_id: params.get('appointment_id') } })
      .then((r) => {
        setPatients(r.data.patients)
        setPharmacies(r.data.pharmacies)
        if (r.data.prefill.patient_id) setPatientId(String(r.data.prefill.patient_id))
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedPharmacy = useMemo(() => pharmacies.find((p) => String(p.id) === pharmacyId), [pharmacies, pharmacyId])

  const setLine = (i, key, value) => {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, [key]: value } : l)))
  }

  const submit = async () => {
    setBusy(true)
    try {
      const payload = {
        patient_id: patientId,
        pharmacy_id: pharmacyId,
        appointment_id: appointmentId || null,
        medications: lines.map((l) => ({ ...l, quantity: Number(l.quantity) || 1 })),
      }
      const res = await api.post('/prescriptions', payload)
      toast(t('create.sentToast'))
      navigate(`/prescriptions/${res.data.prescription.id}`)
    } catch (err) {
      toast(apiError(err, t), true)
    } finally {
      setBusy(false)
    }
  }

  const valid = patientId && pharmacyId && lines.every((l) => l.name.trim() && l.quantity > 0)

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('common.back')}
      </button>

      <h1 className="text-2xl font-bold text-slate-800">{t('create.title')}</h1>

      {/* Patient & pharmacy */}
      <div className="card grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <label className="label">{t('create.patient')}</label>
          <select className="input" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
            <option value="">{t('create.patientPh')}</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}{p.phone ? ` — ${p.phone}` : ''}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">{t('create.patientHint')}</p>
        </div>
        <div>
          <label className="label">{t('create.pharmacy')}</label>
          <select className="input" value={pharmacyId} onChange={(e) => setPharmacyId(e.target.value)}>
            <option value="">{t('create.pharmacyPh')}</option>
            {pharmacies.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {loc('cities', p.city)}</option>
            ))}
          </select>
        </div>
        {selectedPharmacy && selectedPharmacy.medication_names.length > 0 && (
          <div className="sm:col-span-2">
            <p className="mb-1.5 text-xs font-semibold text-slate-500">
              {t('create.availableAt', { name: selectedPharmacy.name })}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedPharmacy.medication_names.slice(0, 12).map((n) => (
                <span key={n} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">{n}</span>
              ))}
              {selectedPharmacy.medication_names.length > 12 && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                  {t('create.others', { count: selectedPharmacy.medication_names.length - 12 })}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Medications */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold text-slate-700"><Pill className="h-4 w-4 text-brand-600" /> {t('create.medsTitle')}</h3>
          <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => setLines((ls) => [...ls, { ...EMPTY_LINE }])}>
            <Plus className="h-3.5 w-3.5" /> {t('create.addLine')}
          </button>
        </div>

        <div className="space-y-4">
          {lines.map((l, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400">{t('create.medN', { n: i + 1 })}</span>
                {lines.length > 1 && (
                  <button className="rounded-lg p-1 text-red-400 hover:bg-red-50 hover:text-red-600" onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="label">{t('create.name')}</label>
                  <input className="input" list={`meds-${pharmacyId}`} value={l.name} onChange={(e) => setLine(i, 'name', e.target.value)} placeholder={t('create.namePh')} />
                  <datalist id={`meds-${pharmacyId}`}>
                    {selectedPharmacy?.medication_names.map((n) => <option key={n} value={n} />)}
                  </datalist>
                </div>
                <div>
                  <label className="label">{t('create.dosage')}</label>
                  <input className="input" value={l.dosage} onChange={(e) => setLine(i, 'dosage', e.target.value)} placeholder={t('create.dosagePh')} />
                </div>
                <div>
                  <label className="label">{t('create.quantity')}</label>
                  <input className="input" type="number" min={1} max={999} dir="ltr" value={l.quantity} onChange={(e) => setLine(i, 'quantity', e.target.value)} />
                </div>
                <div>
                  <label className="label">{t('create.duration')}</label>
                  <input className="input" value={l.duration} onChange={(e) => setLine(i, 'duration', e.target.value)} placeholder={t('create.durationPh')} />
                </div>
                <div className="sm:col-span-3">
                  <label className="label">{t('create.instructions')}</label>
                  <input className="input" value={l.instructions} onChange={(e) => setLine(i, 'instructions', e.target.value)} placeholder={t('create.instructionsPh')} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary !px-6" disabled={!valid || busy} onClick={submit}>
          <Send className="h-4 w-4 rtl:rotate-180" /> {busy ? t('create.sending') : t('create.send')}
        </button>
      </div>
    </div>
  )
}
