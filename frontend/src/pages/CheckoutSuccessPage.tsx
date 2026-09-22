import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { api } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'
import type { ApiResource, Order } from '../types/api'

export function CheckoutSuccessPage() {
  const [params] = useSearchParams()
  const clear = useCartStore((state) => state.clear)
  const bootstrap = useAuthStore((state) => state.bootstrap)
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
      } catch {
        setStatus('error')
      } finally {
        // Re-sync auth state from the server so the session cookie is
        // re-validated after the cross-domain redirect from Stripe.
        await bootstrap()
      }
    })()
  }, [sessionId, clear, bootstrap])

  if (!sessionId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
          <p className="text-lg font-semibold text-red-400">Missing checkout session</p>
          <p className="mt-2 text-sm text-slate-400">Return to the register to try again.</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700"
          >
            Back to Register
          </Link>
        </div>
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
            <p className="mt-2 text-sm text-slate-400">Your order is in the queue. Thank you!</p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700"
            >
              Back to Register
            </Link>
          </>
        ) : null}
        {status === 'error' ? (
          <>
            <p className="text-lg font-semibold text-red-400">Could not confirm payment</p>
            <p className="mt-2 text-sm text-slate-400">
              Try again from the register or check that STRIPE_SECRET matches your Stripe account.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700"
            >
              Back to Register
            </Link>
          </>
        ) : null}
      </div>
    </div>
  )
}