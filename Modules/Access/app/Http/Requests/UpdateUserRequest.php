<?php

namespace Modules\Access\Http\Requests;

use App\Models\User;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * Same as StoreUserRequest, but the password is optional
 * (leave it empty to keep the current password).
 */
class UpdateUserRequest extends StoreUserRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('access.users.update');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var User $user */
        $user = $this->route('user');

        return array_merge(parent::rules(), [
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'regex:/^01[3-9]\d{8}$/', Rule::unique('users', 'phone')->ignore($user->id)],
            'password' => ['nullable', 'confirmed', Password::defaults()],
        ]);
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public function bodyParameters(): array
    {
        return array_merge(parent::bodyParameters(), [
            'password' => ['description' => 'New password. Leave empty to keep the current one.', 'example' => null],
            'password_confirmation' => ['description' => 'Same new password again (only if password is sent).', 'example' => null],
        ]);
    }
}
