import { create } from 'zustand'

import { ADD_ON_PRICES, SIZE_PRICE_ADJUSTMENTS } from '../constants/options'
import type { AddOn, CartItem, MenuItem, MilkType, SizeOption } from '../types/api'

interface CartState {
  items: CartItem[]
  addItem: (menuItem: MenuItem) => void
  updateItem: (
    key: string,
    changes: Partial<Pick<CartItem, 'quantity' | 'size' | 'milk_type' | 'addons'>>,
  ) => void
  removeItem: (key: string) => void
  clear: () => void
  getSubtotal: () => number
}

const defaultItemState = {
  quantity: 1,
  size: 'M' as SizeOption,
  milk_type: 'full cream' as MilkType,
  addons: [] as AddOn[],
}

function calculateUnitPrice(menuItem: MenuItem, size: SizeOption, addons: AddOn[]) {
  const addOnsPrice = addons.reduce((total, addon) => total + ADD_ON_PRICES[addon], 0)
  return Number((menuItem.price + SIZE_PRICE_ADJUSTMENTS[size] + addOnsPrice).toFixed(2))
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem(menuItem) {
    const unitPrice = calculateUnitPrice(menuItem, defaultItemState.size, defaultItemState.addons)

    set((state) => ({
      items: [
        ...state.items,
        {
          key: crypto.randomUUID(),
          menuItem,
          menu_item_id: menuItem.id,
          quantity: defaultItemState.quantity,
          size: defaultItemState.size,
          milk_type: defaultItemState.milk_type,
          addons: defaultItemState.addons,
          item_name_snapshot: menuItem.name,
          unit_price: unitPrice,
          line_total: unitPrice,
        },
      ],
    }))
  },
  updateItem(key, changes) {
    set((state) => ({
      items: state.items.map((item) => {
        if (item.key !== key) {
          return item
        }

        const nextItem = { ...item, ...changes }
        const unitPrice = calculateUnitPrice(nextItem.menuItem, nextItem.size, nextItem.addons)

        return {
          ...nextItem,
          unit_price: unitPrice,
          line_total: Number((unitPrice * nextItem.quantity).toFixed(2)),
        }
      }),
    }))
  },
  removeItem(key) {
    set((state) => ({
      items: state.items.filter((item) => item.key !== key),
    }))
  },
  clear() {
    set({ items: [] })
  },
  getSubtotal() {
    return Number(
      get()
        .items.reduce((total, item) => total + (item.line_total ?? 0), 0)
        .toFixed(2),
    )
  },
}))
