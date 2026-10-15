<?php

namespace Modules\Access\Services;

use App\Exceptions\BusinessException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

/**
 * Business logic for roles and the permissions they have.
 */
class RoleService
{
    /** This role has every permission and can never be changed or deleted. */
    public const SUPER_ADMIN = 'super-admin';

    /**
     * Paginated, searchable, sortable list of roles with user / permission counts.
     *
     * @param  array<string, mixed>  $filters  search, per_page, sort_by, sort_dir
     * @return LengthAwarePaginator<int, Role>
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return Role::query()
            ->where('guard_name', 'web')
            ->withCount(['users', 'permissions'])
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where('name', 'like', "{$search}%"))
            // sort_by is safe: RoleIndexRequest only allows listed columns
            ->orderBy($filters['sort_by'] ?? 'id', $filters['sort_dir'] ?? 'asc')
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Short list of all roles (id + name) for dropdowns and checkboxes.
     *
     * @return Collection<int, Role>
     */
    public function options(): Collection
    {
        return Role::query()
            ->where('guard_name', 'web')
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /**
     * Create a role with its permissions.
     *
     * @param  array{name: string, permissions?: list<string>}  $data
     */
    public function create(array $data): Role
    {
        return DB::transaction(function () use ($data) {
            /** @var Role $role */
            $role = Role::create(['name' => $data['name'], 'guard_name' => 'web']);

            $role->syncPermissions($data['permissions'] ?? []);

            return $role->load('permissions:id,name');
        });
    }

    /**
     * Rename a role and replace its permissions.
     *
     * @param  array{name: string, permissions?: list<string>}  $data
     */
    public function update(Role $role, array $data): Role
    {
        $this->ensureNotProtected($role);

        return DB::transaction(function () use ($role, $data) {
            $role->update(['name' => $data['name']]);
            $role->syncPermissions($data['permissions'] ?? []);

            return $role->load('permissions:id,name');
        });
    }

    /**
     * Delete a role. Not allowed while users still have it.
     */
    public function delete(Role $role): void
    {
        $this->ensureNotProtected($role);

        $usersCount = $role->users()->count();
        if ($usersCount > 0) {
            throw new BusinessException("This role is given to {$usersCount} user(s). Remove it from them first.");
        }

        DB::transaction(function () use ($role) {
            $role->syncPermissions([]);
            $role->delete();
        });
    }

    /**
     * The super-admin role cannot be changed or deleted.
     */
    protected function ensureNotProtected(Role $role): void
    {
        if ($role->name === self::SUPER_ADMIN) {
            throw new BusinessException('The super-admin role cannot be changed or deleted.', 403);
        }
    }
}
