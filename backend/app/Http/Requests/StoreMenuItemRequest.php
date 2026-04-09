<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'is_available' => ['sometimes', 'boolean'],
            'image' => ['nullable', 'image', 'max:5120'],
            'recipe_json' => ['nullable', 'array'],
            'recipe_json.*.inventory_item_id' => ['required_with:recipe_json', 'integer', 'exists:inventory_items,id'],
            'recipe_json.*.quantity' => ['required_with:recipe_json', 'numeric', 'min:0.01'],
        ];
    }
}
