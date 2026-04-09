import axios from 'axios'

/**
 * Same host the SPA uses for `/api`. In dev, leave VITE_API_URL unset so requests
 * use same-origin `/api` (Vite proxies to Laravel). Set VITE_API_URL for a remote API
 * or a production build served without a proxy.
 */
export function getApiOrigin(): string {
  const env = import.meta.env.VITE_API_URL
  if (env !== undefined && String(env).trim() !== '') {
    return String(env).replace(/\/$/, '')
  }
  if (import.meta.env.DEV) {
    return ''
  }
  return 'http://localhost:8000'
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
