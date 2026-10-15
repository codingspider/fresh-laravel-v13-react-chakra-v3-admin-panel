import { LuLayoutDashboard, LuShieldCheck, LuUserCog, LuUsers } from 'react-icons/lu';

/*
 * Sidebar menu.
 *
 * A plain item:  { label, path, icon, permission }      (permission null = everyone)
 * A group:       { label, icon, children: [items...] }  (shown only if the user can see a child)
 *
 * Add an item here when a module gets its first page.
 */
const menu = [
    {
        label: 'Dashboard',
        path: '/dashboard',
        icon: LuLayoutDashboard,
        permission: null,
    },
    {
        label: 'User Management',
        icon: LuUserCog,
        children: [
            {
                label: 'Users',
                path: '/access/users',
                icon: LuUsers,
                permission: 'access.users.view',
            },
            {
                label: 'Roles & Permissions',
                path: '/access/roles',
                icon: LuShieldCheck,
                permission: 'access.roles.view',
            },
        ],
    },
];

export default menu;
