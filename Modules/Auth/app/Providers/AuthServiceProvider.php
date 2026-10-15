<?php

namespace Modules\Auth\Providers;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

/**
 * Main provider of the Auth module (listed in Modules/Auth/module.json).
 */
class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register the module's other providers.
     */
    public function register(): void
    {
        $this->app->register(RouteServiceProvider::class);
    }

    /**
     * Load migrations and set up the reset-password email link.
     */
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../../database/migrations');

        // The "reset password" email opens our React page, not a Laravel page:
        // http://amar-team.test/reset-password?token=...&email=...
        ResetPassword::createUrlUsing(function (User $user, string $token): string {
            return config('amar.frontend_reset_password_url')
                .'?token='.$token
                .'&email='.urlencode($user->email);
        });
    }
}
