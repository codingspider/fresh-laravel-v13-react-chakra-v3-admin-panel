<?php

use App\Support\ApiResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php', // module routes are loaded by each module
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Let /api routes use the HttpOnly session cookie when the request comes from our React app
        $middleware->statefulApi();

        $middleware->web(append: [
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // spatie/laravel-permission middleware, used in module routes: ->middleware('permission:hr.employees.view')
        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $isApi = fn (Request $request): bool => $request->is('api/*');

        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $isApi($request) || $request->expectsJson(),
        );

        // 422 — validation failed
        $exceptions->render(function (ValidationException $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return ApiResponse::error('Validation failed.', 422, $e->errors());
            }
        });

        // 401 — not logged in
        $exceptions->render(function (AuthenticationException $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return ApiResponse::error('Please log in to continue.', 401);
            }
        });

        // 403 (no permission), 404 (not found), 405, 429 (too many requests)…
        $exceptions->render(function (HttpExceptionInterface $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                $messages = [
                    403 => 'You do not have permission to do this.',
                    404 => 'Record not found.',
                    405 => 'Method not allowed.',
                    419 => 'Your session has expired. Please refresh the page.',
                    429 => 'Too many requests. Please try again later.',
                ];

                return ApiResponse::error($messages[$e->getStatusCode()] ?? 'Request failed.', $e->getStatusCode());
            }
        });

        // 500 — anything else. In debug mode Laravel shows the real error instead.
        $exceptions->render(function (Throwable $e, Request $request) use ($isApi) {
            if ($isApi($request) && ! config('app.debug')) {
                return ApiResponse::error('Something went wrong. Please try again.', 500);
            }
        });
    })->create();
