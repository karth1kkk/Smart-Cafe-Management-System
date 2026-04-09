import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { api } from '../lib/api'
import type { AnalyticsSummary, ApiResource } from '../types/api'

export function AnalyticsDashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)

  useEffect(() => {
    async function loadSummary() {
      const response = await api.get<ApiResource<AnalyticsSummary>>('/analytics/summary')
      setSummary(response.data.data)
    }

    void loadSummary()
  }, [])

  if (!summary) {
    return <div className="text-slate-500">Loading analytics…</div>
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Reports</p>
        <h2 className="mt-2 text-2xl font-bold text-white">Revenue & team</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Daily revenue', summary.revenue.daily],
          ['Weekly revenue', summary.revenue.weekly],
          ['Monthly revenue', summary.revenue.monthly],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-bold text-white">${Number(value).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="min-w-0 rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-white">Sales trend</h3>
          <div className="mt-6 h-80 w-full min-w-0">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={summary.recent_sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="sale_date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="revenue" fill="#ea580c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-white">Top sellers</h3>
            <div className="mt-4 space-y-2">
              {summary.top_selling_items.map((item) => (
                <div key={item.name} className="rounded-lg border border-slate-700 bg-slate-800/80 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-white">{item.name}</span>
                    <span className="font-semibold text-orange-400">${item.revenue.toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{item.quantity_sold} sold</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-white">Barista leaderboard</h3>
            <div className="mt-4 space-y-2">
              {summary.staff_leaderboard.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/80 p-4"
                >
                  <div>
                    <p className="font-medium text-white">{staff.name}</p>
                    <p className="text-xs text-slate-500">{staff.orders_handled} orders</p>
                  </div>
                  <span className="font-semibold text-orange-400">${staff.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
