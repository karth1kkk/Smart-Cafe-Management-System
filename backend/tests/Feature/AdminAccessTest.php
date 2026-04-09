<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\InventoryItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_barista_cannot_access_admin_analytics_and_inventory_routes(): void
    {
        $barista = User::factory()->create(['role' => UserRole::Barista]);
        $inventoryItem = InventoryItem::factory()->create();

        $this->actingAs($barista)->getJson('/api/analytics/summary')
            ->assertForbidden();

        $this->actingAs($barista)->patchJson("/api/inventory/{$inventoryItem->id}", [
            'current_stock' => 12,
        ])->assertForbidden();
    }

    public function test_admin_can_access_analytics_and_update_inventory(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $inventoryItem = InventoryItem::factory()->create([
            'current_stock' => 15,
        ]);

        $this->actingAs($admin)->getJson('/api/analytics/summary')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'revenue',
                    'orders_count',
                    'top_selling_items',
                    'staff_leaderboard',
                    'recent_sales',
                ],
            ]);

        $this->actingAs($admin)->patchJson("/api/inventory/{$inventoryItem->id}", [
            'current_stock' => 11,
            'note' => 'Waste adjustment',
        ])->assertOk()
            ->assertJsonPath('data.current_stock', 11);
    }
}
