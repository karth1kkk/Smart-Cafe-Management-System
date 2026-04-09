import { BarChart3, Coffee, Package2, ShoppingCart, SquareMenu } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { useAuthStore } from '../../stores/authStore'

const baristaLinks = [
  { to: '/', label: 'POS', shortLabel: 'POS', icon: Coffee },
  { to: '/orders', label: 'Orders', shortLabel: 'Orders', icon: ShoppingCart },
]

const adminLinks = [
  ...baristaLinks,
  { to: '/menu', label: 'Menu', shortLabel: 'Menu', icon: SquareMenu },
  { to: '/inventory', label: 'Stock', shortLabel: 'Stock', icon: Package2 },
  { to: '/analytics', label: 'Reports', shortLabel: 'Reports', icon: BarChart3 },
]

export function Sidebar() {
  const user = useAuthStore((state) => state.user)
  const links = user?.role === 'admin' ? adminLinks : baristaLinks

  return (
    <aside className="w-full shrink-0 border-b border-slate-800 bg-slate-900 md:w-[220px] md:border-b-0 md:border-r md:border-slate-800">
      <nav className="flex gap-1 overflow-x-auto p-2 md:flex-col md:overflow-visible">
        {links.map(({ icon: Icon, label, shortLabel, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={label}
            className={({ isActive }) =>
              [
                'flex min-h-[44px] shrink-0 touch-manipulation items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition md:w-full',
                isActive
                  ? 'bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/40'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white',
              ].join(' ')
            }
          >
            <Icon className="h-5 w-5 shrink-0 text-orange-400 opacity-90" />
            <span className="hidden md:inline">{label}</span>
            <span className="md:hidden">{shortLabel}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
