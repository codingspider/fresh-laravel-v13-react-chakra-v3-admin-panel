import { LuLayoutDashboard } from 'react-icons/lu';

/*
 * Sidebar menu. Each item has the permission it needs (null = everyone).
 * Add an item here when a module gets its first page.
 */
const menu = [
    {
        label: 'Dashboard',
        path: '/dashboard',
        icon: LuLayoutDashboard,
        permission: null,
    },
];

export default menu;
