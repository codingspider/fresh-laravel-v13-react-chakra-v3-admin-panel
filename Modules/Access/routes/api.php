<?php

use Illuminate\Support\Facades\Route;
use Modules\Access\Http\Controllers\PermissionController;
use Modules\Access\Http\Controllers\RoleController;
use Modules\Access\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| Access module routes  (the module already adds the /api prefix)
|--------------------------------------------------------------------------
|
| Final URLs: /api/v1/access/users, /api/v1/access/roles, /api/v1/access/permissions
|
*/

Route::prefix('v1/access')->name('access.')->middleware('auth:sanctum')->group(function () {

    // Users
    Route::get('users', [UserController::class, 'index'])
        ->middleware('permission:access.users.view')->name('users.index');
    Route::post('users', [UserController::class, 'store'])
        ->middleware('permission:access.users.create')->name('users.store');
    Route::get('users/{user}', [UserController::class, 'show'])
        ->middleware('permission:access.users.view')->whereNumber('user')->name('users.show');
    Route::put('users/{user}', [UserController::class, 'update'])
        ->middleware('permission:access.users.update')->whereNumber('user')->name('users.update');
    Route::delete('users/{user}', [UserController::class, 'destroy'])
        ->middleware('permission:access.users.delete')->whereNumber('user')->name('users.destroy');

    // Roles — "options" is a short list for dropdowns (user form, filters)
    Route::get('roles/options', [RoleController::class, 'options'])
        ->middleware('permission:access.roles.view|access.users.view|access.users.create|access.users.update')
        ->name('roles.options');
    Route::get('roles', [RoleController::class, 'index'])
        ->middleware('permission:access.roles.view')->name('roles.index');
    Route::post('roles', [RoleController::class, 'store'])
        ->middleware('permission:access.roles.create')->name('roles.store');
    Route::get('roles/{role}', [RoleController::class, 'show'])
        ->middleware('permission:access.roles.view')->whereNumber('role')->name('roles.show');
    Route::put('roles/{role}', [RoleController::class, 'update'])
        ->middleware('permission:access.roles.update')->whereNumber('role')->name('roles.update');
    Route::delete('roles/{role}', [RoleController::class, 'destroy'])
        ->middleware('permission:access.roles.delete')->whereNumber('role')->name('roles.destroy');

    // All permissions, grouped (for the role form)
    Route::get('permissions', [PermissionController::class, 'index'])
        ->middleware('permission:access.roles.view|access.roles.create|access.roles.update')
        ->name('permissions.index');
});
