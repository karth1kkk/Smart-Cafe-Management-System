<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        $orders = Order::query()
            ->with(['user', 'items.menuItem.category', 'stripeCheckout'])
            ->latest('placed_at')
            ->latest()
            ->get();

        return OrderResource::collection($orders);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): OrderResource
    {
        $this->authorize('update', $order);

        $order = $this->orderService->updateStatus($order, $request->validated('status'));

        return OrderResource::make($order);
    }
}
