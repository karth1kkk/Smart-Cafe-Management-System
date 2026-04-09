<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Requests\UpdateMenuItemRequest;
use App\Http\Resources\MenuItemResource;
use App\Models\MenuItem;
use App\Services\MenuService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MenuController extends Controller
{
    public function __construct(
        private readonly MenuService $menuService,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        $menu = MenuItem::query()
            ->with('category')
            ->orderBy('name')
            ->get();

        return MenuItemResource::collection($menu);
    }

    public function store(StoreMenuItemRequest $request): MenuItemResource
    {
        $this->authorize('create', MenuItem::class);

        $menuItem = $this->menuService->store($request->validated());

        return MenuItemResource::make($menuItem->load('category'));
    }

    public function update(UpdateMenuItemRequest $request, MenuItem $menuItem): MenuItemResource
    {
        $this->authorize('update', $menuItem);

        $menuItem = $this->menuService->update($menuItem, $request->validated());

        return MenuItemResource::make($menuItem->load('category'));
    }

    public function destroy(MenuItem $menuItem): JsonResponse
    {
        $this->authorize('delete', $menuItem);

        $this->menuService->delete($menuItem);

        return response()->json([
            'message' => 'Menu item deleted successfully.',
        ]);
    }
}
