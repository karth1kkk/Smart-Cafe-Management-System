import type { Order, OrderStatus } from '../../types/api'

const statusClasses: Record<OrderStatus, string> = {
  pending: 'border-amber-500/40 bg-amber-950/50 text-amber-200',
  preparing: 'border-sky-500/40 bg-sky-950/50 text-sky-200',
  completed: 'border-emerald-500/40 bg-emerald-950/50 text-emerald-200',
}

interface OrderCardProps {
  order: Order
  onStatusChange?: (nextStatus: OrderStatus) => void
}

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Order #{order.id}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            {order.barista?.name ?? 'Barista'}
          </h3>
          <p className="text-sm text-slate-400">
            {order.placed_at ? new Date(order.placed_at).toLocaleString() : 'Just now'}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${statusClasses[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      <div className="space-y-2">
        {order.items.map((item) => (
          <div
            key={`${order.id}-${item.menu_item_id}-${item.id ?? item.item_name_snapshot}`}
            className="rounded-lg border border-slate-700 bg-slate-800/80 p-3"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-white">
                {item.quantity}x {item.item_name_snapshot}
              </span>
              <span className="font-medium text-slate-300">${item.line_total?.toFixed(2)}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {item.size}
              {item.milk_type ? ` · ${item.milk_type}` : ''}
              {item.addons.length > 0 ? ` · ${item.addons.join(', ')}` : ''}
            </p>
          </div>
        ))}
      </div>

      {onStatusChange ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {(['pending', 'preparing', 'completed'] as OrderStatus[]).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(status)}
              className="touch-manipulation rounded-lg border border-slate-600 bg-slate-800 px-2 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-orange-500/50 hover:bg-orange-950/40 hover:text-orange-200"
            >
              {status}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  )
}
