<?php

namespace Modules\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ChangePasswordRequest extends FormRequest
{
    /**
     * Every logged-in user can change their own password.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'current_password' => ['required', 'current_password'], // must match the saved password
            'password' => ['required', 'confirmed', 'different:current_password', Password::defaults()],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'current_password.current_password' => 'Your current password is wrong.',
            'password.different' => 'The new password must be different from the current one.',
        ];
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public function bodyParameters(): array
    {
        return [
            'current_password' => ['description' => 'Current password.', 'example' => 'old-secret-password'],
            'password' => ['description' => 'New password.', 'example' => 'new-secret-password'],
            'password_confirmation' => ['description' => 'Same new password again.', 'example' => 'new-secret-password'],
        ];
    }
}
