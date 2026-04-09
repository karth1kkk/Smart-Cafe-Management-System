import { Plus } from 'lucide-react'

import type { MenuItem } from '../../types/api'

interface MenuItemCardProps {
  item: MenuItem
  onAdd: () => void
}

export function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-sm transition hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-950/20">
      <button
        type="button"
        onClick={onAdd}
        disabled={!item.is_available}
        aria-label={item.is_available ? `Add ${item.name} to order` : `${item.name} is unavailable`}
        className="relative flex aspect-[4/3] w-full flex-col overflow-hidden bg-slate-800 text-left outline-none ring-orange-500 focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {item.image_url ? (
          <img src={item.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {item.category?.name ?? 'Item'}
            </span>
          </div>
        )}
        <span className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 text-white shadow-md transition group-hover:bg-orange-500">
          <Plus className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/55 to-transparent px-2 py-3 pt-8">
          <span className="text-lg font-bold text-white drop-shadow-sm">
            ${item.price.toFixed(2)}
          </span>
        </span>
      </button>

      <div className="flex min-h-0 flex-1 flex-col gap-1 p-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {item.category?.name ?? 'Menu'}
        </p>
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-white">
          {item.name}
        </h3>
        {item.description ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-400">{item.description}</p>
        ) : null}
        {!item.is_available ? (
          <p className="mt-auto pt-1 text-center text-[11px] font-semibold uppercase tracking-wide text-red-400">
            Out of stock
          </p>
        ) : null}
      </div>
    </article>
  )
}
