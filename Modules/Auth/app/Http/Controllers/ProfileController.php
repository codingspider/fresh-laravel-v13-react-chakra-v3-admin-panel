<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\PersonalAccessToken;
use Modules\Auth\Http\Requests\ChangePasswordRequest;
use Modules\Auth\Http\Requests\UpdateProfileRequest;
use Modules\Auth\Services\ProfileService;
use Modules\Auth\Transformers\AuthUserResource;
use Throwable;

/**
 * @group Auth - Profile
 *
 * The logged-in user's own profile and password.
 *
 * @authenticated
 */
class ProfileController extends Controller
{
    public function __construct(private ProfileService $profileService) {}

    /**
     * Update profile
     *
     * Change your own name, email and phone.
     *
     * @response 200 {"success":true,"message":"Profile updated successfully","data":{"id":1,"name":"Rahim Uddin","email":"rahim@example.com","phone":"01712345678","is_active":true,"roles":["admin"],"permissions":[],"created_at":"2026-10-15T14:00:00+06:00"},"errors":null,"meta":null}
     * @response 422 scenario="Phone already used" {"success":false,"message":"Validation failed.","data":null,"errors":{"phone":["The phone has already been taken."]},"meta":null}
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        try {
            /** @var User $user */
            $user = $request->user();

            /** @var array{name: string, email: string, phone?: string|null} $data */
            $data = $request->validated();

            $user = $this->profileService->updateProfile($user, $data);

            return ApiResponse::success(new AuthUserResource($user), 'Profile updated successfully');
        } catch (Throwable $e) {
            Log::error('Profile update failed', ['error' => $e->getMessage()]);

            return ApiResponse::error('Failed to update profile.');
        }
    }

    /**
     * Change password
     *
     * Change your own password. Your other apps/devices are logged out;
     * the device making this request stays logged in.
     *
     * @response 200 {"success":true,"message":"Password changed successfully","data":null,"errors":null,"meta":null}
     * @response 422 scenario="Wrong current password" {"success":false,"message":"Validation failed.","data":null,"errors":{"current_password":["Your current password is wrong."]},"meta":null}
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        try {
            /** @var User $user */
            $user = $request->user();

            // Keep the token of this request (Android). Web requests have no token to keep.
            $currentToken = $user->currentAccessToken();
            $keepTokenId = $currentToken instanceof PersonalAccessToken ? (int) $currentToken->id : null;

            $this->profileService->changePassword($user, (string) $request->validated('password'), $keepTokenId);

            return ApiResponse::success(null, 'Password changed successfully');
        } catch (Throwable $e) {
            Log::error('Change password failed', ['error' => $e->getMessage()]);

            return ApiResponse::error('Failed to change password.');
        }
    }
}
