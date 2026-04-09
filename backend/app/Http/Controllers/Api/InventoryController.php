<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateInventoryItemRequest;
use App\Http\Resources\InventoryItemResource;
use App\Models\InventoryItem;
use App\Services\InventoryService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InventoryController extends Controller
{
    public function __construct(
        private readonly InventoryService $inventoryService,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', InventoryItem::class);

        $inventory = InventoryItem::query()
            ->with('logs')
            ->orderBy('name')
            ->get();

        return InventoryItemResource::collection($inventory);
    }

    public function update(UpdateInventoryItemRequest $request, InventoryItem $inventoryItem): InventoryItemResource
    {
        $this->authorize('update', $inventoryItem);

        $inventoryItem = $this->inventoryService->applyManualUpdate($inventoryItem, $request->validated());

        return InventoryItemResource::make($inventoryItem->load('logs'));
    }
}
