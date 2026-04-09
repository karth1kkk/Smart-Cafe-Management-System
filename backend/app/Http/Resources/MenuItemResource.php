<?php

namespace App\Http\Resources;

use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class MenuItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => (float) $this->price,
            'image_url' => $this->resolveImageUrl(),
            'image_path' => $this->image_path,
            'is_available' => (bool) $this->is_available,
            'recipe_json' => $this->recipe_json ?? [],
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    private function resolveImageUrl(): ?string
    {
        if (! $this->image_path) {
            return null;
        }

        if (MenuItem::isRemoteImagePath($this->image_path)) {
            return $this->image_path;
        }

        return Storage::disk(config('filesystems.menu_images_disk', 'public'))->url($this->image_path);
    }
}
