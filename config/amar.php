<?php

/*
|--------------------------------------------------------------------------
| Amar Team settings
|--------------------------------------------------------------------------
|
| Project-specific settings. Values come from .env — never put real
| passwords here.
|
*/

return [

    // The first super-admin account, created by the Auth module seeder.
    'super_admin' => [
        'name' => env('SUPER_ADMIN_NAME', 'Super Admin'),
        'email' => env('SUPER_ADMIN_EMAIL', 'admin@amarteam.test'),
        'phone' => env('SUPER_ADMIN_PHONE', '01700000000'),
        'password' => env('SUPER_ADMIN_PASSWORD'),
    ],

    // The React page that opens from the "reset password" email.
    'frontend_reset_password_url' => env('APP_URL').'/reset-password',

];
