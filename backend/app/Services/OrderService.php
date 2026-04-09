<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\StripeCheckoutStatus;
use App\Events\OrderCreated;
use App\Events\OrderStatusUpdated;
use App\Models\InventoryItem;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\StripeCheckout;
use App\Models\User;
use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Stripe\Checkout\Session;

class OrderService
{
    private const SIZE_PRICE_ADJUSTMENTS = [
        'S' => 0.00,
        'M' => 0.50,
        'L' => 1.00,
    ];

    private const ADDON_PRICES = [
        'extra shot' => 1.50,
        'syrup' => 0.75,
    ];

    public function __construct(
        private readonly InventoryService $inventoryService,
    ) {}

    /**
     * Validates cart lines and returns server-side totals (same rules as checkout).
     *
     * @return array{prepared_items: array<int, array<string, mixed>>, subtotal: float, notes: ?string}
     */
    public function buildOrderDraft(array $payload): array
    {
        $menuItems = MenuItem::query()
            ->with('category')
            ->whereIn('id', collect($payload['items'])->pluck('menu_item_id'))
            ->get()
            ->keyBy('id');

        $preparedItems = [];
        $subtotal = 0.0;

        foreach ($payload['items'] as $itemPayload) {
            /** @var MenuItem|null $menuItem */
            $menuItem = $menuItems->get($itemPayload['menu_item_id']);

            if (! $menuItem || ! $menuItem->is_available) {
                throw ValidationException::withMessages([
                    'items' => ["Menu item [{$itemPayload['menu_item_id']}] is unavailable."],
                ]);
            }

            $quantity = (int) $itemPayload['quantity'];
            $size = $itemPayload['size'];
            $addons = $itemPayload['addons'] ?? [];
            $unitPrice = $this->resolveUnitPrice((float) $menuItem->price, $size, $addons);
            $lineTotal = $unitPrice * $quantity;

            $preparedItems[] = [
                'menu_item' => $menuItem,
                'quantity' => $quantity,
                'size' => $size,
                'milk_type' => $itemPayload['milk_type'] ?? null,
                'addons_json' => array_values($addons),
                'unit_price' => $unitPrice,
                'line_total' => $lineTotal,
            ];

            $subtotal += $lineTotal;
        }

        return [
            'prepared_items' => $preparedItems,
            'subtotal' => round($subtotal, 2),
            'notes' => $payload['notes'] ?? null,
        ];
    }

    public function createFromStripeCheckout(User $user, StripeCheckout $checkout, Session $session): Order
    {
        if ($checkout->user_id !== $user->id) {
            throw ValidationException::withMessages([
                'session_id' => ['This checkout does not belong to the current user.'],
            ]);
        }

        if ($session->payment_status !== 'paid') {
            throw ValidationException::withMessages([
                'session_id' => ['Stripe reports this payment as unpaid.'],
            ]);
        }

        if ($session->id !== $checkout->stripe_session_id) {
            throw ValidationException::withMessages([
                'session_id' => ['This session does not match the checkout record.'],
            ]);
        }

        if ((int) $session->amount_total !== $checkout->amount_cents) {
            throw ValidationException::withMessages([
                'session_id' => ['Amount mismatch between Stripe and your order.'],
            ]);
        }

        return DB::transaction(function () use ($user, $checkout) {
            $checkout = StripeCheckout::query()->whereKey($checkout->id)->lockForUpdate()->firstOrFail();

            if ($checkout->order()->exists()) {
                return $checkout->order;
            }

            $payload = [
                'items' => $checkout->items_json,
                'notes' => $checkout->notes,
            ];

            $draft = $this->buildOrderDraft($payload);

            if ((int) round($draft['subtotal'] * 100) !== $checkout->amount_cents) {
                throw ValidationException::withMessages([
                    'session_id' => ['Pricing changed since checkout. Try again.'],
                ]);
            }

            $preparedItems = collect($draft['prepared_items']);

            $order = Order::create([
                'user_id' => $user->id,
                'stripe_checkout_id' => $checkout->id,
                'status' => OrderStatus::Pending,
                'subtotal' => $draft['subtotal'],
                'tax' => 0,
                'total' => $draft['subtotal'],
                'notes' => $draft['notes'],
                'placed_at' => now(),
            ]);

            foreach ($preparedItems as $preparedItem) {
                $order->items()->create([
                    'menu_item_id' => $preparedItem['menu_item']->id,
                    'item_name_snapshot' => $preparedItem['menu_item']->name,
                    'quantity' => $preparedItem['quantity'],
                    'unit_price' => $preparedItem['unit_price'],
                    'line_total' => $preparedItem['line_total'],
                    'size' => $preparedItem['size'],
                    'milk_type' => $preparedItem['milk_type'],
                    'addons_json' => $preparedItem['addons_json'],
                ]);
            }

            $this->deductInventory($order, $preparedItems);

            $checkout->update(['status' => StripeCheckoutStatus::Paid]);

            $freshOrder = $this->loadOrderRelations($order);

            DB::afterCommit(fn () => $this->broadcastSafely(new OrderCreated($freshOrder)));

            return $freshOrder;
        });
    }

