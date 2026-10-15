<?php

namespace Modules\Access\Http\Requests;

use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

/**
 * Same as StoreRoleRequest, but the name may stay the same.
 */
class UpdateRoleRequest extends StoreRoleRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('access.roles.update');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Role $role */
        $role = $this->route('role');

        return array_merge(parent::rules(), [
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('roles', 'name')->where('guard_name', 'web')->ignore($role->id),
            ],
        ]);
    }
}
