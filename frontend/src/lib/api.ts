import axios from 'axios'

/**
 * Deployed Laravel API (Heroku). Used in production when VITE_API_URL is unset.
 * Override with VITE_API_URL for staging or another backend.
 */
const DEFAULT_PRODUCTION_API_ORIGIN = 'https://smartcafe-backend-3d04a0fbb50e.herokuapp.com'

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

export async function ensureCsrfCookie() {
  await axios.get(`${getApiOrigin()}/sanctum/csrf-cookie`, {
    withCredentials: true,
  })
}
