import { useEffect, useState } from 'react'

import { OrderCard } from '../components/orders/OrderCard'
import { useOrderRealtime } from '../hooks/useOrderRealtime'
import { api } from '../lib/api'
import type { ApiCollection, Order, OrderStatus } from '../types/api'

function playNotificationTone() {
  const context = new AudioContext()
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.type = 'triangle'
  oscillator.frequency.value = 880
  gain.gain.value = 0.05
  oscillator.start()
  oscillator.stop(context.currentTime + 0.15)
}

export function OrdersQueuePage() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    async function loadOrders() {
      const response = await api.get<ApiCollection<Order>>('/orders')
      setOrders(response.data.data)
    }

    void loadOrders()
  }, [])

  useEffect(() => {
    const listener = () => {
      void playNotificationTone()
    }

    window.addEventListener('smart-cafe-order-created', listener)
    return () => window.removeEventListener('smart-cafe-order-created', listener)
  }, [])

  useOrderRealtime({
    onCreated(order) {
      setOrders((current) => [order, ...current.filter((existing) => existing.id !== order.id)])
    },
    onUpdated(order) {
      setOrders((current) => current.map((existing) => (existing.id === order.id ? order : existing)))
    },
  })

  async function handleStatusChange(orderId: number, status: OrderStatus) {
    const response = await api.patch<{ data: Order }>(`/orders/${orderId}/status`, { status })
    setOrders((current) =>
      current.map((order) => (order.id === orderId ? response.data.data : order)),
    )
  }

  return (
    <section className="space-y-5">
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Live queue</p>
        <h2 className="mt-2 text-2xl font-bold text-white">Kitchen display</h2>
        <p className="mt-2 text-sm text-slate-400">
          New orders appear instantly. Tap a status to move the ticket through prep.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onStatusChange={(status) => void handleStatusChange(order.id, status)}
          />
        ))}
      </div>
    </section>
  )
}
