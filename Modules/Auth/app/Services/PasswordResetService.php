<?php

namespace Modules\Auth\Services;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Forgot password / reset password.
 */
class PasswordResetService
{
    /**
     * Email a reset link to the user.
     *
     * We do not tell the caller whether the email exists, so nobody can use
     * this endpoint to find out which emails have accounts.
     */
    public function sendResetLink(string $email): void
    {
        Password::sendResetLink(['email' => $email]);
    }

    /**
     * Save the new password if the token is valid.
     *
     * @param  array{token: string, email: string, password: string, password_confirmation?: string}  $data
     *
     * @throws ValidationException when the token or email is wrong
     */
    public function reset(array $data): void
    {
        $status = DB::transaction(function () use ($data) {
            return Password::reset($data, function (User $user, string $password) {
                $user->forceFill([
                    'password' => $password, // hashed automatically by the User model
                    'remember_token' => Str::random(60),
                ])->save();

                // Log the user out of every app (all old tokens stop working)
                $user->tokens()->delete();

                event(new PasswordReset($user));
            });
        });

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)], // e.g. "This password reset token is invalid."
            ]);
        }
    }
}
