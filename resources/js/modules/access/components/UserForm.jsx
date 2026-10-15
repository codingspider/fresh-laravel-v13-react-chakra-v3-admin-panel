import { useEffect, useState } from 'react';
import {
    Button,
    Checkbox,
    Field,
    HStack,
    Input,
    Separator,
    SimpleGrid,
    Spinner,
    Stack,
    Switch,
    Text,
} from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import roleApi from '../api/roleApi';

const EMPTY_USER = {
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    is_active: true,
    roles: [],
};

/*
 * Create / edit user form.
 * isEdit = true: the password is optional (empty = keep the current password).
 * The page passes onSubmit(values, setError) and does the API call.
 */
export default function UserForm({ defaultValues, isEdit = false, onSubmit, submitLabel = 'Save user' }) {
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.auth.user);
    const isSuperAdmin = currentUser?.roles?.includes('super-admin');
    const [roleOptions, setRoleOptions] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(true);

    const {
        register,
        control,
        handleSubmit,
        setError,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues: { ...EMPTY_USER, ...defaultValues } });

    // Load roles for the checkboxes. Only a super admin may give the super-admin role.
    useEffect(() => {
        roleApi
            .getOptions()
            .then((response) => {
                const roles = response.data.data;
                setRoleOptions(isSuperAdmin ? roles : roles.filter((role) => role.name !== 'super-admin'));
            })
            .finally(() => setLoadingRoles(false));
    }, [isSuperAdmin]);

    const submit = (values) => onSubmit(values, setError);

    return (
        <form onSubmit={handleSubmit(submit)} noValidate>
            <Stack gap="6">
                <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                    <Field.Root invalid={!!errors.name} required>
                        <Field.Label>
                            Name <Field.RequiredIndicator />
                        </Field.Label>
                        <Input {...register('name', { required: 'Name is required.' })} />
                        <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.email} required>
                        <Field.Label>
                            Email <Field.RequiredIndicator />
                        </Field.Label>
                        <Input type="email" {...register('email', { required: 'Email is required.' })} />
                        <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.phone}>
                        <Field.Label>Phone</Field.Label>
                        <Input
                            placeholder="01XXXXXXXXX"
                            {...register('phone', {
                                pattern: {
                                    value: /^01[3-9]\d{8}$/,
                                    message: 'Enter a valid Bangladeshi phone number (01XXXXXXXXX).',
                                },
                            })}
                        />
                        <Field.HelperText>Optional. The user can log in with this number.</Field.HelperText>
                        <Field.ErrorText>{errors.phone?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root>
                        <Field.Label>Status</Field.Label>
                        <Controller
                            name="is_active"
                            control={control}
                            render={({ field }) => (
                                <Switch.Root
                                    colorPalette="brand"
                                    checked={field.value}
                                    onCheckedChange={({ checked }) => field.onChange(checked)}
                                    mt="2"
                                >
                                    <Switch.HiddenInput />
                                    <Switch.Control />
                                    <Switch.Label>{field.value ? 'Active — can log in' : 'Inactive — cannot log in'}</Switch.Label>
                                </Switch.Root>
                            )}
                        />
                    </Field.Root>

                    <Field.Root invalid={!!errors.password} required={!isEdit}>
                        <Field.Label>
                            {isEdit ? 'New password' : 'Password'} {!isEdit && <Field.RequiredIndicator />}
                        </Field.Label>
                        <Input
                            type="password"
                            autoComplete="new-password"
                            {...register('password', {
                                required: isEdit ? false : 'Password is required.',
                                minLength: { value: 8, message: 'Use at least 8 characters.' },
                            })}
                        />
                        {isEdit && <Field.HelperText>Leave empty to keep the current password.</Field.HelperText>}
                        <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.password_confirmation} required={!isEdit}>
                        <Field.Label>
                            Confirm password {!isEdit && <Field.RequiredIndicator />}
                        </Field.Label>
                        <Input
                            type="password"
                            autoComplete="new-password"
                            {...register('password_confirmation', {
                                validate: (value) => value === getValues('password') || 'Passwords do not match.',
                            })}
                        />
                        <Field.ErrorText>{errors.password_confirmation?.message}</Field.ErrorText>
                    </Field.Root>
                </SimpleGrid>

                <Separator />

                <div>
                    <Text fontWeight="semibold" mb="1">
                        Roles
                    </Text>
                    <Text fontSize="sm" color="app.muted" mb="3">
                        The user gets all permissions of the ticked roles.
                    </Text>

                    {loadingRoles ? (
                        <Spinner color="brand.solid" />
                    ) : (
                        <Controller
                            name="roles"
                            control={control}
                            render={({ field }) => (
                                <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="3">
                                    {roleOptions.map((role) => (
                                        <Checkbox.Root
                                            key={role.id}
                                            colorPalette="brand"
                                            checked={field.value.includes(role.name)}
                                            onCheckedChange={({ checked }) =>
                                                field.onChange(
                                                    checked === true
                                                        ? [...field.value, role.name]
                                                        : field.value.filter((name) => name !== role.name),
                                                )
                                            }
                                        >
                                            <Checkbox.HiddenInput />
                                            <Checkbox.Control />
                                            <Checkbox.Label>{role.name}</Checkbox.Label>
                                        </Checkbox.Root>
                                    ))}
                                    {roleOptions.length === 0 && <Text color="app.muted">No roles yet.</Text>}
                                </SimpleGrid>
                            )}
                        />
                    )}

                    {errors.roles && (
                        <Text color="red.500" fontSize="sm" mt="2">
                            {errors.roles.message}
                        </Text>
                    )}
                </div>

                <HStack gap="3">
                    <Button type="submit" colorPalette="brand" loading={isSubmitting}>
                        {submitLabel}
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/access/users')}>
                        Cancel
                    </Button>
                </HStack>
            </Stack>
        </form>
    );
}
