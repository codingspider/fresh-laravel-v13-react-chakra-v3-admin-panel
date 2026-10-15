<?php

namespace Modules\Access\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Modules\Access\Services\PermissionService;
use Throwable;

/**
 * @group Access - Permissions
 *
 * @authenticated
 */
class PermissionController extends Controller
{
    public function __construct(private PermissionService $permissionService) {}

    /**
     * List permissions (grouped)
     *
     * Every permission, grouped by module and then by resource, for the role form.
     * Permission names look like `<module>.<resource>.<action>`, e.g. `access.users.view`.
     * Permission: any of `access.roles.view`, `access.roles.create`, `access.roles.update`
     *
     * @response 200 {"success":true,"message":"Permissions fetched successfully","data":[{"module":"access","label":"Access","groups":[{"key":"access.roles","label":"Roles","permissions":[{"name":"access.roles.view","action":"view","label":"View"},{"name":"access.roles.create","action":"create","label":"Create"},{"name":"access.roles.update","action":"update","label":"Edit"},{"name":"access.roles.delete","action":"delete","label":"Delete"}]},{"key":"access.users","label":"Users","permissions":[{"name":"access.users.view","action":"view","label":"View"},{"name":"access.users.create","action":"create","label":"Create"},{"name":"access.users.update","action":"update","label":"Edit"},{"name":"access.users.delete","action":"delete","label":"Delete"}]}]}],"errors":null,"meta":null}
     */
    public function index(): JsonResponse
    {
        try {
            return ApiResponse::success($this->permissionService->grouped(), 'Permissions fetched successfully');
        } catch (Throwable $e) {
            Log::error('Permission list failed', ['error' => $e->getMessage()]);

            return ApiResponse::error('Failed to load permissions.');
        }
    }
}
