<?php

namespace Modules\Auth\Transformers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The logged-in user, with roles and permissions.
 * Used by login and /me so React and Android can hide buttons the user cannot use.
 *
 * @mixin User
 */
class AuthUserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'is_active' => $this->is_active,
            'roles' => $this->getRoleNames(), // ["admin", "manager"]
            'permissions' => $this->getAllPermissions()->pluck('name'), // ["hr.employees.view", ...]
            'created_at' => $this->created_at?->timezone('Asia/Dhaka')->toIso8601String(),
        ];
    }
}
