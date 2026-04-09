import clsx from 'clsx'
import { Outlet, useLocation } from 'react-router-dom'

import { useIdleLogout } from '../../hooks/useIdleLogout'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const { pathname } = useLocation()
  const isPos = pathname === '/'

  useIdleLogout()

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <div className="flex min-h-0 flex-1 md:flex">
        <Sidebar />
        <main
          className={clsx(
            'min-h-0 flex-1',
            isPos
              ? 'flex flex-col overflow-hidden p-0'
              : 'overflow-auto bg-slate-950 p-4 md:p-6',
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
