<?php

namespace Modules\Access\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('access.users.create');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'regex:/^01[3-9]\d{8}$/', 'unique:users,phone'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'is_active' => ['required', 'boolean'],
            'roles' => ['nullable', 'array'],
            'roles.*' => [
                'string',
                'distinct',
                Rule::exists('roles', 'name')->where('guard_name', 'web'),
                $this->onlySuperAdminCanGiveSuperAdmin(),
            ],
        ];
    }

    /**
     * The super-admin role can only be given by another super-admin.
     */
    protected function onlySuperAdminCanGiveSuperAdmin(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) {
            if ($value === 'super-admin' && ! $this->user()?->hasRole('super-admin')) {
                $fail('Only a super admin can give the super-admin role.');
            }
        };
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.regex' => 'Enter a valid Bangladeshi phone number (01XXXXXXXXX).',
        ];
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public function bodyParameters(): array
    {
        return [
            'name' => ['description' => 'Full name.', 'example' => 'Rahim Uddin'],
            'email' => ['description' => 'Email address (used to log in).', 'example' => 'rahim@example.com'],
            'phone' => ['description' => 'Bangladeshi mobile number (optional, can be used to log in).', 'example' => '01712345678'],
            'password' => ['description' => 'Password.', 'example' => 'secret-password'],
            'password_confirmation' => ['description' => 'Same password again.', 'example' => 'secret-password'],
            'is_active' => ['description' => 'false = the user cannot log in.', 'example' => true],
            'roles' => ['description' => 'Role names.', 'example' => ['manager']],
            'roles.*' => ['description' => 'A role name.', 'example' => 'manager'],
        ];
    }
}
