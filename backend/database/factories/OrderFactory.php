<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'status' => fake()->randomElement([
                OrderStatus::Pending,
                OrderStatus::Preparing,
                OrderStatus::Completed,
            ]),
            'subtotal' => fake()->randomFloat(2, 8, 40),
            'tax' => 0,
            'total' => fake()->randomFloat(2, 8, 40),
            'notes' => fake()->boolean(30) ? fake()->sentence() : null,
            'placed_at' => now()->subMinutes(fake()->numberBetween(5, 500)),
            'completed_at' => null,
        ];
    }
}
