<?php

namespace Database\Factories;

use App\Models\InventoryItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryItem>
 */
class InventoryItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement([
                'Coffee Beans',
                'Milk',
                'Matcha Powder',
                'Oat Milk',
                'Almond Milk',
            ]),
            'unit' => fake()->randomElement(['kg', 'L']),
            'current_stock' => fake()->randomFloat(2, 10, 60),
            'low_stock_threshold' => fake()->randomFloat(2, 3, 10),
        ];
    }
}
