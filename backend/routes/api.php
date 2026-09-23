<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\OrderController;
use Illuminate\Support\Facades\Route;

Route::get('/staff', [AuthController::class, 'staffProfiles']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/menu', [MenuController::class, 'index']);

// Public checkout routes
Route::post('/checkout', [CheckoutController::class, 'store']);
Route::post('/checkout/complete', [CheckoutController::class, 'complete']);

Route::middleware('auth:sanctum')->group(function () {
    // Authenticated session
    Route::get('/session', [AuthController::class, 'session']);

    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);

    // Menu management
    Route::post('/menu', [MenuController::class, 'store'])
        ->middleware('role:admin');

    Route::put('/menu/{menuItem}', [MenuController::class, 'update'])
        ->middleware('role:admin');

    Route::delete('/menu/{menuItem}', [MenuController::class, 'destroy'])
        ->middleware('role:admin');

    // Inventory
    Route::get('/inventory', [InventoryController::class, 'index'])
        ->middleware('role:admin');

    Route::patch('/inventory/{inventoryItem}', [InventoryController::class, 'update'])
        ->middleware('role:admin');

    // Analytics
    Route::get('/analytics/summary', [AnalyticsController::class, 'summary'])
        ->middleware('role:admin');
});
