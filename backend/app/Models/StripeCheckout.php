<?php

namespace App\Models;

use App\Enums\StripeCheckoutStatus;
use Database\Factories\StripeCheckoutFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class StripeCheckout extends Model
{
    /** @use HasFactory<StripeCheckoutFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'stripe_session_id',
        'items_json',
        'notes',
        'amount_cents',
        'currency',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => StripeCheckoutStatus::class,
            'items_json' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): HasOne
    {
        return $this->hasOne(Order::class, 'stripe_checkout_id');
    }
}
