<?php

namespace Modules\Access\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Query params of the roles list.
 */
class RoleIndexRequest extends FormRequest
{
    /** Columns the list can be sorted by. */
    public const SORTABLE = ['id', 'name', 'created_at', 'users_count'];

    public function authorize(): bool
    {
        return true; // checked by the permission:access.roles.view middleware
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'sort_by' => ['nullable', Rule::in(self::SORTABLE)],
            'sort_dir' => ['nullable', Rule::in(['asc', 'desc'])],
        ];
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public function queryParameters(): array
    {
        return [
            'search' => ['description' => 'Search by role name (starts with).', 'example' => 'man'],
            'page' => ['description' => 'Page number.', 'example' => 1],
            'per_page' => ['description' => 'Rows per page (max 100). Default 15.', 'example' => 15],
            'sort_by' => ['description' => 'One of: id, name, created_at, users_count.', 'example' => 'name'],
            'sort_dir' => ['description' => 'asc or desc.', 'example' => 'asc'],
        ];
    }
}
