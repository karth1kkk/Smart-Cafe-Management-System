import { Bell, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { useAuthStore } from '../../stores/authStore'

const titles: Record<string, string> = {
  '/': 'Menu',
  '/orders': 'Orders',
  '/menu': 'Menu management',
  '/inventory': 'Inventory',
  '/analytics': 'Analytics & reports',
}

function LiveClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <time
      dateTime={now.toISOString()}
      className="tabular-nums text-sm font-semibold text-slate-200"
    >
      {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </time>
  )
}

export function Navbar() {
  const { pathname } = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const pageTitle = titles[pathname] ?? 'Operations'

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/95 px-4 py-3 shadow-md md:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-sm font-bold text-white shadow-lg shadow-orange-900/40"
          aria-hidden
        >
          SC
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Smart Cafe</p>
          <h1 className="truncate text-base font-semibold text-white md:text-lg">{pageTitle}</h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 md:gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-slate-400 sm:flex">
          <Bell className="h-3.5 w-3.5 text-orange-400" aria-hidden />
          Orders sync live
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Time</p>
            <LiveClock />
          </div>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-center shadow-sm">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">{user?.role}</p>
          <p className="text-sm font-medium text-white">{user?.name}</p>

        </div>

        <button
          type="button"
          onClick={() => void logout()}
          className="inline-flex touch-manipulation items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
        >
          <LogOut className="h-4 w-4 text-orange-400" />
        </button>
      </div>
    </header>
  )
}
