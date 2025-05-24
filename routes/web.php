<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TransactionController;
use App\Http\Middleware\EnsureUserHasAccount;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified', EnsureUserHasAccount::class])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');


    Route::resource('transactions', TransactionController::class);
    Route::get('/transactions/summary/category', [TransactionController::class, 'summaryByCategory'])->name('transactions.summary.category');
    Route::get('/transactions/summary/account', [TransactionController::class, 'summaryByAccount'])->name('transactions.summary.account');

    Route::get('/config', function () {
        return Inertia::render('Config/Index');
    })->name('config.index');
    Route::resource('categories', CategoryController::class);
    Route::resource('accounts', AccountController::class);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
