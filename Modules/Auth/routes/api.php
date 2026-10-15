<?php

use Illuminate\Support\Facades\Route;
use Modules\Auth\Http\Controllers\AuthController;
use Modules\Auth\Http\Controllers\PasswordResetController;
use Modules\Auth\Http\Controllers\ProfileController;

/*
|--------------------------------------------------------------------------
| Auth module routes  (the module already adds the /api prefix)
|--------------------------------------------------------------------------
|
| Final URLs: /api/v1/auth/login, /api/v1/auth/me, ...
|
*/

Route::prefix('v1/auth')->name('auth.')->group(function () {

    // Public — no login needed. Limited to 5 tries per minute.
    Route::middleware('throttle:5,1')->group(function () {
        Route::post('login', [AuthController::class, 'login'])->name('login');
        Route::post('forgot-password', [PasswordResetController::class, 'sendResetLink'])->name('password.forgot');
        Route::post('reset-password', [PasswordResetController::class, 'reset'])->name('password.update');
    });

    // Logged-in users only (cookie or Bearer token)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout'])->name('logout');
        Route::get('me', [AuthController::class, 'me'])->name('me');
        Route::put('profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::put('change-password', [ProfileController::class, 'changePassword'])->name('password.change');
    });
});
