import { useEffect } from 'react';
import { Badge, Button, HStack, IconButton, Text } from '@chakra-ui/react';
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
import { fetchRoles } from '../store/roleSlice';

export default function RoleListPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { can } = usePermission();
    const { params, setParams, queryKey } = useTableParams();
    const { items, meta, loading, error } = useSelector((state) => state.roles);

    // Reload whenever page, search or sort change in the URL
    const loadRoles = () => dispatch(fetchRoles(params));
    useEffect(() => {
        loadRoles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryKey]);

    const handleDelete = async (role) => {
        const confirmed = await confirmAction({ text: `Delete the role "${role.name}"?`, confirmText: 'Yes, delete' });
        if (!confirmed) return;

        try {
            const response = await roleApi.remove(role.id);
            toast.success(response.data.message);
            loadRoles();
        } catch (err) {
            toast.error(getErrorMessage(err)); // e.g. "This role is given to 3 user(s)..."
        }
    };

    const columns = [
        {
            accessorKey: 'name',
            header: 'Role',
            enableSorting: true,
            cell: ({ row }) => (
                <HStack gap="2">
                    <Text fontWeight="medium">{row.original.name}</Text>
                    {row.original.is_protected && (
                        <Badge colorPalette="brand" variant="subtle">
                            Protected
                        </Badge>
                    )}
                </HStack>
            ),
        },
        { accessorKey: 'users_count', header: 'Users', enableSorting: true },
        {
            accessorKey: 'permissions_count',
            header: 'Permissions',
            cell: ({ row }) => (row.original.is_protected ? 'All' : row.original.permissions_count),
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
            cell: ({ row }) =>
                row.original.is_protected ? null : (
                    <HStack justify="flex-end" gap="1">
                        {can('access.roles.update') && (
                            <IconButton
                                size="xs"
                                variant="ghost"
                                aria-label="Edit"
                                onClick={() => navigate(`/access/roles/${row.original.id}/edit`)}
                            >
                                <LuPencil />
                            </IconButton>
                        )}
                        {can('access.roles.delete') && (
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
            <PageHeader
                title="Roles & Permissions"
                description="A role is a set of permissions. Give roles to users on the Users page."
            />
            <DataTable
                columns={columns}
                data={items}
                meta={meta}
                loading={loading}
                error={error}
                onRetry={loadRoles}
                params={params}
                onParamsChange={setParams}
                searchPlaceholder="Search role name…"
                emptyText="No roles found."
                actions={
                    can('access.roles.create') && (
                        <Button colorPalette="brand" size="sm" onClick={() => navigate('/access/roles/create')}>
                            <LuPlus /> Add role
                        </Button>
                    )
                }
            />
        </>
    );
}
