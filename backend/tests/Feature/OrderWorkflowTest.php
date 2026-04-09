<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_barista_can_update_order_status(): void
    {
        $barista = User::factory()->create(['role' => UserRole::Barista]);
        $order = Order::factory()->create([
            'user_id' => $barista->id,
            'status' => 'pending',
        ]);

        $this->actingAs($barista)->patchJson("/api/orders/{$order->id}/status", [
            'status' => 'completed',
        ])->assertOk()
            ->assertJsonPath('data.status', 'completed');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'completed',
        ]);
    }
}
