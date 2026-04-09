<?php

namespace App\Services;

use App\Models\MenuItem;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MenuService
{
    private function imageDisk(): string
    {
        return config('filesystems.menu_images_disk', 'public');
    }

    public function store(array $payload): MenuItem
    {
        return MenuItem::create($this->preparePayload(new MenuItem, $payload));
    }

    public function update(MenuItem $menuItem, array $payload): MenuItem
    {
        $menuItem->fill($this->preparePayload($menuItem, $payload));
        $menuItem->save();

        return $menuItem->refresh();
    }

    public function delete(MenuItem $menuItem): void
    {
        if ($menuItem->image_path && ! MenuItem::isRemoteImagePath($menuItem->image_path)) {
            Storage::disk($this->imageDisk())->delete($menuItem->image_path);
        }

        $menuItem->delete();
    }

    private function preparePayload(MenuItem $menuItem, array $payload): array
    {
        if (isset($payload['image']) && $payload['image'] instanceof UploadedFile) {
            if ($menuItem->image_path && ! MenuItem::isRemoteImagePath($menuItem->image_path)) {
                Storage::disk($this->imageDisk())->delete($menuItem->image_path);
            }

            $payload['image_path'] = $payload['image']->storePublicly('menu-items', $this->imageDisk());
        }

        unset($payload['image']);

        $name = $payload['name'] ?? $menuItem->name;

        if ($name) {
            $payload['slug'] = $this->resolveUniqueSlug($name, $menuItem->id);
        }

        return $payload;
    }

    private function resolveUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 2;

        while (
            MenuItem::query()
                ->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
