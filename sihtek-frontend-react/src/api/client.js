import axios from 'axios'
import { getLang } from '../i18n'

/**
 * Axios instance pointing at the Laravel API (sihtek-backend).
 * - The Sanctum bearer token is attached to every request by the interceptor.
 * - Accept-Language (ar / fr / en) makes the backend answer in the active UI language.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
  },
})

const TOKEN_KEY = 'sihtek_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers['Accept-Language'] = getLang()
  return config
})

/** Extract a readable error message from an axios error (Laravel validation format). */
export function apiError(err, t) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data
    if (data?.errors && typeof data.errors === 'object') {
      const first = Object.values(data.errors)[0]
      if (Array.isArray(first) && first.length) return first[0]
    }
    if (data?.message) return data.message
    if (err.code === 'ERR_NETWORK') {
      return t ? t('common.networkError') : 'Network error'
    }
  }
  return t ? t('common.genericError') : 'Error'
}
