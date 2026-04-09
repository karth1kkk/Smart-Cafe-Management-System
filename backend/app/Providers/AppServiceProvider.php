<?php

namespace App\Providers;

use App\Models\InventoryItem;
use App\Models\MenuItem;
use App\Models\Order;
use App\Policies\InventoryItemPolicy;
use App\Policies\MenuItemPolicy;
use App\Policies\OrderPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(MenuItem::class, MenuItemPolicy::class);
        Gate::policy(InventoryItem::class, InventoryItemPolicy::class);
        Gate::policy(Order::class, OrderPolicy::class);
    }
}
