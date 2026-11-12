import { Link } from 'react-router-dom'
import { Activity, ArrowLeft, ArrowRight, CalendarCheck, ClipboardList, Pill, ShieldCheck, Stethoscope } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { api } from '../api/client'
import { useEffect, useState } from 'react'
import { formatMoney } from '../components/ui'

export default function Landing() {
  const { user } = useAuth()
  const { t, loc } = useLang()
  const [doctors, setDoctors] = useState([])
  useEffect(() => {
    api.get('/doctors').then((r) => setDoctors(r.data.doctors.data.slice(0, 3))).catch(() => {})
  }, [])

  const Arrow = ArrowRight

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="Sihtek" className="h-9 w-9 rounded-lg" />
          <span className="text-xl font-extrabold tracking-tight text-slate-800">Sihtek</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link to="/medecins" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-700 sm:block">
            {t('landing.navDoctors')}
          </Link>
          <LanguageSwitcher />
          {user ? (
            <Link to="/dashboard" className="btn-primary">
              {t('landing.mySpace')} <Arrow className="h-4 w-4 rtl:rotate-180" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">{t('landing.login')}</Link>
              <Link to="/register" className="btn-primary">{t('landing.register')}</Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
              <Stethoscope className="h-3.5 w-3.5" /> {t('landing.badge')}
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              {t('landing.hero1')} <span className="text-brand-600">{t('landing.hero2')}</span>{t('landing.hero3')}
            </h1>
            <p className="mt-4 max-w-lg text-lg text-slate-600">{t('landing.heroP')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={user ? '/dashboard' : '/register'} className="btn-primary !px-6 !py-3 text-base">
                {user ? t('landing.ctaDashboard') : t('landing.ctaStart')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <Link to="/medecins" className="btn-secondary !px-6 !py-3 text-base">
                {t('landing.findDoctor')}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-600" /> {t('landing.secure')}</span>
              <span className="inline-flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-brand-600" /> {t('landing.realtime')}</span>
              <span className="inline-flex items-center gap-2"><Pill className="h-4 w-4 text-brand-600" /> {t('landing.follow')}</span>
            </div>
          </div>

          {/* Flow illustration */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="card space-y-4 p-6">
              <div className="flex items-center gap-3 rounded-lg bg-brand-50 p-3">
                <CalendarCheck className="h-8 w-8 rounded-lg bg-brand-600 p-1.5 text-white" />
                <div>
                  <p className="text-sm font-bold text-slate-800">{t('landing.step1t')}</p>
                  <p className="text-xs text-slate-500">{t('landing.step1d')}</p>
                </div>
              </div>
              <div className="ms-6 h-5 border-s-2 border-dashed border-brand-300" />
              <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
                <ClipboardList className="h-8 w-8 rounded-lg bg-blue-600 p-1.5 text-white" />
                <div>
                  <p className="text-sm font-bold text-slate-800">{t('landing.step2t')}</p>
                  <p className="text-xs text-slate-500">{t('landing.step2d')}</p>
                </div>
              </div>
              <div className="ms-6 h-5 border-s-2 border-dashed border-brand-300" />
              <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-3">
                <Pill className="h-8 w-8 rounded-lg bg-emerald-600 p-1.5 text-white" />
                <div>
                  <p className="text-sm font-bold text-slate-800">{t('landing.step3t')}</p>
                  <p className="text-xs text-slate-500">{t('landing.step3d')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors preview */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('landing.doctorsTitle')}</h2>
            <p className="mt-1 text-slate-600">{t('landing.doctorsSub')}</p>
          </div>
          <Link to="/medecins" className="hidden items-center gap-1 font-semibold text-brand-700 hover:underline sm:inline-flex">
            {t('common.seeAll')} <ArrowLeft className="h-4 w-4 rtl:hidden" /><ArrowRight className="hidden h-4 w-4 rtl:inline" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {doctors.map((d) => (
            <Link key={d.id} to={`/medecins/${d.id}`} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
                  {d.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{t('common.doctorPrefix')}{d.name}</p>
                  <p className="text-sm text-slate-500">{loc('specialties', d.specialty)}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-500">{loc('cities', d.city)}</span>
                <span className="font-semibold text-brand-700">{formatMoney(d.consultation_fee)}</span>
              </div>
            </Link>
          ))}
          {doctors.length === 0 && (
            <p className="col-span-3 text-center text-slate-400">{t('landing.noDoctors')}</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        {t('landing.footer')}
      </footer>
    </div>
  )
}
