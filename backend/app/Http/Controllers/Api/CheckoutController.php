<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CompleteCheckoutRequest;
use App\Http\Requests\StoreCheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\StripeCheckoutService;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly StripeCheckoutService $stripeCheckoutService,
    ) {}

    public function store(StoreCheckoutRequest $request): \Illuminate\Http\JsonResponse
    {
        $this->authorize('create', Order::class);

        $result = $this->stripeCheckoutService->createCheckoutSession(
            $request->user(),
            $request->validated('items'),
            $request->validated('notes'),
        );

        return response()->json([
            'data' => [
                'url' => $result['url'],
                'checkout_id' => $result['checkout_id'],
            ],
        ], 201);
    }

    public function complete(CompleteCheckoutRequest $request): OrderResource
    {
        $this->authorize('create', Order::class);

        $order = $this->stripeCheckoutService->completeCheckout(
            $request->user(),
            $request->validated('session_id'),
        );

        return OrderResource::make($order);
    }
}
