<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'unit' => $this->unit,
            'current_stock' => (float) $this->current_stock,
            'low_stock_threshold' => (float) $this->low_stock_threshold,
            'is_low_stock' => (bool) $this->is_low_stock,
            'latest_log' => $this->whenLoaded('logs', function () {
                $log = $this->logs->sortByDesc('created_at')->first();

                return $log ? [
                    'change_type' => $log->change_type?->value ?? $log->change_type,
                    'quantity_delta' => (float) $log->quantity_delta,
                    'note' => $log->note,
                    'created_at' => $log->created_at?->toISOString(),
                ] : null;
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
