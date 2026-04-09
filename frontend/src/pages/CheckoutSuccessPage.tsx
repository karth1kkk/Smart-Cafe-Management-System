import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { api } from '../lib/api'
import { useCartStore } from '../stores/cartStore'
import type { ApiResource, Order } from '../types/api'

export function CheckoutSuccessPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const clear = useCartStore((state) => state.clear)
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const sessionId = params.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }

    void (async () => {
      try {
        await api.post<ApiResource<Order>>('/checkout/complete', {
          session_id: sessionId,
        })
        clear()
        setStatus('ok')
        window.setTimeout(() => navigate('/', { replace: true }), 2000)
      } catch {
        setStatus('error')
      }
    })()
  }, [sessionId, clear, navigate])

  if (!sessionId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
        <p className="text-center text-slate-400">Missing checkout session. Return to the register.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
        {status === 'loading' ? (
          <p className="text-slate-300">Confirming payment with the server…</p>
        ) : null}
        {status === 'ok' ? (
          <>
            <p className="text-lg font-semibold text-emerald-400">Payment received</p>
            <p className="mt-2 text-sm text-slate-400">Your order is in the queue. Redirecting…</p>
          </>
        ) : null}
        {status === 'error' ? (
          <>
            <p className="text-lg font-semibold text-red-400">Could not confirm payment</p>
            <p className="mt-2 text-sm text-slate-400">
              Try again from the register or check that STRIPE_SECRET matches your Stripe account.
            </p>
          </>
        ) : null}
      </div>
    </div>
  )
}
