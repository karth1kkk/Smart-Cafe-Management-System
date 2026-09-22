import axios from 'axios'

/**
 * Deployed Laravel API (Render). Used in production when VITE_API_URL is unset.
 * Override with VITE_API_URL for staging or another backend.
 */
const DEFAULT_PRODUCTION_API_ORIGIN = 'https://smart-cafe-management-system-qh9s.onrender.com'

const envApiUrl = import.meta.env.VITE_API_URL

/**
 * API origin for Laravel (Sanctum + /api).
 * - Dev: leave VITE_API_URL unset → same-origin `/api` (Vite proxies to :8000).
 * - Prod: VITE_API_URL if set, else DEFAULT_PRODUCTION_API_ORIGIN (no :8000).
 */
export function getApiOrigin(): string {
  const raw = typeof envApiUrl === 'string' ? envApiUrl.trim() : ''
  if (raw !== '') {
    return raw.replace(/\/$/, '')
  }
  if (import.meta.env.DEV) {
    return ''
  }
  return DEFAULT_PRODUCTION_API_ORIGIN
}

export const api = axios.create({
  baseURL: `${getApiOrigin()}/api`,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor: attach the auth token if it exists.
 * This fixes the "Unauthenticated" error on protected routes like /checkout.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Response interceptor: log real errors so you stop seeing misleading messages.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `API error ${error.response.status} on ${error.config?.url}:`,
        error.response.data,
      )
    } else {
      console.error('API network error:', error.message)
    }
    return Promise.reject(error)
  },
)

export async function ensureCsrfCookie() {
  await axios.get(`${getApiOrigin()}/sanctum/csrf-cookie`, {
    withCredentials: true,
  })
}