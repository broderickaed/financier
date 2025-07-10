<?php

use App\Http\Controllers\GroupController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Group Routes (simplified with resource)
    Route::resource('groups', GroupController::class)->except(['show', 'destroy']);
    Route::post('groups/{group}/sync-members', [GroupController::class, 'syncMembers'])->name('groups.syncMembers');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
