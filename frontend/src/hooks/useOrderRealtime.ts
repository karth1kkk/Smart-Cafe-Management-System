import { useEffect } from 'react'

import { getEcho } from '../lib/echo'
import { useAuthStore } from '../stores/authStore'
import type { Order } from '../types/api'

interface Options {
  onCreated?: (order: Order) => void
  onUpdated?: (order: Order) => void
}

export function useOrderRealtime({ onCreated, onUpdated }: Options) {
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (!user) {
      return
    }

    const echo = getEcho()
    if (!echo) {
      return
    }

    const channel = echo.private('orders')

    channel.listen('.order.created', ({ order }: { order: Order }) => {
      onCreated?.(order)
      window.dispatchEvent(new CustomEvent('smart-cafe-order-created'))
    })

    channel.listen('.order.status.updated', ({ order }: { order: Order }) => {
      onUpdated?.(order)
    })

    return () => {
      try {
        echo.leave('private-orders')
      } catch {
        // ignore teardown errors
      }
    }
  }, [onCreated, onUpdated, user])
}
