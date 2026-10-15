<?php

namespace Modules\Access\Http\Controllers;

use App\Exceptions\BusinessException;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Modules\Access\Http\Requests\RoleIndexRequest;
use Modules\Access\Http\Requests\StoreRoleRequest;
use Modules\Access\Http\Requests\UpdateRoleRequest;
use Modules\Access\Services\RoleService;
use Modules\Access\Transformers\RoleResource;
use Spatie\Permission\Models\Role;
use Throwable;

/**
 * @group Access - Roles
 *
 * A role is a named set of permissions (e.g. "manager"). Users get permissions through their roles.
 * The `super-admin` role has every permission and cannot be changed or deleted.
 *
 * @authenticated
 */
class RoleController extends Controller
{
    public function __construct(private RoleService $roleService) {}

    /**
     * List roles
     *
     * Paginated list with user and permission counts.
     * Permission: `access.roles.view`
     *
     * @response 200 {"success":true,"message":"Roles fetched successfully","data":[{"id":2,"name":"admin","is_protected":false,"users_count":3,"permissions_count":8,"created_at":"2026-10-15T14:00:00+06:00"}],"errors":null,"meta":{"current_page":1,"last_page":1,"per_page":15,"total":1,"from":1,"to":1}}
     */
    public function index(RoleIndexRequest $request): JsonResponse
    {
        try {
            $roles = $this->roleService->list($request->validated());

            return ApiResponse::paginated($roles, RoleResource::class, 'Roles fetched successfully');
        } catch (Throwable $e) {
            Log::error('Role list failed', ['error' => $e->getMessage()]);

            return ApiResponse::error('Failed to load roles.');
        }
    }

    /**
     * Role options
     *
     * All roles (id + name only, no pagination) for dropdowns and checkboxes.
     * Permission: any of `access.roles.view`, `access.users.view`, `access.users.create`, `access.users.update`
     *
     * @response 200 {"success":true,"message":"Roles fetched successfully","data":[{"id":2,"name":"admin"},{"id":3,"name":"manager"},{"id":1,"name":"super-admin"}],"errors":null,"meta":null}
     */
    public function options(): JsonResponse
    {
        try {
            return ApiResponse::success($this->roleService->options(), 'Roles fetched successfully');
        } catch (Throwable $e) {
            Log::error('Role options failed', ['error' => $e->getMessage()]);

            return ApiResponse::error('Failed to load roles.');
        }
    }

    /**
     * Create role
     *
     * Permission: `access.roles.create`
     *
     * @response 201 {"success":true,"message":"Role created successfully","data":{"id":3,"name":"Field Manager","is_protected":false,"permissions":["access.users.view"],"created_at":"2026-10-15T14:00:00+06:00"},"errors":null,"meta":null}
     * @response 422 scenario="Name taken" {"success":false,"message":"Validation failed.","data":null,"errors":{"name":["The name has already been taken."]},"meta":null}
     */
    public function store(StoreRoleRequest $request): JsonResponse
    {
        try {
            /** @var array{name: string, permissions?: list<string>} $data */
            $data = $request->validated();
            $role = $this->roleService->create($data);

            return ApiResponse::success(new RoleResource($role), 'Role created successfully', 201);
        } catch (Throwable $e) {
            Log::error('Role create failed', ['error' => $e->getMessage()]);

            return ApiResponse::error('Failed to create role.');
        }
    }

    /**
     * Show role
     *
     * Returns the role with the names of all its permissions.
     * Permission: `access.roles.view`
     *
     * @urlParam role integer required The role ID. Example: 2
     *
     * @response 200 {"success":true,"message":"Role fetched successfully","data":{"id":2,"name":"admin","is_protected":false,"permissions":["access.users.view","access.users.create"],"created_at":"2026-10-15T14:00:00+06:00"},"errors":null,"meta":null}
     * @response 404 {"success":false,"message":"Record not found.","data":null,"errors":null,"meta":null}
     */
    public function show(Role $role): JsonResponse
    {
        return ApiResponse::success(new RoleResource($role->load('permissions:id,name')), 'Role fetched successfully');
    }

    /**
     * Update role
     *
     * Renames the role and replaces its permissions with the list you send.
     * Permission: `access.roles.update`
     *
     * @urlParam role integer required The role ID. Example: 2
     *
     * @response 200 {"success":true,"message":"Role updated successfully","data":{"id":2,"name":"admin","is_protected":false,"permissions":["access.users.view"],"created_at":"2026-10-15T14:00:00+06:00"},"errors":null,"meta":null}
     * @response 403 scenario="super-admin role" {"success":false,"message":"The super-admin role cannot be changed or deleted.","data":null,"errors":null,"meta":null}
     */
    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        try {
            /** @var array{name: string, permissions?: list<string>} $data */
            $data = $request->validated();
            $role = $this->roleService->update($role, $data);

            return ApiResponse::success(new RoleResource($role), 'Role updated successfully');
        } catch (BusinessException $e) {
            return ApiResponse::error($e->getMessage(), $e->status);
        } catch (Throwable $e) {
            Log::error('Role update failed', ['id' => $role->id, 'error' => $e->getMessage()]);

            return ApiResponse::error('Failed to update role.');
        }
    }

    /**
     * Delete role
     *
     * Not allowed while users still have this role.
     * Permission: `access.roles.delete`
     *
     * @urlParam role integer required The role ID. Example: 3
     *
     * @response 200 {"success":true,"message":"Role deleted successfully","data":null,"errors":null,"meta":null}
     * @response 422 scenario="Role in use" {"success":false,"message":"This role is given to 3 user(s). Remove it from them first.","data":null,"errors":null,"meta":null}
     */
    public function destroy(Role $role): JsonResponse
    {
        try {
            $this->roleService->delete($role);

            return ApiResponse::success(null, 'Role deleted successfully');
        } catch (BusinessException $e) {
            return ApiResponse::error($e->getMessage(), $e->status);
        } catch (Throwable $e) {
            Log::error('Role delete failed', ['id' => $role->id, 'error' => $e->getMessage()]);

            return ApiResponse::error('Failed to delete role.');
        }
    }
}
