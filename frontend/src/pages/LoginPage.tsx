import axios from 'axios'
import { ArrowLeft, Clock, Delete } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { api } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import type { StaffProfile } from '../types/api'

function parseStaffPayload(payload: unknown): { list: StaffProfile[]; valid: boolean } {
  if (payload === null || typeof payload !== 'object') {
    return { list: [], valid: false }
  }
  const raw = (payload as { data?: unknown }).data
  if (!Array.isArray(raw)) {
    return { list: [], valid: false }
  }
  const list: StaffProfile[] = []
  for (const row of raw) {
    if (
      typeof row === 'object' &&
      row !== null &&
      typeof (row as StaffProfile).id === 'number' &&
      typeof (row as StaffProfile).name === 'string' &&
      typeof (row as StaffProfile).role === 'string'
    ) {
      list.push(row as StaffProfile)
    }
  }
  return { list, valid: true }
}

const pinKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'] as const

const AVATAR_STYLES = [
  { ring: 'border-red-500', inner: 'bg-red-500/25', text: 'text-red-100' },
  { ring: 'border-amber-400', inner: 'bg-amber-400/25', text: 'text-amber-100' },
  { ring: 'border-emerald-500', inner: 'bg-emerald-500/25', text: 'text-emerald-100' },
  { ring: 'border-sky-500', inner: 'bg-sky-500/25', text: 'text-sky-100' },
  { ring: 'border-violet-500', inner: 'bg-violet-500/25', text: 'text-violet-100' },
  { ring: 'border-rose-500', inner: 'bg-rose-500/25', text: 'text-rose-100' },
] as const

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase() || '?'
}

function LiveClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <span className="tabular-nums text-sm font-medium text-slate-200">
      {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
    </span>
  )
}

