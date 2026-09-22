<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCheckoutRequest extends FormRequest
{
    /**
     * Anyone (including guests) can submit a checkout request.
     * Authorization is enforced at the route level if needed.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normalize input before validation.
     */
    protected function prepareForValidation(): void
    {
        $items = $this->input('items', []);

        if (is_array($items)) {
            foreach ($items as $index => $item) {
                if (isset($item['size']) && is_string($item['size'])) {
                    $items[$index]['size'] = strtoupper($item['size']);
                }
                if (isset($item['milk_type']) && is_string($item['milk_type'])) {
                    $items[$index]['milk_type'] = strtolower($item['milk_type']);
                }
            }
        }

        $this->merge([
            'items' => $items,
            'notes' => is_string($this->input('notes')) ? trim($this->input('notes')) : null,
        ]);
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