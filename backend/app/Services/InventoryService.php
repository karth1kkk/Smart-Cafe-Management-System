<?php

namespace App\Services;

use App\Enums\InventoryChangeType;
use App\Models\InventoryItem;
use App\Models\Order;

class InventoryService
{
    public function applyManualUpdate(InventoryItem $inventoryItem, array $payload): InventoryItem
    {
        $previousStock = (float) $inventoryItem->current_stock;

        $inventoryItem->fill($payload);
        $inventoryItem->save();

        if (array_key_exists('current_stock', $payload) && $previousStock !== (float) $inventoryItem->current_stock) {
            $inventoryItem->logs()->create([
                'change_type' => InventoryChangeType::ManualAdjustment,
                'quantity_delta' => (float) $inventoryItem->current_stock - $previousStock,
                'note' => $payload['note'] ?? 'Manual stock adjustment',
            ]);
        }

        return $inventoryItem->refresh();
    }

    public function deductForOrder(InventoryItem $inventoryItem, float $quantity, Order $order, string $note): void
    {
        $inventoryItem->decrement('current_stock', $quantity);

        $inventoryItem->logs()->create([
            'order_id' => $order->id,
            'change_type' => InventoryChangeType::OrderDeduction,
            'quantity_delta' => -1 * $quantity,
            'note' => $note,
        ]);
    }
}
