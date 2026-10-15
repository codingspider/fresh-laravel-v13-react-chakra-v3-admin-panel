import { useSelector } from 'react-redux';

/*
 * Check permissions in React — only to HIDE buttons and menu items.
 * The server always checks again.
 *
 * const { can } = usePermission();
 * {can('hr.employees.create') && <Button>Add</Button>}
 */
export default function usePermission() {
    const user = useSelector((state) => state.auth.user);

    const can = (permission) => {
        if (!user) return false;
        if (!permission) return true; // no permission needed
        if (user.roles?.includes('super-admin')) return true;
        return user.permissions?.includes(permission) ?? false;
    };

    return { can };
}
