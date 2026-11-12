import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, FilePlus2 } from 'lucide-react'
import { api } from '../api/client'
import { useLang } from '../context/LanguageContext'
import { formatDate, PageLoader, Pagination, StatusBadge } from '../components/ui'

export default function Prescriptions() {
  const { t } = useLang()
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    api
      .get('/prescriptions', { params: { page } })
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  if (loading && !data) return <PageLoader />

  const role = data?.role
  const list = data?.prescriptions.data ?? []

  const title =
    role === 'doctor' ? t('prescriptions.sent')
    : role === 'pharmacy' ? t('prescriptions.received')
    : t('prescriptions.mine')

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {role === 'doctor' && (
          <Link to="/prescriptions/nouveau" className="btn-primary">
            <FilePlus2 className="h-4 w-4" /> {t('prescriptions.new')}
          </Link>
        )}
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <ClipboardList className="h-12 w-12 text-slate-300" />
          <p className="font-medium text-slate-700">{t('prescriptions.none')}</p>
          <p className="max-w-sm text-sm text-slate-500">
            {role === 'doctor' ? t('prescriptions.noneDoctor')
              : role === 'pharmacy' ? t('prescriptions.nonePharmacy')
              : t('prescriptions.nonePatient')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <Link key={p.id} to={`/prescriptions/${p.id}`} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{t('prescriptions.rx')}{p.id}</span>
                <StatusBadge status={p.status} />
              </div>
              <p className="mt-3 font-bold text-slate-800">
                {role === 'patient' ? `${t('common.doctorPrefix')}${p.doctor?.name}` : p.patient?.name}
              </p>
              <p className="text-sm text-slate-500">
                {role === 'patient' ? p.pharmacy?.name : t('prescriptions.pharmacyLabel', { name: p.pharmacy?.name })} · {formatDate(p.created_at)}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.medications?.slice(0, 3).map((m) => (
                  <span key={m.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {m.name}
                  </span>
                ))}
                {(p.medications?.length ?? 0) > 3 && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                    +{(p.medications?.length ?? 0) - 3}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {data && <Pagination page={data.prescriptions.current_page} lastPage={data.prescriptions.last_page} onPage={setPage} />}
    </div>
  )
}
