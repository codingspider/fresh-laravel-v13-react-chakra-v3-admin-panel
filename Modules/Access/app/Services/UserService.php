<?php

namespace Modules\Access\Services;

use App\Exceptions\BusinessException;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Business logic for managing users (create, edit, turn off, delete).
 */
class UserService
{
    /**
     * Paginated, searchable, sortable list of users.
     *
     * @param  array<string, mixed>  $filters  search, role, status, per_page, sort_by, sort_dir
     * @return LengthAwarePaginator<int, User>
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return User::query()
            ->with('roles:id,name')
            // name / email start with the text (uses the index), or exact phone
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "{$search}%")
                        ->orWhere('email', 'like', "{$search}%")
                        ->orWhere('phone', 'like', "{$search}%");
                });
            })
            ->when($filters['role'] ?? null, fn ($query, $role) => $query->role($role))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('is_active', $status === 'active'))
            // sort_by is safe: UserIndexRequest only allows listed columns
            ->orderBy($filters['sort_by'] ?? 'id', $filters['sort_dir'] ?? 'desc')
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Create a user and give roles.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'], // hashed automatically
                'is_active' => $data['is_active'],
            ]);

            $user->syncRoles($data['roles'] ?? []);

            return $user->load('roles:id,name');
        });
    }

    /**
     * Update a user. An empty password keeps the old one.
     * If the account is turned off or the password changes, the user is logged out everywhere.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(User $actor, User $user, array $data): User
    {
        $this->ensureCanManage($actor, $user);

        if ($actor->id === $user->id && ! $data['is_active']) {
            throw new BusinessException('You cannot turn off your own account.');
        }

        return DB::transaction(function () use ($user, $data) {
            $user->fill([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'is_active' => $data['is_active'],
            ]);

            $passwordChanged = ! empty($data['password']);
            if ($passwordChanged) {
                $user->password = $data['password']; // hashed automatically
            }

            $user->save();
            $user->syncRoles($data['roles'] ?? []);

            if ($passwordChanged || ! $user->is_active) {
                $this->logoutEverywhere($user);
            }

            return $user->load('roles:id,name');
        });
    }

    /**
     * Delete a user (and log them out everywhere).
     */
    public function delete(User $actor, User $user): void
    {
        $this->ensureCanManage($actor, $user);

        if ($actor->id === $user->id) {
            throw new BusinessException('You cannot delete your own account.');
        }

        DB::transaction(function () use ($user) {
            $this->logoutEverywhere($user);
            $user->syncRoles([]);
            $user->delete();
        });
    }

    /**
     * Only a super-admin can change or delete another super-admin.
     */
    protected function ensureCanManage(User $actor, User $user): void
    {
        if ($user->hasRole('super-admin') && ! $actor->hasRole('super-admin')) {
            throw new BusinessException('Only a super admin can change a super admin account.', 403);
        }
    }

    /**
     * Delete all app tokens and web sessions of the user.
     */
    protected function logoutEverywhere(User $user): void
    {
        $user->tokens()->delete();

        if (config('session.driver') === 'database') {
            DB::table(config('session.table', 'sessions'))->where('user_id', $user->id)->delete();
        }
    }
}
