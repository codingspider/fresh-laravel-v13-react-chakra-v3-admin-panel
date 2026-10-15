<?php

namespace Modules\Access\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Query params of the users list (sent by the React DataTable and the Android app).
 */
class UserIndexRequest extends FormRequest
{
    /** Columns the list can be sorted by (all indexed). */
    public const SORTABLE = ['id', 'name', 'email', 'created_at'];

    public function authorize(): bool
    {
        return true; // checked by the permission:access.users.view middleware
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'role' => ['nullable', 'string', Rule::exists('roles', 'name')->where('guard_name', 'web')],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
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
            'search' => ['description' => 'Search by name or email (starts with) or phone.', 'example' => 'rahim'],
            'role' => ['description' => 'Only users with this role name.', 'example' => 'admin'],
            'status' => ['description' => 'active or inactive.', 'example' => 'active'],
            'page' => ['description' => 'Page number.', 'example' => 1],
            'per_page' => ['description' => 'Rows per page (max 100). Default 15.', 'example' => 15],
            'sort_by' => ['description' => 'One of: id, name, email, created_at.', 'example' => 'name'],
            'sort_dir' => ['description' => 'asc or desc.', 'example' => 'asc'],
        ];
    }
}
