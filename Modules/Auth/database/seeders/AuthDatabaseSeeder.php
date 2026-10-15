<?php

namespace Modules\Auth\Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Creates the super-admin role and the first super-admin user.
 *
 * The user's details come from .env (SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL,
 * SUPER_ADMIN_PHONE, SUPER_ADMIN_PASSWORD). Safe to run many times.
 *
 * Run: php artisan module:seed Auth   (or php artisan db:seed)
 */
class AuthDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Clear the permission cache so the new role is seen straight away
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $role = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);

        $settings = config('amar.super_admin');

        // Never create an account with a default password
        if (empty($settings['password'])) {
            $this->command?->warn('SUPER_ADMIN_PASSWORD is not set in .env — the super-admin user was not created.');

            return;
        }

        $user = User::firstOrCreate(
            ['email' => $settings['email']],
            [
                'name' => $settings['name'],
                'phone' => $settings['phone'],
                'password' => $settings['password'], // hashed automatically by the User model
                'is_active' => true,
            ]
        );

        $user->assignRole($role);

        $this->command?->info("Super-admin ready: {$user->email}");
    }
}
