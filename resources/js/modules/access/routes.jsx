import PermissionRoute from '@/routes/PermissionRoute';
import RoleCreatePage from './pages/RoleCreatePage';
import RoleEditPage from './pages/RoleEditPage';
import RoleListPage from './pages/RoleListPage';
import UserCreatePage from './pages/UserCreatePage';
import UserEditPage from './pages/UserEditPage';
import UserListPage from './pages/UserListPage';

// Pages for logged-in users (inside AppLayout). Each page needs a permission.
export const accessRoutes = [
    {
        path: '/access/users',
        element: (
            <PermissionRoute permission="access.users.view">
                <UserListPage />
            </PermissionRoute>
        ),
    },
    {
        path: '/access/users/create',
        element: (
            <PermissionRoute permission="access.users.create">
                <UserCreatePage />
            </PermissionRoute>
        ),
    },
    {
        path: '/access/users/:id/edit',
        element: (
            <PermissionRoute permission="access.users.update">
                <UserEditPage />
            </PermissionRoute>
        ),
    },
    {
        path: '/access/roles',
        element: (
            <PermissionRoute permission="access.roles.view">
                <RoleListPage />
            </PermissionRoute>
        ),
    },
    {
        path: '/access/roles/create',
        element: (
            <PermissionRoute permission="access.roles.create">
                <RoleCreatePage />
            </PermissionRoute>
        ),
    },
    {
        path: '/access/roles/:id/edit',
        element: (
            <PermissionRoute permission="access.roles.update">
                <RoleEditPage />
            </PermissionRoute>
        ),
    },
];
