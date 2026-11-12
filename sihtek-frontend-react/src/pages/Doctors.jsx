import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MapPin, Search, Stethoscope } from 'lucide-react'
import { api } from '../api/client'
import { useLang } from '../context/LanguageContext'
import { Pagination, formatMoney, PageLoader } from '../components/ui'

export default function Doctors() {
  const { t, loc } = useLang()
  const [params, setParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const q = params.get('q') ?? ''
  const specialty = params.get('specialty') ?? ''
  const city = params.get('city') ?? ''
  const page = params.get('page') ?? '1'

  const fetchDoctors = useCallback(() => {
    setLoading(true)
    api
      .get('/doctors', { params: { q, specialty, city, page } })
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [q, specialty, city, page])

  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  const update = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900">{t('doctors.title')}</h1>
        <p className="mt-2 text-slate-600">{t('doctors.sub')}</p>
      </div>

      {/* Filters */}
      <div className="card mb-8 grid gap-3 p-4 sm:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input ps-9"
            placeholder={t('doctors.searchPh')}
            defaultValue={q}
            onKeyDown={(e) => e.key === 'Enter' && update('q', e.target.value)}
          />
        </div>
        <select className="input" value={specialty} onChange={(e) => update('specialty', e.target.value)}>
          <option value="">{t('doctors.allSpecialties')}</option>
          {data?.specialties.map((s) => <option key={s} value={s}>{loc('specialties', s)}</option>)}
        </select>
        <select className="input" value={city} onChange={(e) => update('city', e.target.value)}>
          <option value="">{t('doctors.allCities')}</option>
          {data?.cities.map((c) => <option key={c} value={c}>{loc('cities', c)}</option>)}
        </select>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.doctors.data.map((d) => (
              <Link key={d.id} to={`/medecins/${d.id}`} className="card flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
                    {d.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-800">{t('common.doctorPrefix')}{d.name}</p>
                    <p className="flex items-center gap-1 text-sm text-slate-500">
                      <Stethoscope className="h-3.5 w-3.5" /> {loc('specialties', d.specialty)}
                    </p>
                  </div>
                </div>
                {d.bio && <p className="mt-3 line-clamp-2 text-sm text-slate-500">{d.bio}</p>}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                  <span className="flex items-center gap-1 text-slate-500"><MapPin className="h-3.5 w-3.5" /> {loc('cities', d.city)}</span>
                  <span className="font-bold text-brand-700">{formatMoney(d.consultation_fee)}</span>
                </div>
              </Link>
            ))}
          </div>

          {data?.doctors.data.length === 0 && (
            <p className="py-16 text-center text-slate-400">{t('doctors.noResults')}</p>
          )}

          <Pagination
            page={data?.doctors.current_page ?? 1}
            lastPage={data?.doctors.last_page ?? 1}
            onPage={(p) => update('page', String(p))}
          />
        </>
      )}
    </div>
  )
}
