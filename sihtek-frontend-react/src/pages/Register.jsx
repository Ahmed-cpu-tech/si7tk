import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserCheck, Stethoscope, Pill, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { api, apiError } from '../api/client'
import { Spinner } from '../components/ui'

export default function Register() {
  const { register } = useAuth()
  const { t, loc } = useLang()
  const navigate = useNavigate()
  const [meta, setMeta] = useState({ specialties: [], cities: [] })
  const [role, setRole] = useState('patient')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', password_confirmation: '',
    specialty: '', city: '', consultation_fee: '200', pharmacy_name: '', address: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get('/meta').then((r) => setMeta(r.data)).catch(() => {})
  }, [])

  const ROLES = [
    { value: 'patient', label: t('auth.rolePatient'), icon: UserCheck, hint: t('auth.rolePatientHint') },
    { value: 'doctor', label: t('auth.roleDoctor'), icon: Stethoscope, hint: t('auth.roleDoctorHint') },
    { value: 'pharmacy', label: t('auth.rolePharmacy'), icon: Pill, hint: t('auth.rolePharmacyHint') },
  ]

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const payload = {
        role, name: form.name, email: form.email, phone: form.phone,
        password: form.password, password_confirmation: form.password_confirmation,
      }
      if (role === 'doctor') {
        payload.specialty = form.specialty
        payload.city = form.city
        payload.consultation_fee = form.consultation_fee
      }
      if (role === 'pharmacy') {
        payload.pharmacy_name = form.pharmacy_name
        payload.city = form.city
        payload.address = form.address
      }
      await register(payload)
      navigate('/dashboard')
    } catch (err) {
      setError(apiError(err, t))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="Sihtek" className="h-10 w-10 rounded-lg" />
            <span className="text-2xl font-extrabold tracking-tight text-slate-800">Sihtek</span>
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="card p-8">
          <h1 className="text-xl font-bold text-slate-800">{t('auth.registerTitle')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('auth.registerSub')}</p>

          {/* Role selector */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-4 text-center transition ${
                  role === r.value ? 'border-brand-600 bg-brand-50' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <r.icon className={`h-7 w-7 ${role === r.value ? 'text-brand-600' : 'text-slate-400'}`} />
                <span className="text-sm font-bold text-slate-700">{r.label}</span>
                <span className="text-[11px] leading-tight text-slate-400">{r.hint}</span>
              </button>
            ))}
          </div>

          {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">{t('auth.fullName')}</label>
                <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder={t('auth.namePh')} />
              </div>
              <div>
                <label className="label">{t('auth.phone')}</label>
                <input className="input" dir="ltr" value={form.phone} onChange={(e) => set('phone', e.target.value)} required placeholder={t('auth.phonePh')} />
              </div>
              <div>
                <label className="label">{t('auth.email')}</label>
                <input className="input" type="email" dir="ltr" value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder={t('auth.emailPh')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">{t('auth.password')}</label>
                  <input className="input" type="password" dir="ltr" value={form.password} onChange={(e) => set('password', e.target.value)} required placeholder={t('auth.passwordPh')} />
                </div>
                <div>
                  <label className="label">{t('auth.confirmPassword')}</label>
                  <input className="input" type="password" dir="ltr" value={form.password_confirmation} onChange={(e) => set('password_confirmation', e.target.value)} required />
                </div>
              </div>
            </div>

            {role === 'doctor' && (
              <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
                <div>
                  <label className="label">{t('auth.specialty')}</label>
                  <select className="input" value={form.specialty} onChange={(e) => set('specialty', e.target.value)} required>
                    <option value="">{t('auth.choose')}</option>
                    {meta.specialties.map((s) => <option key={s} value={s}>{loc('specialties', s)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">{t('auth.city')}</label>
                  <select className="input" value={form.city} onChange={(e) => set('city', e.target.value)} required>
                    <option value="">{t('auth.choose')}</option>
                    {meta.cities.map((c) => <option key={c} value={c}>{loc('cities', c)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">{t('auth.fee')}</label>
                  <input className="input" type="number" min="0" dir="ltr" value={form.consultation_fee} onChange={(e) => set('consultation_fee', e.target.value)} />
                </div>
              </div>
            )}

            {role === 'pharmacy' && (
              <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
                <div>
                  <label className="label">{t('auth.pharmacyName')}</label>
                  <input className="input" value={form.pharmacy_name} onChange={(e) => set('pharmacy_name', e.target.value)} required placeholder={t('auth.pharmacyNamePh')} />
                </div>
                <div>
                  <label className="label">{t('auth.city')}</label>
                  <select className="input" value={form.city} onChange={(e) => set('city', e.target.value)} required>
                    <option value="">{t('auth.choose')}</option>
                    {meta.cities.map((c) => <option key={c} value={c}>{loc('cities', c)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">{t('auth.address')}</label>
                  <input className="input" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder={t('auth.addressPh')} />
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy ? <Spinner /> : <UserPlus className="h-4 w-4" />} {t('auth.createBtn')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {t('auth.alreadyRegistered')} <Link to="/login" className="font-semibold text-brand-700 hover:underline">{t('auth.loginLink')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
