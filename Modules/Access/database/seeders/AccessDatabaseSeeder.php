<?php

namespace Modules\Access\Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Creates the Access module permissions and an "admin" role that has them.
 *
 * Permission names: <module>.<resource>.<action>
 * The role form groups them by <module>.<resource> (e.g. "Users", "Roles").
 *
 * Run: php artisan module:seed Access   (or php artisan db:seed). Safe to run many times.
 */
class AccessDatabaseSeeder extends Seeder
{
    /**
     * @var list<string>
     */
    public const PERMISSIONS = [
        'access.users.view',
        'access.users.create',
        'access.users.update',
        'access.users.delete',
        'access.roles.view',
        'access.roles.create',
        'access.roles.update',
        'access.roles.delete',
    ];

    public function run(): void
    {
        foreach (self::PERMISSIONS as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        // "admin" can manage users and roles. (super-admin already has everything.)
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->givePermissionTo(self::PERMISSIONS);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