type Step = 'profiles' | 'pin'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const loading = useAuthStore((state) => state.loading)
  const [staff, setStaff] = useState<StaffProfile[]>([])
  const [staffLoading, setStaffLoading] = useState(true)
  const [step, setStep] = useState<Step>('profiles')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const submitKeyRef = useRef<string | null>(null)

  const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'

  const loadStaff = useCallback(async () => {
    setStaffLoading(true)
    setLoadError(null)
    try {
      const response = await api.get('/staff')
      const { list, valid } = parseStaffPayload(response.data)
      if (!valid) {
        setStaff([])
        setLoadError(
          'Could not read staff from the API. For local dev use npm run dev (Vite proxies /api). For production, set VITE_API_URL if you use a different API than the default Heroku URL.',
        )
        return
      }
      setStaff(list)
    } catch (err) {
      setStaff([])
      const msg = import.meta.env.DEV
        ? 'Could not reach the API. Start the backend with php artisan serve (port 8000) and try again.'
        : 'Could not reach the API. Check Heroku CORS_ALLOWED_ORIGINS and SANCTUM_STATEFUL_DOMAINS include your Vercel URL, or set VITE_API_URL to your API origin and redeploy.'
      setLoadError(msg)
    } finally {
      setStaffLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStaff()
  }, [loadStaff])

  const selected = staff.find((s) => s.id === selectedId) ?? null

  useEffect(() => {
    if (pin.length < 6) {
      submitKeyRef.current = null
    }
  }, [pin])

  function appendDigit(d: string) {
    setError(null)
    setPin((current) => (current.length >= 6 ? current : current + d))
  }

  function backspace() {
    setError(null)
    setPin((current) => current.slice(0, -1))
  }

  function clearPin() {
    setError(null)
    setPin('')
  }

  function handlePadKey(key: (typeof pinKeys)[number]) {
    if (key === 'back') {
      backspace()
      return
    }
    if (key === 'clear') {
      clearPin()
      return
    }
    appendDigit(key)
  }

  useEffect(() => {
    if (step !== 'pin' || selectedId === null || pin.length !== 6 || loading) {
      return
    }

    const key = `${selectedId}:${pin}`
    if (submitKeyRef.current === key) {
      return
    }
    submitKeyRef.current = key

    void (async () => {
      setError(null)
      try {
        await login(selectedId, pin)
        navigate(destination, { replace: true })
      } catch (err) {
        submitKeyRef.current = null
        if (axios.isAxiosError(err)) {
          const status = err.response?.status
          const data = err.response?.data as { errors?: Record<string, string[]>; message?: string } | undefined
          if (status === 422 || status === 401) {
            const first = data?.errors ? Object.values(data.errors).flat()[0] : undefined
            const message = typeof data?.message === 'string' ? data.message : undefined
            setError(first ?? message ?? 'Check your PIN and try again.')
          } else if (status === 419) {
            setError('Session expired. Refresh the page and try again.')
          } else {
            setError('Wrong PIN or sign-in failed.')
          }
        } else {
          setError('Wrong PIN or sign-in failed.')
        }
        setPin('')
      }
    })()
  }, [destination, loading, login, navigate, pin, selectedId, step])

  function handleProfileSelect(id: number) {
    setSelectedId(id)
    setError(null)
    setPin('')
    setStep('pin')
  }

  function handleBackToProfiles() {
    submitKeyRef.current = null
    setStep('profiles')
    setSelectedId(null)
    setPin('')
    setError(null)
  }

  function handleReset() {
    setError(null)
    if (step === 'pin') {
      setPin('')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Subtle vignette — no photo backgrounds */}
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(234,88,12,0.12),_transparent_50%)]"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        {/* Top bar */}
        <header className="flex shrink-0 items-center justify-between gap-4 px-4 pt-4 md:px-8 md:pt-6">
          <div className="flex items-center gap-2 rounded-full border border-slate-600/80 bg-slate-800/90 px-3 py-2 shadow-lg backdrop-blur-sm">
            {step === 'pin' ? (
              <button
                type="button"
                onClick={handleBackToProfiles}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-200 transition hover:bg-slate-700"
                aria-label="Back to profiles"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : null}
            <div className="flex h-9 w-9 items-center justify-center text-slate-300">
              <Clock className="h-5 w-5" />
            </div>
            <LiveClock />
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            Reset
          </button>
        </header>

        {/* Scrollable main — fixes profiles being clipped off-screen */}
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-10 pt-4 md:px-8 md:pb-12 md:pt-6">
          {/* Brand */}
          <div className="flex shrink-0 flex-col items-center text-center">
            <div className="text-3xl font-bold tracking-tight md:text-4xl">
              <span className="text-orange-500">Smart</span>
              <span className="text-white"> Cafe</span>
            </div>
            <div className="mt-4 h-px w-40 max-w-[80vw] bg-gradient-to-r from-transparent via-slate-500 to-transparent" />
            <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.35em] text-slate-400 md:text-xs">
              Cafe management system
            </p>
          </div>

          {/* Mode toggle */}
          <div className="mx-auto mt-8 flex shrink-0 rounded-full border border-slate-600 bg-slate-800/80 p-1 shadow-inner backdrop-blur-sm">
            <button
              type="button"
              onClick={() => {
                setStep('profiles')
                setPin('')
                setError(null)
              }}
              className={[
                'rounded-full px-6 py-2.5 text-sm font-semibold transition md:min-w-[140px]',
                step === 'profiles' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-300 hover:text-white',
              ].join(' ')}
            >
              Select profile
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedId !== null) setStep('pin')
              }}
              disabled={selectedId === null}
              className={[
                'rounded-full px-6 py-2.5 text-sm font-semibold transition md:min-w-[140px]',
                step === 'pin' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-300 hover:text-white',
                selectedId === null ? 'cursor-not-allowed opacity-50' : '',
              ].join(' ')}
            >
              PIN login
            </button>
          </div>

          {loadError ? (
            <div className="mx-auto mt-6 max-w-lg rounded-xl border border-red-500/40 bg-red-950/50 px-4 py-4 text-center text-sm text-red-100">
              <p>{loadError}</p>
              <button
                type="button"
                onClick={() => void loadStaff()}
                className="mt-3 rounded-lg border border-red-400/50 bg-red-900/40 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-red-900/60"
              >
                Retry
              </button>
            </div>
          ) : null}

          {error ? (
            <div className="mx-auto mt-4 max-w-lg rounded-xl border border-red-500/40 bg-red-950/50 px-4 py-3 text-center text-sm text-red-100">
              {error}
            </div>
          ) : null}

          {/* Step: profiles */}
          {step === 'profiles' ? (
            <div className="mt-10 flex w-full max-w-4xl flex-col items-center self-center">
              {staffLoading ? (
                <p className="text-center text-slate-400">Loading profiles…</p>
              ) : staff.length === 0 && !loadError ? (
                <div className="max-w-md space-y-4 text-center">
                  <p className="text-slate-300">No staff accounts in the database.</p>
                  <p className="text-sm text-slate-500">
                    {import.meta.env.DEV ? (
                      <>
                        In the{' '}
                        <code className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">backend</code> folder run:{' '}
                        <code className="font-mono text-orange-400">php artisan migrate --seed</code>
                      </>
                    ) : (
                      <>
                        Migrations only create tables; staff come from the seeder. On Heroku run:{' '}
                        <code className="mt-2 block break-all font-mono text-[11px] text-orange-400">
                          heroku run &quot;cd backend &amp;&amp; php artisan db:seed --force&quot; -a YOUR_APP_NAME
                        </code>
                      </>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => void loadStaff()}
                    className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex w-full flex-wrap items-center justify-center gap-4 md:gap-6">
                    {staff.map((person, index) => {
                      const style = AVATAR_STYLES[index % AVATAR_STYLES.length]
                      const initials = initialsFromName(person.name)
                      return (
                        <button
                          key={person.id}
                          type="button"
                          onClick={() => handleProfileSelect(person.id)}
                          className="group flex w-[120px] flex-col items-center gap-3 rounded-2xl border border-slate-600 bg-slate-800/90 p-4 shadow-lg backdrop-blur-sm transition hover:border-orange-500/50 hover:bg-slate-800 md:w-[140px]"
                        >
                          <div
                            className={[
                              'flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 text-xl font-bold',
                              style.ring,
                              style.inner,
                              style.text,
                            ].join(' ')}
                          >
                            {initials}
                          </div>
                          <span className="text-center text-sm font-semibold leading-tight text-white">
                            {person.name}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide text-slate-400">
                            {person.role}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  {/* <p className="mt-10 text-center text-xs text-slate-500">
                    Demo PINs: Admin <span className="font-mono text-orange-400">123456</span> · Barista{' '}
                    <span className="font-mono text-orange-400">654321</span>
                  </p> */}
                </>
              )}
            </div>
          ) : null}

          {/* Step: PIN */}
          {step === 'pin' && selected ? (
            <div className="mt-10 flex w-full max-w-md flex-col items-center self-center pb-8">
              <p className="mb-6 text-center text-sm text-slate-300">
                Enter PIN for <span className="font-semibold text-white">{selected.name}</span>
              </p>

              <div
                className="mb-10 flex justify-center gap-3 md:gap-4"
                role="status"
                aria-label="PIN digits entered"
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <span
                    key={i}
                    className={[
                      'h-4 w-4 rounded-full border-2 transition md:h-5 md:w-5',
                      i < pin.length ? 'border-orange-400 bg-orange-500' : 'border-slate-500 bg-transparent',
                    ].join(' ')}
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2.5 md:gap-4">
                {pinKeys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    disabled={loading}
                    onClick={() => handlePadKey(key)}
                    className={[
                      'flex h-16 w-16 touch-manipulation items-center justify-center rounded-full border border-slate-600 text-xl font-semibold text-white shadow-lg transition',
                      'bg-slate-800/90 hover:bg-slate-700 active:scale-95 disabled:opacity-50',
                      'md:h-20 md:w-20 md:text-2xl',
                    ].join(' ')}
                  >
                    {key === 'back' ? <Delete className="h-6 w-6 md:h-7 md:w-7" /> : key === 'clear' ? 'C' : key}
                  </button>
                ))}
              </div>

              {loading ? <p className="mt-8 text-sm text-slate-400">Signing in…</p> : null}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
