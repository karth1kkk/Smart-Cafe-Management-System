<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\InventoryItem;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@smartcafe.test'],
            [
                'name' => 'Cafe Admin',
                'password' => Hash::make('password'),
                'pin' => '123456',
                'role' => UserRole::Admin,
                'email_verified_at' => now(),
            ]
        );

        $barista = User::query()->updateOrCreate(
            ['email' => 'barista@smartcafe.test'],
            [
                'name' => 'Lead Barista',
                'password' => Hash::make('password'),
                'pin' => '654321',
                'role' => UserRole::Barista,
                'email_verified_at' => now(),
            ]
        );

        $coffee = Category::query()->updateOrCreate(
            ['slug' => 'Coffee'],
            ['name' => 'Coffee']
        );
        $matcha = Category::query()->updateOrCreate(
            ['slug' => 'Matcha'],
            ['name' => 'Matcha']
        );
        $pastry = Category::query()->updateOrCreate(
            ['slug' => 'Pastry'],
            ['name' => 'Pastry']
        );

        $inventory = collect([
            ['name' => 'Coffee Beans', 'unit' => 'kg', 'current_stock' => 18, 'low_stock_threshold' => 4],
            ['name' => 'Milk', 'unit' => 'L', 'current_stock' => 45, 'low_stock_threshold' => 10],
            ['name' => 'Matcha Powder', 'unit' => 'kg', 'current_stock' => 8, 'low_stock_threshold' => 2],
            ['name' => 'Oat Milk', 'unit' => 'L', 'current_stock' => 20, 'low_stock_threshold' => 5],
            ['name' => 'Almond Milk', 'unit' => 'L', 'current_stock' => 16, 'low_stock_threshold' => 4],
        ])->mapWithKeys(function (array $item) {
            $record = InventoryItem::query()->updateOrCreate(
                ['name' => $item['name']],
                $item
            );

            return [$item['name'] => $record];
        });

        // Remote image URLs (Unsplash) — no upload needed for demo; see MenuItem::isRemoteImagePath
        $this->seedMenuItem($coffee->id, 'Flat White', 5.50, [
            ['inventory_item_id' => $inventory['Coffee Beans']->id, 'quantity' => 0.03],
            ['inventory_item_id' => $inventory['Milk']->id, 'quantity' => 0.25],
        ], 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80');
        $this->seedMenuItem($coffee->id, 'Cappuccino', 5.25, [
            ['inventory_item_id' => $inventory['Coffee Beans']->id, 'quantity' => 0.03],
            ['inventory_item_id' => $inventory['Milk']->id, 'quantity' => 0.20],
        ], 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80');
        $this->seedMenuItem($matcha->id, 'Iced Matcha Latte', 6.75, [
            ['inventory_item_id' => $inventory['Matcha Powder']->id, 'quantity' => 0.02],
            ['inventory_item_id' => $inventory['Milk']->id, 'quantity' => 0.25],
        ], 'https://images.unsplash.com/photo-1749280447307-31a68eb38673?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aWNlZCUyMG1hdGNoYSUyMGxhdHRlfGVufDB8fDB8fHww');
        $this->seedMenuItem($pastry->id, 'Butter Croissant', 4.25, [], 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80');

        // Avoid User::factory() here: Heroku uses composer --no-dev (no fakerphp/faker).
    }

    private function seedMenuItem(int $categoryId, string $name, float $price, array $recipe, ?string $imageUrl = null): void
    {
        $attributes = [
            'category_id' => $categoryId,
            'name' => $name,
            'description' => "{$name} prepared fresh for the cafe POS demo.",
            'price' => $price,
            'is_available' => true,
            'recipe_json' => $recipe,
        ];

        if ($imageUrl !== null) {
            $attributes['image_path'] = $imageUrl;
        }

        MenuItem::query()->updateOrCreate(
            ['slug' => Str::slug($name)],
            $attributes
        );
    }
}
