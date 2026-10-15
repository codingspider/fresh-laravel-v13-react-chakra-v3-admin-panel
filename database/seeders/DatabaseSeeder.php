<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Auth\Database\Seeders\AuthDatabaseSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Each module has its own seeder. Add new module seeders here in build order,
     * or run them one by one with: php artisan module:seed <Module>
     */
    public function run(): void
    {
        $this->call([
            AuthDatabaseSeeder::class, // super-admin role + first user
        ]);
    }
}
