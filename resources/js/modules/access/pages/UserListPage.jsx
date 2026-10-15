import { useEffect, useState } from 'react';
import { Badge, Button, HStack, IconButton, Stack, Text, Wrap } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu';
import DataTable from '@/components/common/DataTable/DataTable';
import PageHeader from '@/components/common/PageHeader';
import usePermission from '@/hooks/usePermission';
import useTableParams from '@/hooks/useTableParams';
import { confirmAction } from '@/utils/confirm';
import { getErrorMessage } from '@/utils/errors';
import { formatDate } from '@/utils/format';
import { toast } from '@/utils/toast';
import roleApi from '../api/roleApi';
import userApi from '../api/userApi';
import { fetchUsers } from '../store/userSlice';

const STATUS_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
];

export default function UserListPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { can } = usePermission();
    const { params, setParams, queryKey } = useTableParams();
    const { items, meta, loading, error } = useSelector((state) => state.users);
    const [roleOptions, setRoleOptions] = useState([]);

    // Reload whenever page, search, filters or sort change in the URL
    const loadUsers = () => dispatch(fetchUsers(params));
    useEffect(() => {
        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryKey]);

    // Roles for the "Role" filter
    useEffect(() => {
        roleApi
            .getOptions()
            .then((response) =>
                setRoleOptions(response.data.data.map((role) => ({ label: role.name, value: role.name }))),
            )
            .catch(() => setRoleOptions([]));
    }, []);

    const handleDelete = async (user) => {
        const confirmed = await confirmAction({
            text: `Delete ${user.name}? They will not be able to log in again.`,
            confirmText: 'Yes, delete',
        });
        if (!confirmed) return;

        try {
            const response = await userApi.remove(user.id);
            toast.success(response.data.message);
            loadUsers();
        } catch (err) {
            toast.error(getErrorMessage(err));
        }
    };

    const filters = [
        { key: 'role', label: 'Roles', type: 'select', options: roleOptions },
        { key: 'status', label: 'Statuses', type: 'select', options: STATUS_OPTIONS },
    ];

    const columns = [
        {
            accessorKey: 'name',
            header: 'Name',
            enableSorting: true,
            cell: ({ row }) => (
                <Stack gap="0">
                    <Text fontWeight="medium">{row.original.name}</Text>
                    <Text fontSize="xs" color="app.muted">
                        {row.original.email}
                    </Text>
                </Stack>
            ),
        },
        { accessorKey: 'phone', header: 'Phone', cell: ({ getValue }) => getValue() || '—' },
        {
            id: 'roles',
            header: 'Roles',
            cell: ({ row }) => (
                <Wrap gap="1">
                    {row.original.roles.map((role) => (
                        <Badge key={role.id} colorPalette={role.name === 'super-admin' ? 'brand' : 'gray'} variant="subtle">
                            {role.name}
                        </Badge>
                    ))}
                    {row.original.roles.length === 0 && <Text color="app.muted">—</Text>}
                </Wrap>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ getValue }) => (
                <Badge colorPalette={getValue() ? 'green' : 'red'} variant="subtle">
                    {getValue() ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            enableSorting: true,
            cell: ({ getValue }) => <Text whiteSpace="nowrap">{formatDate(getValue())}</Text>,
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <HStack justify="flex-end" gap="1">
                    {can('access.users.update') && (
                        <IconButton
                            size="xs"
                            variant="ghost"
                            aria-label="Edit"
                            onClick={() => navigate(`/access/users/${row.original.id}/edit`)}
                        >
                            <LuPencil />
                        </IconButton>
                    )}
                    {can('access.users.delete') && (
                        <IconButton
                            size="xs"
                            variant="ghost"
                            colorPalette="red"
                            aria-label="Delete"
                            onClick={() => handleDelete(row.original)}
                        >
                            <LuTrash2 />
                        </IconButton>
                    )}
                </HStack>
            ),
        },
    ];

    return (
        <>
            <PageHeader title="Users" description="People who can log in, and their roles." />
            <DataTable
                columns={columns}
                data={items}
                meta={meta}
                loading={loading}
                error={error}
                onRetry={loadUsers}
                params={params}
                onParamsChange={setParams}
                filters={filters}
                searchPlaceholder="Search name, email or phone…"
                emptyText="No users found."
                actions={
                    can('access.users.create') && (
                        <Button colorPalette="brand" size="sm" onClick={() => navigate('/access/users/create')}>
                            <LuPlus /> Add user
                        </Button>
                    )
                }
            />
        </>
    );
}
