import { useEffect, useState } from 'react'

import { api } from '../lib/api'
import type { ApiCollection, InventoryItem } from '../types/api'

export function InventoryDashboardPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])

  useEffect(() => {
    async function loadInventory() {
      const response = await api.get<ApiCollection<InventoryItem>>('/inventory')
      setInventory(response.data.data)
    }

    void loadInventory()
  }, [])

  async function updateStock(item: InventoryItem, value: number) {
    const response = await api.patch<{ data: InventoryItem }>(`/inventory/${item.id}`, {
      current_stock: value,
      note: 'Adjusted from dashboard',
    })

    setInventory((current) =>
      current.map((inventoryItem) =>
        inventoryItem.id === item.id ? response.data.data : inventoryItem,
      ),
    )
  }

  return (
    <section className="space-y-5">
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Stock</p>
        <h2 className="mt-2 text-2xl font-bold text-white">Ingredient levels</h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {inventory.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Threshold: {item.low_stock_threshold} {item.unit}
                </p>
              </div>
              <span
                className={[
                  'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                  item.is_low_stock
                    ? 'border border-red-500/40 bg-red-950/50 text-red-300'
                    : 'border border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
                ].join(' ')}
              >
                {item.is_low_stock ? 'Low stock' : 'Healthy'}
              </span>
            </div>

            <div className="mt-5 rounded-lg border border-slate-700 bg-slate-800/80 p-4">
              <label className="text-sm font-medium text-slate-300">
                Current stock ({item.unit})
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={item.current_stock}
                  onBlur={(event) => void updateStock(item, Number(event.target.value))}
                  className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none focus:border-orange-500"
                />
              </label>
            </div>

            {item.latest_log ? (
              <p className="mt-4 text-sm text-slate-400">
                Latest: {item.latest_log.note} ({item.latest_log.quantity_delta})
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
