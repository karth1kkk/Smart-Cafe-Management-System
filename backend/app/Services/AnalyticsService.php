<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    public function summary(): array
    {
        $now = now();

        return [
            'revenue' => [
                'daily' => $this->revenueForWindow($now->copy()->startOfDay(), $now),
                'weekly' => $this->revenueForWindow($now->copy()->startOfWeek(), $now),
                'monthly' => $this->revenueForWindow($now->copy()->startOfMonth(), $now),
            ],
            'orders_count' => [
                'daily' => $this->orderCountForWindow($now->copy()->startOfDay(), $now),
                'weekly' => $this->orderCountForWindow($now->copy()->startOfWeek(), $now),
                'monthly' => $this->orderCountForWindow($now->copy()->startOfMonth(), $now),
            ],
            'top_selling_items' => DB::table('order_items')
                ->select('item_name_snapshot as name', DB::raw('SUM(quantity) as quantity_sold'), DB::raw('SUM(line_total) as revenue'))
                ->groupBy('item_name_snapshot')
                ->orderByDesc('quantity_sold')
                ->limit(5)
                ->get()
                ->map(fn ($item) => [
                    'name' => $item->name,
                    'quantity_sold' => (int) $item->quantity_sold,
                    'revenue' => (float) $item->revenue,
                ])
                ->all(),
            'staff_leaderboard' => DB::table('orders')
                ->join('users', 'users.id', '=', 'orders.user_id')
                ->select('users.id', 'users.name', DB::raw('COUNT(orders.id) as orders_handled'), DB::raw('SUM(orders.total) as revenue'))
                ->groupBy('users.id', 'users.name')
                ->orderByDesc('orders_handled')
                ->limit(10)
                ->get()
                ->map(fn ($staff) => [
                    'id' => (int) $staff->id,
                    'name' => $staff->name,
                    'orders_handled' => (int) $staff->orders_handled,
                    'revenue' => (float) $staff->revenue,
                ])
                ->all(),
            'recent_sales' => Order::query()
                ->selectRaw('DATE(placed_at) as sale_date, SUM(total) as revenue, COUNT(*) as orders_count')
                ->whereNotNull('placed_at')
                ->where('placed_at', '>=', $now->copy()->subDays(6)->startOfDay())
                ->groupBy('sale_date')
                ->orderBy('sale_date')
                ->get()
                ->map(fn ($row) => [
                    'sale_date' => $row->sale_date,
                    'revenue' => (float) $row->revenue,
                    'orders_count' => (int) $row->orders_count,
                ])
                ->all(),
        ];
    }

    private function revenueForWindow(Carbon $from, Carbon $to): float
    {
        return (float) Order::query()
            ->whereBetween('placed_at', [$from, $to])
            ->sum('total');
    }

    private function orderCountForWindow(Carbon $from, Carbon $to): int
    {
        return Order::query()
            ->whereBetween('placed_at', [$from, $to])
            ->count();
    }
}
