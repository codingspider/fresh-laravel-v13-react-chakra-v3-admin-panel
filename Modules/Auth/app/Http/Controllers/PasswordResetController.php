<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Modules\Auth\Http\Requests\ForgotPasswordRequest;
use Modules\Auth\Http\Requests\ResetPasswordRequest;
use Modules\Auth\Services\PasswordResetService;
use Throwable;

/**
 * @group Auth
 */
class PasswordResetController extends Controller
{
    public function __construct(private PasswordResetService $passwordResetService) {}

    /**
     * Forgot password
     *
     * Emails a reset link to the user. The link opens the web page `/reset-password?token=...&email=...`.
     * Always returns the same message, even if the email has no account.
     * Limited to 5 tries per minute.
     *
     * @unauthenticated
     *
     * @response 200 {"success":true,"message":"If this email has an account, a reset link has been sent.","data":null,"errors":null,"meta":null}
     * @response 422 scenario="Invalid email" {"success":false,"message":"Validation failed.","data":null,"errors":{"email":["The email field must be a valid email address."]},"meta":null}
     */
    public function sendResetLink(ForgotPasswordRequest $request): JsonResponse
    {
        try {
            $this->passwordResetService->sendResetLink((string) $request->validated('email'));

            return ApiResponse::success(null, 'If this email has an account, a reset link has been sent.');
        } catch (Throwable $e) {
            Log::error('Send reset link failed', ['error' => $e->getMessage()]);

            return ApiResponse::error('Could not send the reset link. Please try again.');
        }
    }

    /**
     * Reset password
     *
     * Saves a new password using the token from the email. All app tokens of the user are deleted,
     * so the Android app must log in again.
     *
     * @unauthenticated
     *
     * @response 200 {"success":true,"message":"Password reset successfully. Please log in.","data":null,"errors":null,"meta":null}
     * @response 422 scenario="Invalid or expired token" {"success":false,"message":"Validation failed.","data":null,"errors":{"email":["This password reset token is invalid."]},"meta":null}
     */
    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        try {
            /** @var array{token: string, email: string, password: string, password_confirmation?: string} $data */
            $data = $request->only('token', 'email', 'password', 'password_confirmation');

            $this->passwordResetService->reset($data);

            return ApiResponse::success(null, 'Password reset successfully. Please log in.');
        } catch (ValidationException $e) {
            throw $e; // wrong token -> 422 in our standard format
        } catch (Throwable $e) {
            Log::error('Reset password failed', ['error' => $e->getMessage()]);

            return ApiResponse::error('Could not reset the password. Please try again.');
        }
    }
}
