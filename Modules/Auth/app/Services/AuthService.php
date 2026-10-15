<?php

namespace Modules\Auth\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * Business logic for logging in and out.
 * Works for both web (cookie) and Android (token) — no HTTP code here.
 */
class AuthService
{
    /**
     * Find a user by email OR phone and check the password.
     * Returns null when the login details are wrong.
     */
    public function findUserByCredentials(string $login, string $password): ?User
    {
        $user = User::query()
            ->where('email', $login)
            ->orWhere('phone', $login)
            ->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            return null;
        }

        return $user;
    }

    /**
     * Create a Sanctum token for the Android app (one token per device).
     */
    public function createToken(User $user, string $deviceName): string
    {
        return DB::transaction(function () use ($user, $deviceName) {
            return $user->createToken($deviceName)->plainTextToken;
        });
    }

    /**
     * Delete the token that made this request (Android logout).
     */
    public function deleteCurrentToken(User $user): void
    {
        $token = $user->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            DB::transaction(fn () => $token->delete());
        }
    }
}
