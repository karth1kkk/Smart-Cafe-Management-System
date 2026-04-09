<?php

namespace App\Policies;

use App\Models\InventoryItem;
use App\Models\User;

class InventoryItemPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, InventoryItem $inventoryItem): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, InventoryItem $inventoryItem): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, InventoryItem $inventoryItem): bool
    {
        return $user->isAdmin();
    }
}
