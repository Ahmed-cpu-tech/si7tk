import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { api, apiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { PageLoader, Spinner, useToast } from '../components/ui'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const { t, loc } = useLang()
  const toast = useToast()
  const [meta, setMeta] = useState({ specialties: [], cities: [] })
  const [form, setForm] = useState({
    name: '', phone: '',
    specialty: '', city: '', bio: '', consultation_fee: '',
    pharmacy_name: '', address: '',
  })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get('/meta').then((r) => setMeta(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!user) return
    setForm({
      name: user.name,
      phone: user.phone ?? '',
      specialty: user.doctorProfile?.specialty ?? '',
      city: user.doctorProfile?.city ?? user.pharmacyProfile?.city ?? '',
      bio: user.doctorProfile?.bio ?? '',
      consultation_fee: user.doctorProfile ? String(user.doctorProfile.consultation_fee) : '',
      pharmacy_name: user.pharmacyProfile?.name ?? '',
      address: user.pharmacyProfile?.address ?? '',
    })
  }, [user])

  if (!user) return <PageLoader />

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const payload = { name: form.name, phone: form.phone }
      if (user.role === 'doctor') {
        payload.specialty = form.specialty
        payload.city = form.city
        payload.bio = form.bio || null
        payload.consultation_fee = form.consultation_fee || null
      }
      if (user.role === 'pharmacy') {
        payload.pharmacy_name = form.pharmacy_name
        payload.city = form.city
        payload.address = form.address || null
      }
      await api.patch('/profile', payload)
      await refreshUser()
      toast(t('profile.updated'))
    } catch (err) {
      toast(apiError(err, t), true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">{t('profile.title')}</h1>

      {/* Identity card */}
      <div className="card flex items-center gap-4 p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-bold text-slate-800">{user.name}</p>
          <p className="text-sm text-slate-500" dir="ltr">{user.email}</p>
          <span className="mt-1 inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
            {t(`nav.${user.role}`)}
          </span>
        </div>
      </div>

      <form onSubmit={submit} className="card space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">{t('profile.fullName')}</label>
            <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div>
            <label className="label">{t('profile.phone')}</label>
            <input className="input" dir="ltr" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
          </div>
        </div>

        {user.role === 'doctor' && user.doctorProfile && (
          <div className="space-y-4 rounded-xl bg-slate-50 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">{t('profile.specialty')}</label>
                <select className="input" value={form.specialty} onChange={(e) => set('specialty', e.target.value)} required>
                  <option value="">{t('auth.choose')}</option>
                  {meta.specialties.map((s) => <option key={s} value={s}>{loc('specialties', s)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">{t('profile.city')}</label>
                <select className="input" value={form.city} onChange={(e) => set('city', e.target.value)} required>
                  <option value="">{t('auth.choose')}</option>
                  {meta.cities.map((c) => <option key={c} value={c}>{loc('cities', c)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">{t('profile.fee')}</label>
              <input className="input" type="number" min={0} dir="ltr" value={form.consultation_fee} onChange={(e) => set('consultation_fee', e.target.value)} />
            </div>
            <div>
              <label className="label">{t('profile.bio')}</label>
              <textarea className="input min-h-24" value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder={t('profile.bioPh')} />
            </div>
          </div>
        )}

        {user.role === 'pharmacy' && user.pharmacyProfile && (
          <div className="space-y-4 rounded-xl bg-slate-50 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">{t('profile.pharmacyName')}</label>
                <input className="input" value={form.pharmacy_name} onChange={(e) => set('pharmacy_name', e.target.value)} required />
              </div>
              <div>
                <label className="label">{t('profile.city')}</label>
                <select className="input" value={form.city} onChange={(e) => set('city', e.target.value)} required>
                  <option value="">{t('auth.choose')}</option>
                  {meta.cities.map((c) => <option key={c} value={c}>{loc('cities', c)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">{t('profile.address')}</label>
              <input className="input" value={form.address} onChange={(e) => set('address', e.target.value)} />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? <Spinner /> : <Save className="h-4 w-4" />} {t('profile.save')}
          </button>
        </div>
      </form>
    </div>
  )
}
