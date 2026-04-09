<?php

namespace App\Services;

use App\Enums\StripeCheckoutStatus;
use App\Models\Order;
use App\Models\StripeCheckout;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Stripe\Checkout\Session;
use Stripe\Stripe;

class StripeCheckoutService
{
    public function __construct(
        private readonly OrderService $orderService,
    ) {}

    /**
     * @return array{url: string, checkout_id: int}
     */
    public function createCheckoutSession(User $user, array $itemsPayload, ?string $notes): array
    {
        $secret = config('stripe.secret');
        if (! is_string($secret) || $secret === '') {
            throw ValidationException::withMessages([
                'stripe' => ['Stripe is not configured. Set STRIPE_SECRET in .env'],
            ]);
        }

        $draft = $this->orderService->buildOrderDraft([
            'items' => $itemsPayload,
            'notes' => $notes,
        ]);

        $amountCents = (int) round($draft['subtotal'] * 100);

        if ($amountCents < 50) {
            throw ValidationException::withMessages([
                'items' => ['Order total must be at least $0.50 USD for Stripe Checkout.'],
            ]);
        }

        $checkout = StripeCheckout::create([
            'user_id' => $user->id,
            'stripe_session_id' => null,
            'items_json' => $itemsPayload,
            'notes' => $notes,
            'amount_cents' => $amountCents,
            'currency' => config('stripe.currency', 'usd'),
            'status' => StripeCheckoutStatus::Pending,
        ]);

        Stripe::setApiKey($secret);

        $currency = config('stripe.currency', 'usd');

        $session = Session::create([
            'mode' => 'payment',
            'client_reference_id' => (string) $checkout->id,
            'line_items' => [
                [
                    'price_data' => [
                        'currency' => $currency,
                        'product_data' => [
                            'name' => 'Cafe order #'.$checkout->id,
                        ],
                        'unit_amount' => $amountCents,
                    ],
                    'quantity' => 1,
                ],
            ],
            'success_url' => config('stripe.success_url'),
            'cancel_url' => config('stripe.cancel_url'),
            'metadata' => [
                'checkout_id' => (string) $checkout->id,
                'user_id' => (string) $user->id,
            ],
        ]);

        $checkout->update([
            'stripe_session_id' => $session->id,
        ]);

        if (! $session->url) {
            throw ValidationException::withMessages([
                'stripe' => ['Stripe did not return a checkout URL.'],
            ]);
        }

        return [
            'url' => $session->url,
            'checkout_id' => $checkout->id,
        ];
    }

    public function completeCheckout(User $user, string $stripeSessionId): Order
    {
        $secret = config('stripe.secret');
        if (! is_string($secret) || $secret === '') {
            throw ValidationException::withMessages([
                'session_id' => ['Stripe is not configured. Set STRIPE_SECRET in .env'],
            ]);
        }

        Stripe::setApiKey($secret);

        $session = Session::retrieve($stripeSessionId);

        if ($session->payment_status !== 'paid') {
            throw ValidationException::withMessages([
                'session_id' => ['Payment is not complete yet.'],
            ]);
        }

        $checkout = StripeCheckout::query()
            ->where('stripe_session_id', $session->id)
            ->firstOrFail();

        if ($checkout->user_id !== $user->id) {
            throw ValidationException::withMessages([
                'session_id' => ['This checkout does not belong to the current user.'],
            ]);
        }

        if ((int) $session->amount_total !== $checkout->amount_cents) {
            throw ValidationException::withMessages([
                'session_id' => ['Amount mismatch. Contact support.'],
            ]);
        }

        return $this->orderService->createFromStripeCheckout($user, $checkout, $session);
    }
}
