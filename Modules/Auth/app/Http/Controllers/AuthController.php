<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Modules\Auth\Http\Requests\LoginRequest;
use Modules\Auth\Services\AuthService;
use Modules\Auth\Transformers\AuthUserResource;
use Throwable;

/**
 * @group Auth
 *
 * Login, logout and the logged-in user.
 *
 * **Two ways to log in (same endpoints for both):**
 * - **Web (React):** call `GET /sanctum/csrf-cookie`, then `POST /api/v1/auth/login` **without** `device_name`.
 *   Laravel sets an HttpOnly session cookie. No token is returned.
 * - **Android app / Postman:** `POST /api/v1/auth/login` **with** `device_name`. Copy the `token` from the
 *   response and send it on every other request as `Authorization: Bearer <token>`.
 */
class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    /**
     * Login
     *
     * Log in with email **or** phone number and password.
     * Send `device_name` to get a Bearer token (Android / Postman).
     * Limited to 5 tries per minute.
     *
     * @unauthenticated
     *
     * @response 200 scenario="App login (token)" {"success":true,"message":"Logged in successfully","data":{"user":{"id":1,"name":"Super Admin","email":"admin@amarteam.test","phone":"01700000000","is_active":true,"roles":["super-admin"],"permissions":[],"created_at":"2026-10-15T14:00:00+06:00"},"token":"1|aBcD3fGh...","token_type":"Bearer"},"errors":null,"meta":null}
     * @response 200 scenario="Web login (cookie)" {"success":true,"message":"Logged in successfully","data":{"user":{"id":1,"name":"Super Admin","email":"admin@amarteam.test","phone":"01700000000","is_active":true,"roles":["super-admin"],"permissions":[],"created_at":"2026-10-15T14:00:00+06:00"}},"errors":null,"meta":null}
     * @response 422 scenario="Wrong email/phone or password" {"success":false,"message":"Invalid login details.","data":null,"errors":{"login":["Email/phone or password is wrong."]},"meta":null}
     * @response 403 scenario="Account turned off" {"success":false,"message":"Your account is inactive. Please contact the admin.","data":null,"errors":null,"meta":null}
     * @response 429 scenario="Too many tries" {"success":false,"message":"Too many requests. Please try again later.","data":null,"errors":null,"meta":null}
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();
        $isAppLogin = ! empty($data['device_name']);

        // Without device_name the request must come from our web app (which has a session cookie)
        if (! $isAppLogin && ! $request->hasSession()) {
            $message = 'device_name is required when logging in from an app or Postman.';

            return ApiResponse::error($message, 422, ['device_name' => [$message]]);
        }

        try {
            $user = $this->authService->findUserByCredentials($data['login'], $data['password']);

            if (! $user) {
                return ApiResponse::error('Invalid login details.', 422, ['login' => ['Email/phone or password is wrong.']]);
            }

            if (! $user->is_active) {
                return ApiResponse::error('Your account is inactive. Please contact the admin.', 403);
            }

            // Android app / Postman: return a token
            if ($isAppLogin) {
                $token = $this->authService->createToken($user, $data['device_name']);

                return ApiResponse::success([
                    'user' => new AuthUserResource($user),
                    'token' => $token,
                    'token_type' => 'Bearer',
                ], 'Logged in successfully');
            }

            // Web: start a session. The browser keeps an HttpOnly cookie; no token is sent.
            Auth::guard('web')->login($user, (bool) ($data['remember'] ?? false));
            $request->session()->regenerate(); // new session id, protects against session fixation

            return ApiResponse::success(['user' => new AuthUserResource($user)], 'Logged in successfully');
        } catch (Throwable $e) {
            Log::error('Login failed', ['error' => $e->getMessage()]);

            return ApiResponse::error('Login failed. Please try again.');
        }
    }

    /**
     * Logout
     *
     * Web: ends the session. App: deletes the token used for this request
     * (other devices stay logged in).
     *
     * @authenticated
     *
     * @response 200 {"success":true,"message":"Logged out successfully","data":null,"errors":null,"meta":null}
     * @response 401 scenario="Not logged in" {"success":false,"message":"Please log in to continue.","data":null,"errors":null,"meta":null}
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            /** @var User $user */
            $user = $request->user();

            if ($request->bearerToken()) {
                // Android app / Postman
                $this->authService->deleteCurrentToken($user);
            } else {
                // Web
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            return ApiResponse::success(null, 'Logged out successfully');
        } catch (Throwable $e) {
            Log::error('Logout failed', ['error' => $e->getMessage()]);

            return ApiResponse::error('Logout failed. Please try again.');
        }
    }

    /**
     * Logged-in user
     *
     * Returns the logged-in user with all role names and permission names.
     * Use `permissions` to show or hide buttons and menu items.
     *
     * @authenticated
     *
     * @response 200 {"success":true,"message":"User fetched successfully","data":{"id":1,"name":"Super Admin","email":"admin@amarteam.test","phone":"01700000000","is_active":true,"roles":["super-admin"],"permissions":["hr.employees.view"],"created_at":"2026-10-15T14:00:00+06:00"},"errors":null,"meta":null}
     * @response 401 scenario="Not logged in" {"success":false,"message":"Please log in to continue.","data":null,"errors":null,"meta":null}
     */
    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return ApiResponse::success(new AuthUserResource($user), 'User fetched successfully');
    }
}
