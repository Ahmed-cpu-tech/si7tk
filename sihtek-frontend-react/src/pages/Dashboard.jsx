import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarCheck, CalendarDays, ClipboardList, Package, Pill, Stethoscope,
  TrendingUp, Users, Activity,
} from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { EmptyState, formatDateTime, formatMoney, PageLoader, StatCard, StatusBadge } from '../components/ui'

function WeekChart({ data }) {
  const { t } = useLang()
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-brand-600" />
        <h3 className="font-bold text-slate-700">{t('dashboard.last7')}</h3>
      </div>
      <div className="flex h-36 items-end justify-between gap-2">
        {data.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600">{d.count}</span>
            <div
              className="w-full max-w-9 rounded-t-md bg-brand-500 transition-all"
              style={{ height: `${Math.max(6, (d.count / max) * 100)}%` }}
            />
            <span className="text-[11px] text-slate-400">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { t, loc } = useLang()
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/dashboard').then((r) => setData(r.data)).catch(() => {})
  }, [])

  if (!data) return <PageLoader />

  /* ────────────── PATIENT ────────────── */
  if (data.role === 'patient') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">{t('dashboard.hello', { name: user?.name.split(' ')[0] })}</h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<CalendarCheck className="h-6 w-6" />} label={t('dashboard.statUpcoming')} value={data.stats.upcoming} tone="brand" />
          <StatCard icon={<CalendarDays className="h-6 w-6" />} label={t('dashboard.statTotal')} value={data.stats.appointments} tone="blue" />
          <StatCard icon={<ClipboardList className="h-6 w-6" />} label={t('dashboard.statRx')} value={data.stats.prescriptions} tone="violet" />
          <StatCard icon={<Stethoscope className="h-6 w-6" />} label={t('dashboard.statDoctors')} value={data.stats.doctors} tone="emerald" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-700">{t('dashboard.upcomingTitle')}</h3>
              <Link to="/medecins" className="text-sm font-semibold text-brand-700 hover:underline">{t('dashboard.newAppt')}</Link>
            </div>
            <div className="space-y-3">
              {data.upcoming_appointments?.length ? data.upcoming_appointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t('common.doctorPrefix')}{a.doctor?.name}</p>
                    <p className="text-xs text-slate-500">
                      {loc('specialties', a.doctor?.doctorProfile?.specialty)} · {formatDateTime(a.scheduled_at)}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              )) : <p className="py-4 text-center text-sm text-slate-400">{t('dashboard.noUpcoming')}</p>}
            </div>
          </div>

          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-700">{t('dashboard.latestRx')}</h3>
              <Link to="/prescriptions" className="text-sm font-semibold text-brand-700 hover:underline">{t('common.seeAll')}</Link>
            </div>
            <div className="space-y-3">
              {data.latest_prescriptions?.length ? data.latest_prescriptions.map((p) => (
                <Link key={p.id} to={`/prescriptions/${p.id}`} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 hover:bg-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t('dashboard.rx')}{p.id}</p>
                    <p className="text-xs text-slate-500">{t('common.doctorPrefix')}{p.doctor?.name} ← {p.pharmacy?.name}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              )) : <p className="py-4 text-center text-sm text-slate-400">{t('dashboard.noRx')}</p>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ────────────── DOCTOR ────────────── */
  if (data.role === 'doctor') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-800">{t('dashboard.doctorTitle', { name: user?.name })}</h1>
          <Link to="/prescriptions/nouveau" className="btn-primary"><ClipboardList className="h-4 w-4" /> {t('dashboard.newRx')}</Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard icon={<CalendarDays className="h-6 w-6" />} label={t('dashboard.statToday')} value={data.stats.today} tone="brand" />
          <StatCard icon={<Activity className="h-6 w-6" />} label={t('dashboard.statPending')} value={data.stats.pending} tone="amber" />
          <StatCard icon={<Users className="h-6 w-6" />} label={t('dashboard.statPatients')} value={data.stats.patients} tone="blue" />
          <StatCard icon={<ClipboardList className="h-6 w-6" />} label={t('dashboard.statRx')} value={data.stats.prescriptions} tone="violet" />
          <StatCard icon={<Pill className="h-6 w-6" />} label={t('dashboard.statDispensed')} value={data.stats.dispensed} tone="emerald" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <WeekChart data={data.week_chart ?? []} />

          <div className="card p-5">
            <h3 className="mb-4 font-bold text-slate-700">{t('dashboard.pendingReqTitle')}</h3>
            <div className="space-y-3">
              {data.pending_requests?.length ? data.pending_requests.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50 p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{a.patient?.name}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(a.scheduled_at)}</p>
                  </div>
                  <Link to="/appointments" className="btn-primary !px-3 !py-1.5 text-xs">{t('dashboard.manage')}</Link>
                </div>
              )) : <p className="py-4 text-center text-sm text-slate-400">{t('dashboard.noPending')}</p>}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-4 font-bold text-slate-700">{t('dashboard.todayTitle')}</h3>
            <div className="space-y-3">
              {data.today_appointments?.length ? data.today_appointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{a.patient?.name}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(a.scheduled_at)} · {a.patient?.phone}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              )) : <p className="py-4 text-center text-sm text-slate-400">{t('dashboard.noToday')}</p>}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-700">
              <Pill className="h-4 w-4 text-emerald-600" /> {t('dashboard.followTitle')}
            </h3>
            <div className="space-y-3">
              {data.recent_dispensed?.length ? data.recent_dispensed.map((p) => (
                <Link key={p.id} to={`/prescriptions/${p.id}`} className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50 p-3 hover:bg-emerald-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{p.patient?.name}</p>
                    <p className="text-xs text-slate-500">{p.pharmacy?.name} · {p.dispensed_at ? formatDateTime(p.dispensed_at) : ''}</p>
                  </div>
                  <StatusBadge status="dispensed" />
                </Link>
              )) : <p className="py-4 text-center text-sm text-slate-400">{t('dashboard.noFollow')}</p>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ────────────── PHARMACY ────────────── */
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{data.pharmacy?.name}</h1>
          <p className="text-sm text-slate-500">{t('dashboard.pharmacySpace')} — {loc('cities', data.pharmacy?.city)}</p>
        </div>
        <Link to="/prescriptions" className="btn-primary"><ClipboardList className="h-4 w-4" /> {t('nav.receivedPrescriptions')}</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={<ClipboardList className="h-6 w-6" />} label={t('dashboard.statRxPending')} value={data.stats.pending} tone="amber" />
        <StatCard icon={<Pill className="h-6 w-6" />} label={t('dashboard.statRxDelivered')} value={data.stats.dispensed} tone="emerald" />
        <StatCard icon={<Package className="h-6 w-6" />} label={t('dashboard.statReferences')} value={data.stats.references} tone="brand" />
        <StatCard icon={<Activity className="h-6 w-6" />} label={t('dashboard.statLowStock')} value={`${data.stats.low_stock} / ${data.stats.out_of_stock}`} tone="red" />
        <StatCard icon={<TrendingUp className="h-6 w-6" />} label={t('dashboard.statUnitsSold')} value={data.stats.units_sold} tone="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WeekChart data={data.week_chart ?? []} />

        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-700">
            <Package className="h-4 w-4 text-red-500" /> {t('dashboard.watchTitle')}
          </h3>
          <div className="space-y-2">
            {data.low_stock_meds?.length ? data.low_stock_meds.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                  <p className="text-xs text-slate-500">{formatMoney(m.price)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${m.stock_qty === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {m.stock_qty === 0 ? t('dashboard.outOfStock') : t('dashboard.inStock', { qty: m.stock_qty })}
                </span>
              </div>
            )) : <p className="py-4 text-center text-sm text-slate-400">{t('dashboard.allGood')}</p>}
          </div>
        </div>

        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-4 font-bold text-slate-700">{t('dashboard.pendingDelivery')}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.pending_prescriptions?.length ? data.pending_prescriptions.map((p) => (
              <Link key={p.id} to={`/prescriptions/${p.id}`} className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50 p-3 hover:bg-amber-100">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{p.patient?.name}</p>
                  <p className="text-xs text-slate-500">{t('common.doctorPrefix')}{p.doctor?.name} · {t('dashboard.medsCount', { count: p.medications?.length ?? 0 })}</p>
                </div>
                <StatusBadge status="sent" />
              </Link>
            )) : <p className="col-span-2 py-4 text-center text-sm text-slate-400">{t('dashboard.noPendingDelivery')}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export { EmptyState }
