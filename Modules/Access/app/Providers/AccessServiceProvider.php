<?php

namespace Modules\Access\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * Main provider of the Access module (listed in Modules/Access/module.json).
 */
class AccessServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->register(RouteServiceProvider::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../../database/migrations');
    }
}
