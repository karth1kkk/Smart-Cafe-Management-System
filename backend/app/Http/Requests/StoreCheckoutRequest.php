<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_item_id' => ['required', 'integer', 'exists:menu_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.size' => ['required', Rule::in(['S', 'M', 'L'])],
            'items.*.milk_type' => ['nullable', Rule::in(['full cream', 'oat', 'almond'])],
            'items.*.addons' => ['nullable', 'array'],
            'items.*.addons.*' => ['string', Rule::in(['extra shot', 'syrup'])],
        ];
    }
}
