import { Link } from 'react-router-dom'

export function CheckoutCancelPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
        <p className="text-lg font-semibold text-slate-200">Checkout cancelled</p>
        <p className="mt-2 text-sm text-slate-400">No charge was made. You can return to the register to try again.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-500"
        >
          Back to register
        </Link>
      </div>
    </div>
  )
}
