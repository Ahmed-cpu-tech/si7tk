import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { apiError } from '../api/client'
import { Spinner } from '../components/ui'

export default function Login() {
  const { login, user } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const from = location.state?.from?.pathname ?? '/dashboard'

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(apiError(err, t))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="Sihtek" className="h-10 w-10 rounded-lg" />
            <span className="text-2xl font-extrabold tracking-tight text-slate-800">Sihtek</span>
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="card p-8">
          <h1 className="text-xl font-bold text-slate-800">{t('auth.loginTitle')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('auth.loginSub')}</p>

          {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {user && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {t('auth.alreadyConnected')} <Link className="font-semibold underline" to="/dashboard">{t('auth.goToDashboard')}</Link>
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">{t('auth.email')}</label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPh')}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label" htmlFor="password">{t('auth.password')}</label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? 'text' : 'password'}
                  className="input pe-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy ? <Spinner /> : <LogIn className="h-4 w-4" />} {t('auth.loginBtn')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="font-semibold text-brand-700 hover:underline">{t('auth.registerLink')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
