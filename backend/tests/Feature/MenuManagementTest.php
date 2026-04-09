<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\InventoryItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_menu_item(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $category = Category::factory()->create(['name' => 'Coffee', 'slug' => 'coffee']);
        $inventoryItem = InventoryItem::factory()->create();

        $this->actingAs($admin)->postJson('/api/menu', [
            'category_id' => $category->id,
            'name' => 'House Latte',
            'description' => 'Signature latte',
            'price' => 6.25,
            'is_available' => true,
            'recipe_json' => [
                [
                    'inventory_item_id' => $inventoryItem->id,
                    'quantity' => 0.2,
                ],
            ],
        ])->assertCreated()
            ->assertJsonPath('data.name', 'House Latte')
            ->assertJsonPath('data.category.slug', 'coffee');
    }
}
