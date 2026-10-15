<?php

namespace Modules\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    /**
     * Anyone can try to log in.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules for login.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'login' => ['required', 'string', 'max:255'], // email OR phone
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:255'], // only the Android app sends this
            'remember' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Friendly error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'login.required' => 'Enter your email or phone number.',
            'password.required' => 'Enter your password.',
        ];
    }

    /**
     * Descriptions and examples for Scribe / Postman.
     *
     * @return array<string, array<string, mixed>>
     */
    public function bodyParameters(): array
    {
        return [
            'login' => ['description' => 'Email address or phone number (01XXXXXXXXX).', 'example' => '01700000000'],
            'password' => ['description' => 'Account password.', 'example' => 'secret-password'],
            'device_name' => ['description' => 'Send this from the Android app / Postman to get a Bearer token. Leave it out on the web (cookie login).', 'example' => 'Samsung A54'],
            'remember' => ['description' => 'Web only: keep me logged in.', 'example' => false],
        ];
    }
}
