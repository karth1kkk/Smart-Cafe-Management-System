<?php

namespace App\Enums;

enum StripeCheckoutStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Expired = 'expired';
}
