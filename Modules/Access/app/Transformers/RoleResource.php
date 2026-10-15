<?php

namespace Modules\Access\Transformers;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Access\Services\RoleService;
use Spatie\Permission\Models\Role;

/**
 * A role in the roles list / form.
 *
 * @mixin Role
 */
class RoleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            // true for super-admin: it has every permission and cannot be changed
            'is_protected' => $this->name === RoleService::SUPER_ADMIN,
            'users_count' => $this->whenCounted('users'),
            'permissions_count' => $this->whenCounted('permissions'),
            'permissions' => $this->whenLoaded('permissions', fn () => $this->permissions->pluck('name')),
            'created_at' => $this->created_at?->timezone('Asia/Dhaka')->toIso8601String(),
        ];
    }
}
