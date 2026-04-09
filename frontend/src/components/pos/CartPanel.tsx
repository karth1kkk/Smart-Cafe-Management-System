import { useMemo } from 'react'
import { Trash2 } from 'lucide-react'

import { ADD_ON_OPTIONS, MILK_OPTIONS, SIZE_OPTIONS } from '../../constants/options'
import { useCartStore } from '../../stores/cartStore'
import type { AddOn, MilkType, SizeOption } from '../../types/api'

interface CartPanelProps {
  placingOrder: boolean
  onPayWithStripe: () => void
}

export function CartPanel({ placingOrder, onPayWithStripe }: CartPanelProps) {
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateItem = useCartStore((state) => state.updateItem)
  const subtotal = useMemo(
    () => items.reduce((total, item) => total + (item.line_total ?? 0), 0),
    [items],
  )

  return (
    <aside className="flex max-h-[55vh] w-full shrink-0 flex-col border-t border-slate-800 bg-slate-900 shadow-[0_-4px_24px_rgba(0,0,0,0.4)] xl:max-h-none xl:h-full xl:max-w-[420px] xl:border-l xl:border-t-0 xl:shadow-none">
      <div className="shrink-0 border-b border-slate-800 bg-slate-900/90 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Current ticket
        </p>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold text-white">Order</h2>
          <span className="text-sm text-slate-500">{items.length} line(s)</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-800/50 px-4 py-10 text-center text-sm text-slate-500">
            Tap products on the left to build an order.
          </div>
        ) : null}

        {items.map((item) => (
          <div
            key={item.key}
            className="rounded-xl border border-slate-700 bg-slate-800/80 p-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold leading-tight text-white">
                  {item.menuItem.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-orange-400">
                  ${item.line_total?.toFixed(2)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.key)}
                className="touch-manipulation rounded-lg border border-slate-600 p-2 text-slate-400 transition hover:border-red-500/50 hover:bg-red-950/40 hover:text-red-300"
                aria-label="Remove line"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="text-xs font-medium text-slate-500">
                Qty
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(event) =>
                    updateItem(item.key, { quantity: Number(event.target.value) || 1 })
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-slate-600 bg-slate-900 px-2 text-sm text-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </label>

              <label className="text-xs font-medium text-slate-500">
                Size
                <select
                  value={item.size}
                  onChange={(event) =>
                    updateItem(item.key, { size: event.target.value as SizeOption })
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-slate-600 bg-slate-900 px-2 text-sm text-white outline-none focus:border-orange-500"
                >
                  {SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-medium text-slate-500">
                Milk
                <select
                  value={item.milk_type ?? ''}
                  onChange={(event) =>
                    updateItem(item.key, { milk_type: event.target.value as MilkType })
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-slate-600 bg-slate-900 px-2 text-sm text-white outline-none focus:border-orange-500"
                >
                  {MILK_OPTIONS.map((milk) => (
                    <option key={milk} value={milk}>
                      {milk}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-medium text-slate-500">
                Add-ons
                <select
                  value=""
                  onChange={(event) => {
                    const selectedAddOn = event.target.value as AddOn
                    if (!selectedAddOn || item.addons.includes(selectedAddOn)) {
                      return
                    }

                    updateItem(item.key, { addons: [...item.addons, selectedAddOn] })
                  }}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-600 bg-slate-900 px-2 text-sm text-white outline-none focus:border-orange-500"
                >
                  <option value="">Add…</option>
                  {ADD_ON_OPTIONS.map((addOn) => (
                    <option key={addOn} value={addOn}>
                      {addOn}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {item.addons.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.addons.map((addOn) => (
                  <button
                    key={addOn}
                    type="button"
                    onClick={() =>
                      updateItem(item.key, {
                        addons: item.addons.filter((value) => value !== addOn),
                      })
                    }
                    className="touch-manipulation rounded-full border border-orange-500/30 bg-orange-500/15 px-2.5 py-1 text-xs font-medium text-orange-200"
                  >
                    {addOn} ×
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="shrink-0 space-y-3 border-t border-slate-800 bg-slate-900 px-4 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-400">Subtotal</span>
          <span className="text-lg font-bold text-white">${subtotal.toFixed(2)}</span>
        </div>
        <p className="text-xs leading-relaxed text-slate-500">
          You’ll be redirected to Stripe Checkout to pay securely. After payment you’ll return here to
          confirm the order.
        </p>
        <button
          type="button"
          onClick={onPayWithStripe}
          disabled={items.length === 0 || placingOrder}
          className="touch-manipulation h-14 w-full rounded-xl bg-orange-600 text-base font-bold text-white shadow-md transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none"
        >
          {placingOrder ? 'Redirecting…' : 'Pay with Stripe'}
        </button>
      </div>
    </aside>
  )
}
