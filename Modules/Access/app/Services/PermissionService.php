<?php

namespace Modules\Access\Services;

use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;

/**
 * Lists all permissions, grouped for the role form.
 *
 * A permission name has three parts:  <module>.<resource>.<action>
 *   access.users.view  ->  module "Access", group "Users", action "View"
 *
 * Every module seeds its own permissions, so new modules show up here automatically.
 */
class PermissionService
{
    /** Friendly labels for actions. Unknown actions are shown as "Headline Case". */
    protected const ACTION_LABELS = [
        'view' => 'View',
        'create' => 'Create',
        'update' => 'Edit',
        'delete' => 'Delete',
        'approve' => 'Approve',
        'export' => 'Export',
    ];

    /** Order of actions inside a group (others come after, A–Z). */
    protected const ACTION_ORDER = ['view', 'create', 'update', 'delete', 'approve', 'export'];

    /**
     * All permissions, grouped by module and then by resource.
     *
     * @return list<array{module: string, label: string, groups: list<array{key: string, label: string, permissions: list<array{name: string, action: string, label: string}>}>}>
     */
    public function grouped(): array
    {
        $permissions = Permission::query()
            ->where('guard_name', 'web')
            ->orderBy('name')
            ->pluck('name');

        $modules = [];

        foreach ($permissions as $name) {
            $parts = explode('.', $name);
            if (count($parts) !== 3) {
                continue; // not in <module>.<resource>.<action> format
            }

            [$module, $resource, $action] = $parts;
            $groupKey = "{$module}.{$resource}";

            $modules[$module]['module'] = $module;
            $modules[$module]['label'] = Str::headline($module);
            $modules[$module]['groups'][$groupKey]['key'] = $groupKey;
            $modules[$module]['groups'][$groupKey]['label'] = Str::headline($resource);
            $modules[$module]['groups'][$groupKey]['permissions'][] = [
                'name' => $name,
                'action' => $action,
                'label' => self::ACTION_LABELS[$action] ?? Str::headline($action),
            ];
        }

        // Turn the keyed arrays into plain lists and sort the actions
        $result = [];
        foreach ($modules as $module) {
            $groups = [];
            foreach ($module['groups'] as $group) {
                usort($group['permissions'], fn ($a, $b) => $this->actionPosition($a['action']) <=> $this->actionPosition($b['action'])
                    ?: strcmp($a['action'], $b['action']));
                $groups[] = $group;
            }
            $module['groups'] = $groups;
            $result[] = $module;
        }

        return $result;
    }

    /**
     * Position of an action in ACTION_ORDER (unknown actions go last).
     */
    protected function actionPosition(string $action): int
    {
        $position = array_search($action, self::ACTION_ORDER, true);

        return $position === false ? 99 : $position;
    }
}