    public function updateStatus(Order $order, string $status): Order
    {
        $order->update([
            'status' => $status,
            'completed_at' => $status === OrderStatus::Completed->value ? now() : null,
        ]);

        $order = $this->loadOrderRelations($order);

        DB::afterCommit(fn () => $this->broadcastSafely(new OrderStatusUpdated($order)));

        return $order;
    }

    private function deductInventory(Order $order, Collection $preparedItems): void
    {
        $requiredQuantities = [];

        foreach ($preparedItems as $preparedItem) {
            $recipeItems = $preparedItem['menu_item']->recipe_json ?? [];

            foreach ($recipeItems as $recipeItem) {
                $inventoryItemId = (int) ($recipeItem['inventory_item_id'] ?? 0);
                $perUnitQuantity = (float) ($recipeItem['quantity'] ?? 0);

                if (! $inventoryItemId || $perUnitQuantity <= 0) {
                    continue;
                }

                $requiredQuantities[$inventoryItemId] = ($requiredQuantities[$inventoryItemId] ?? 0)
                    + ($perUnitQuantity * $preparedItem['quantity']);
            }
        }

        if ($requiredQuantities === []) {
            return;
        }

        $inventoryItems = InventoryItem::query()
            ->whereIn('id', array_keys($requiredQuantities))
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        foreach ($requiredQuantities as $inventoryItemId => $requiredQuantity) {
            /** @var InventoryItem|null $inventoryItem */
            $inventoryItem = $inventoryItems->get($inventoryItemId);

            if (! $inventoryItem) {
                throw ValidationException::withMessages([
                    'items' => ['Order recipe references missing inventory items.'],
                ]);
            }

            if ((float) $inventoryItem->current_stock < $requiredQuantity) {
                throw ValidationException::withMessages([
                    'items' => ["Insufficient stock for {$inventoryItem->name}."],
                ]);
            }
        }

        foreach ($requiredQuantities as $inventoryItemId => $requiredQuantity) {
            /** @var InventoryItem $inventoryItem */
            $inventoryItem = $inventoryItems->get($inventoryItemId);

            $this->inventoryService->deductForOrder(
                $inventoryItem,
                $requiredQuantity,
                $order,
                "Auto deduction for order #{$order->id}"
            );
        }
    }

    private function resolveUnitPrice(float $basePrice, string $size, array $addons): float
    {
        $sizeAdjustment = self::SIZE_PRICE_ADJUSTMENTS[$size] ?? 0;
        $addonsPrice = collect($addons)
            ->sum(fn (string $addon) => self::ADDON_PRICES[$addon] ?? 0);

        return round($basePrice + $sizeAdjustment + $addonsPrice, 2);
    }

    private function loadOrderRelations(Order $order): Order
    {
        return $order->fresh(['user', 'items.menuItem.category', 'stripeCheckout']);
    }

    private function broadcastSafely(ShouldBroadcast $event): void
    {
        try {
            broadcast($event);
        } catch (BroadcastException $e) {
            report($e);
        }
    }
}
