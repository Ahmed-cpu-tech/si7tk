import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Activity, Bell, CalendarDays, CalendarPlus, ClipboardList, FileHeart, Home,
  LayoutDashboard, LogOut, Menu, Package, Pill, Settings, UserCircle, X,
} from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import { PageLoader } from './ui'

const NAV = {
  patient: [
    { to: '/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
    { to: '/medecins', key: 'nav.findDoctor', icon: Activity },
    { to: '/appointments', key: 'nav.myAppointments', icon: CalendarDays },
    { to: '/prescriptions', key: 'nav.myPrescriptions', icon: ClipboardList },
  ],
  doctor: [
    { to: '/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
    { to: '/appointments', key: 'nav.appointments', icon: CalendarDays },
    { to: '/prescriptions', key: 'nav.prescriptions', icon: ClipboardList },
  ],
  pharmacy: [
    { to: '/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
    { to: '/prescriptions', key: 'nav.receivedPrescriptions', icon: ClipboardList },
    { to: '/stock', key: 'nav.stock', icon: Package },
  ],
}

export default function Layout() {
  const { user, logout } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const poll = useRef(null)

  useEffect(() => {
    const load = () => api.get('/notifications').then((r) => setUnread(r.data.unread)).catch(() => {})
    load()
    poll.current = setInterval(load, 30000)
    return () => { if (poll.current) clearInterval(poll.current) }
  }, [])

  if (!user) return <PageLoader />

  const links = NAV[user.role] ?? []
  const roleLabel = t(`nav.${user.role}`)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const SidebarContent = (
    <>
      <Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-1">
        <img src="/favicon.svg" alt="Sihtek" className="h-9 w-9 rounded-lg" />
        <span className="text-lg font-extrabold tracking-tight text-slate-800">Sihtek</span>
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <l.icon className="h-5 w-5 shrink-0" />
            {t(l.key)}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 pt-4">
        <NavLink
          to="/profil"
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`
          }
        >
          <Settings className="h-5 w-5" /> {t('nav.profile')}
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" /> {t('common.logout')}
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar (start side: right in Arabic, left in English) */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 flex-col border-e border-slate-200 bg-white px-4 py-5 lg:flex">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col border-e border-slate-200 bg-white px-4 py-5">
            <button className="absolute end-3 top-4 text-slate-400" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col lg:ps-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
          <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden items-center gap-2 text-sm text-slate-500 lg:flex">
            <Home className="h-4 w-4" />
            {t('nav.hello')} <span className="font-semibold text-slate-700">{user.name}</span>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
              {roleLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link
              to="/notifications"
              className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              title={t('nav.notifications')}
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -end-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 ps-1 pe-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium text-slate-700 sm:block">{user.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">
          <Outlet context={{ setUnread }} />
        </main>
      </div>
    </div>
  )
}

/* Shared nav icons re-exported for pages that need them */
export { CalendarPlus, FileHeart, Pill, UserCircle }
