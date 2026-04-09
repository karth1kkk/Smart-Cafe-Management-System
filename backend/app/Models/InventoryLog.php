<?php

namespace App\Models;

use App\Enums\InventoryChangeType;
use Database\Factories\InventoryLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryLog extends Model
{
    /** @use HasFactory<InventoryLogFactory> */
    use HasFactory;

    protected $fillable = [
        'inventory_item_id',
        'order_id',
        'change_type',
        'quantity_delta',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'change_type' => InventoryChangeType::class,
            'quantity_delta' => 'decimal:2',
        ];
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
