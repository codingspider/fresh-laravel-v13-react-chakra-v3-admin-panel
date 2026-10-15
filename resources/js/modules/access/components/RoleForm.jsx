import { useEffect, useState } from 'react';
import { Button, Field, HStack, Input, Separator, Spinner, Stack, Text } from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '@/utils/errors';
import permissionApi from '../api/permissionApi';
import PermissionPicker from './PermissionPicker';

/*
 * Create / edit role form: a name and the permissions (grouped, with select / unselect all).
 * The page passes onSubmit(values, setError) and does the API call.
 */
export default function RoleForm({ defaultValues, onSubmit, submitLabel = 'Save role' }) {
    const navigate = useNavigate();
    const [modules, setModules] = useState([]);
    const [loadingPermissions, setLoadingPermissions] = useState(true);
    const [permissionsError, setPermissionsError] = useState('');

    const {
        register,
        control,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues: { name: '', permissions: [], ...defaultValues } });

    // Load all permissions (grouped) once
    useEffect(() => {
        permissionApi
            .getGrouped()
            .then((response) => setModules(response.data.data))
            .catch((error) => setPermissionsError(getErrorMessage(error)))
            .finally(() => setLoadingPermissions(false));
    }, []);

    const submit = (values) => onSubmit(values, setError);

    return (
        <form onSubmit={handleSubmit(submit)} noValidate>
            <Stack gap="6">
                <Field.Root invalid={!!errors.name} required maxW="md">
                    <Field.Label>
                        Role name <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                        placeholder="e.g. Field Manager"
                        {...register('name', { required: 'Role name is required.' })}
                    />
                    <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                </Field.Root>

                <Separator />

                <div>
                    <Text fontWeight="semibold" mb="1">
                        Permissions
                    </Text>
                    <Text fontSize="sm" color="app.muted" mb="4">
                        Users with this role can do only what is ticked here.
                    </Text>

                    {loadingPermissions && <Spinner color="brand.solid" />}
                    {permissionsError && <Text color="red.500">{permissionsError}</Text>}

                    {!loadingPermissions && !permissionsError && (
                        <Controller
                            name="permissions"
                            control={control}
                            render={({ field }) => (
                                <PermissionPicker modules={modules} value={field.value} onChange={field.onChange} />
                            )}
                        />
                    )}

                    {errors.permissions && (
                        <Text color="red.500" fontSize="sm" mt="2">
                            {errors.permissions.message}
                        </Text>
                    )}
                </div>

                <HStack gap="3">
                    <Button type="submit" colorPalette="brand" loading={isSubmitting}>
                        {submitLabel}
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/access/roles')}>
                        Cancel
                    </Button>
                </HStack>
            </Stack>
        </form>
    );
}
