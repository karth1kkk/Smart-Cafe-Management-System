<?php

namespace Database\Factories;

use App\Enums\InventoryChangeType;
use App\Models\InventoryItem;
use App\Models\InventoryLog;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryLog>
 */
class InventoryLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'inventory_item_id' => InventoryItem::factory(),
            'order_id' => Order::factory(),
            'change_type' => InventoryChangeType::OrderDeduction,
            'quantity_delta' => fake()->randomFloat(2, -5, 5),
            'note' => fake()->sentence(),
        ];
    }
}
