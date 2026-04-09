import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { MenuItemCard } from '../components/menu/MenuItemCard'
import { CartPanel } from '../components/pos/CartPanel'
import { api } from '../lib/api'
import { useCartStore } from '../stores/cartStore'
import type { ApiCollection, MenuItem } from '../types/api'

const menuCacheKey = 'smart-cafe-menu-cache'

export function PosDashboardPage() {
  const addItem = useCartStore((state) => state.addItem)
  const items = useCartStore((state) => state.items)
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadMenu() {
      try {
        const response = await api.get<ApiCollection<MenuItem>>('/menu')
        setMenu(response.data.data)
        localStorage.setItem(menuCacheKey, JSON.stringify(response.data.data))
      } catch {
        const cached = localStorage.getItem(menuCacheKey)
        if (cached) {
          setMenu(JSON.parse(cached) as MenuItem[])
          setMessage('Offline mode: serving last cached menu.')
        }
      }
    }

    void loadMenu()
  }, [])

  const categories = useMemo(
    () => ['all', ...new Set(menu.map((item) => item.category?.slug ?? 'uncategorized'))],
    [menu],
  )

  const filteredMenu = useMemo(
    () =>
      menu.filter((item) => {
        const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase())
        const matchesCategory =
          activeCategory === 'all' || item.category?.slug === activeCategory

        return matchesQuery && matchesCategory
      }),
    [activeCategory, menu, query],
  )

  async function payWithStripe() {
    setMessage(null)
    setPlacingOrder(true)

    try {
      const { data } = await api.post<{ data: { url: string } }>('/checkout', {
        items: items.map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          size: item.size,
          milk_type: item.milk_type,
          addons: item.addons,
        })),
      })

      window.location.assign(data.data.url)
    } catch {
      setMessage(
        'Could not start Stripe checkout. Set STRIPE_SECRET on the server and ensure the order total is at least $0.50.',
      )
      setPlacingOrder(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden xl:flex-row">
      <section className="flex min-h-0 min-h-[45vh] flex-1 flex-col overflow-hidden bg-slate-900/40 xl:min-h-0">
        <div className="shrink-0 border-b border-slate-800 bg-slate-900 px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Register
              </p>
              <p className="mt-0.5 text-sm text-slate-400">
                Tap items to add · search or pick a category
              </p>
            </div>
            <div className="relative w-full lg:max-w-md">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search menu…"
                className="h-11 w-full rounded-lg border border-slate-700 bg-slate-800 pl-10 pr-4 text-sm text-white outline-none ring-orange-500/30 transition placeholder:text-slate-500 focus:border-orange-500 focus:ring-2"
              />
            </div>
          </div>

          {message ? (
            <div
              className="mt-3 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm text-orange-200"
              role="status"
            >
              {message}
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-b border-slate-800 bg-slate-900 px-2 py-2">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={[
                  'touch-manipulation shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold transition',
                  activeCategory === category
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700',
                ].join(' ')}
              >
                {category === 'all' ? 'All items' : category}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 md:px-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredMenu.map((item) => (
              <MenuItemCard key={item.id} item={item} onAdd={() => addItem(item)} />
            ))}
          </div>
          {filteredMenu.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-slate-500">
              No items match your filters.
            </div>
          ) : null}
        </div>
      </section>

      <CartPanel placingOrder={placingOrder} onPayWithStripe={() => void payWithStripe()} />
    </div>
  )
}
