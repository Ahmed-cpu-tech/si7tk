import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, clearToken, getToken, setToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from the stored token on first load
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get('/me')
      .then((res) => setUser(res.data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/login', { email, password })
    setToken(res.data.token)
    setUser(res.data.user)
  }, [])

  const register = useCallback(async (payload) => {
    const res = await api.post('/register', payload)
    setToken(res.data.token)
    setUser(res.data.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/logout')
    } finally {
      clearToken()
      setUser(null)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    const res = await api.get('/me')
    setUser(res.data.user)
  }, [])

  const isRole = useCallback((...roles) => !!user && roles.includes(user.role), [user])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser, isRole }),
    [user, loading, login, register, logout, refreshUser, isRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
