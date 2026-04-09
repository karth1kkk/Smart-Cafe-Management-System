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
            ['slug' => 'coffee'],
            ['name' => 'Coffee']
        );
        $matcha = Category::query()->updateOrCreate(
            ['slug' => 'matcha'],
            ['name' => 'Matcha']
        );
        $pastry = Category::query()->updateOrCreate(
            ['slug' => 'pastry'],
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

        $this->seedMenuItem($coffee->id, 'Flat White', 5.50, [
            ['inventory_item_id' => $inventory['Coffee Beans']->id, 'quantity' => 0.03],
            ['inventory_item_id' => $inventory['Milk']->id, 'quantity' => 0.25],
        ]);
        $this->seedMenuItem($coffee->id, 'Cappuccino', 5.25, [
            ['inventory_item_id' => $inventory['Coffee Beans']->id, 'quantity' => 0.03],
            ['inventory_item_id' => $inventory['Milk']->id, 'quantity' => 0.20],
        ]);
        $this->seedMenuItem($matcha->id, 'Iced Matcha Latte', 6.75, [
            ['inventory_item_id' => $inventory['Matcha Powder']->id, 'quantity' => 0.02],
            ['inventory_item_id' => $inventory['Milk']->id, 'quantity' => 0.25],
        ]);
        $this->seedMenuItem($pastry->id, 'Butter Croissant', 4.25, []);

        User::factory(3)->create();
    }

    private function seedMenuItem(int $categoryId, string $name, float $price, array $recipe): void
    {
        MenuItem::query()->updateOrCreate(
            ['slug' => Str::slug($name)],
            [
                'category_id' => $categoryId,
                'name' => $name,
                'description' => "{$name} prepared fresh for the cafe POS demo.",
                'price' => $price,
                'is_available' => true,
                'recipe_json' => $recipe,
            ]
        );
    }
}
