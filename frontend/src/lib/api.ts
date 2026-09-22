import axios from 'axios'

import { useAuthStore } from '../stores/authStore'

const DEFAULT_PRODUCTION_API_ORIGIN = 'https://smart-cafe-management-system-qh9s.onrender.com'

const envApiUrl = import.meta.env.VITE_API_URL

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
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.setState({ user: null, token: null })
    }
    return Promise.reject(error)
  },
)

// No longer needed with token auth — kept as a no-op for compatibility.
export async function ensureCsrfCookie() {
  return
}