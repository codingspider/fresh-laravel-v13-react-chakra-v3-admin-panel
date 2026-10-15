<?php

namespace Modules\Auth\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * The logged-in user's own profile and password.
 */
class ProfileService
{
    /**
     * Update name, email and phone.
     *
     * @param  array{name: string, email: string, phone?: string|null}  $data
     */
    public function updateProfile(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $user->update($data);

            return $user->refresh();
        });
    }

    /**
     * Save a new password and log out the user's other apps.
     *
     * @param  int|null  $keepTokenId  The token making this request (Android) — it stays logged in.
     */
    public function changePassword(User $user, string $newPassword, ?int $keepTokenId = null): void
    {
        DB::transaction(function () use ($user, $newPassword, $keepTokenId) {
            $user->update(['password' => $newPassword]); // hashed automatically

            $user->tokens()
                ->when($keepTokenId, fn ($query) => $query->where('id', '!=', $keepTokenId))
                ->delete();
        });
    }
}
