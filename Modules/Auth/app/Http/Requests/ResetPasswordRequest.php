<?php

namespace Modules\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ResetPasswordRequest extends FormRequest
{
    /**
     * Anyone with a valid reset token can reset the password.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'token' => ['required', 'string'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public function bodyParameters(): array
    {
        return [
            'token' => ['description' => 'The token from the reset-password email link.', 'example' => '3f9c2b...'],
            'email' => ['description' => 'Email address of the account.', 'example' => 'rahim@example.com'],
            'password' => ['description' => 'New password.', 'example' => 'new-secret-password'],
            'password_confirmation' => ['description' => 'Same new password again.', 'example' => 'new-secret-password'],
        ];
    }
}
