<?php

namespace Modules\Access\Http\Controllers;

use App\Exceptions\BusinessException;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Modules\Access\Http\Requests\StoreUserRequest;
use Modules\Access\Http\Requests\UpdateUserRequest;
use Modules\Access\Http\Requests\UserIndexRequest;
use Modules\Access\Services\UserService;
use Modules\Access\Transformers\UserResource;
use Throwable;

/**
 * @group Access - Users
 *
 * Manage who can log in and which roles they have.
 *
 * @authenticated
 */
class UserController extends Controller
{
    public function __construct(private UserService $userService) {}

    /**
     * List users
     *
     * Paginated list with search, filters and sorting.
     * Permission: `access.users.view`
     *
     * @response 200 {"success":true,"message":"Users fetched successfully","data":[{"id":2,"name":"Rahim Uddin","email":"rahim@example.com","phone":"01712345678","is_active":true,"roles":[{"id":2,"name":"admin"}],"created_at":"2026-10-15T14:00:00+06:00"}],"errors":null,"meta":{"current_page":1,"last_page":1,"per_page":15,"total":1,"from":1,"to":1}}
     * @response 403 scenario="No permission" {"success":false,"message":"You do not have permission to do this.","data":null,"errors":null,"meta":null}
     */
    public function index(UserIndexRequest $request): JsonResponse
    {
        try {
            $users = $this->userService->list($request->validated());

            return ApiResponse::paginated($users, UserResource::class, 'Users fetched successfully');
        } catch (Throwable $e) {
            Log::error('User list failed', ['error' => $e->getMessage()]);

            return ApiResponse::error('Failed to load users.');
        }
    }

    /**
     * Create user
     *
     * Permission: `access.users.create`. Only a super admin can give the `super-admin` role.
     *
     * @response 201 {"success":true,"message":"User created successfully","data":{"id":3,"name":"Karim Hasan","email":"karim@example.com","phone":"01812345678","is_active":true,"roles":[{"id":3,"name":"manager"}],"created_at":"2026-10-15T14:00:00+06:00"},"errors":null,"meta":null}
     * @response 422 scenario="Validation error" {"success":false,"message":"Validation failed.","data":null,"errors":{"email":["The email has already been taken."]},"meta":null}
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        try {
            $user = $this->userService->create($request->validated());

            return ApiResponse::success(new UserResource($user), 'User created successfully', 201);
        } catch (Throwable $e) {
            Log::error('User create failed', ['error' => $e->getMessage()]);

            return ApiResponse::error('Failed to create user.');
        }
    }

    /**
     * Show user
     *
     * Permission: `access.users.view`
     *
     * @urlParam user integer required The user ID. Example: 2
     *
     * @response 200 {"success":true,"message":"User fetched successfully","data":{"id":2,"name":"Rahim Uddin","email":"rahim@example.com","phone":"01712345678","is_active":true,"roles":[{"id":2,"name":"admin"}],"created_at":"2026-10-15T14:00:00+06:00"},"errors":null,"meta":null}
     * @response 404 {"success":false,"message":"Record not found.","data":null,"errors":null,"meta":null}
     */
    public function show(User $user): JsonResponse
    {
        return ApiResponse::success(new UserResource($user->load('roles:id,name')), 'User fetched successfully');
    }

    /**
     * Update user
     *
     * Leave `password` empty to keep the current password. Turning a user off
     * (`is_active: false`) or changing the password logs them out of all devices.
     * Permission: `access.users.update`
     *
     * @urlParam user integer required The user ID. Example: 2
     *
     * @response 200 {"success":true,"message":"User updated successfully","data":{"id":2,"name":"Rahim Uddin","email":"rahim@example.com","phone":"01712345678","is_active":false,"roles":[],"created_at":"2026-10-15T14:00:00+06:00"},"errors":null,"meta":null}
     * @response 422 scenario="Own account" {"success":false,"message":"You cannot turn off your own account.","data":null,"errors":null,"meta":null}
     * @response 403 scenario="Super admin account" {"success":false,"message":"Only a super admin can change a super admin account.","data":null,"errors":null,"meta":null}
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        try {
            $user = $this->userService->update($this->actor($request), $user, $request->validated());

            return ApiResponse::success(new UserResource($user), 'User updated successfully');
        } catch (BusinessException $e) {
            return ApiResponse::error($e->getMessage(), $e->status);
        } catch (Throwable $e) {
            Log::error('User update failed', ['id' => $user->id, 'error' => $e->getMessage()]);

            return ApiResponse::error('Failed to update user.');
        }
    }

    /**
     * Delete user
     *
     * Deletes the user and logs them out of all devices. You cannot delete yourself.
     * Tip: to stop someone logging in but keep their history, turn them off instead.
     * Permission: `access.users.delete`
     *
     * @urlParam user integer required The user ID. Example: 2
     *
     * @response 200 {"success":true,"message":"User deleted successfully","data":null,"errors":null,"meta":null}
     * @response 422 scenario="Own account" {"success":false,"message":"You cannot delete your own account.","data":null,"errors":null,"meta":null}
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        try {
            $this->userService->delete($this->actor($request), $user);

            return ApiResponse::success(null, 'User deleted successfully');
        } catch (BusinessException $e) {
            return ApiResponse::error($e->getMessage(), $e->status);
        } catch (Throwable $e) {
            Log::error('User delete failed', ['id' => $user->id, 'error' => $e->getMessage()]);

            return ApiResponse::error('Failed to delete user.');
        }
    }

    /**
     * The logged-in user who is doing the action.
     */
    private function actor(Request $request): User
    {
        /** @var User $actor */
        $actor = $request->user();

        return $actor;
    }
}
