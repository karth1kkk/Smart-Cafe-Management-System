<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnalyticsSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'revenue' => $this['revenue'],
            'orders_count' => $this['orders_count'],
            'top_selling_items' => $this['top_selling_items'],
            'staff_leaderboard' => $this['staff_leaderboard'],
            'recent_sales' => $this['recent_sales'],
        ];
    }
}
