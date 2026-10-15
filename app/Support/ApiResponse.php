<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * The ONE response format for every API request (web and Android).
 *
 * Every response has the same five keys:
 * success, message, data, errors, meta
 */
class ApiResponse
{
    /**
     * Successful response.
     *
     * @param  array<string, mixed>|null  $meta
     */
    public static function success(mixed $data = null, string $message = 'Success', int $status = 200, ?array $meta = null): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'errors' => null,
            'meta' => $meta,
        ], $status);
    }

    /**
     * Successful paginated list. $resourceClass is an API Resource class name.
     *
     * @param  LengthAwarePaginator<int, mixed>  $paginator
     * @param  class-string<\Illuminate\Http\Resources\Json\JsonResource>  $resourceClass
     */
    public static function paginated(LengthAwarePaginator $paginator, string $resourceClass, string $message = 'Success'): JsonResponse
    {
        return self::success(
            $resourceClass::collection($paginator->items()),
            $message,
            200,
            [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ]
        );
    }

    /**
     * Error response.
     *
     * @param  array<string, mixed>|null  $errors  Field => messages (for validation errors)
     */
    public static function error(string $message = 'Something went wrong.', int $status = 500, ?array $errors = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => null,
            'errors' => $errors,
            'meta' => null,
        ], $status);
    }
}
