<?php

namespace App\Enums;

enum InventoryChangeType: string
{
    case OrderDeduction = 'order_deduction';
    case ManualAdjustment = 'manual_adjustment';
}
