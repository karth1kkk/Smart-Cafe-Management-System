<?php

namespace Database\Factories;

use App\Enums\StripeCheckoutStatus;
use App\Models\StripeCheckout;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StripeCheckout>
 */
class StripeCheckoutFactory extends Factory
{
    protected $model = StripeCheckout::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'stripe_session_id' => 'cs_test_'.fake()->unique()->numerify('########'),
            'items_json' => [],
            'notes' => null,
            'amount_cents' => 1000,
            'currency' => 'usd',
            'status' => StripeCheckoutStatus::Pending,
        ];
    }
}
