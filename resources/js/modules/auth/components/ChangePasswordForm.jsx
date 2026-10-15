import { Button, Field, Input, Stack } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { getErrorMessage, setServerErrors } from '@/utils/errors';
import { toast } from '@/utils/toast';
import authApi from '../api/authApi';

const EMPTY_FORM = { current_password: '', password: '', password_confirmation: '' };

// Change your own password
export default function ChangePasswordForm() {
    const {
        register,
        handleSubmit,
        setError,
        getValues,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues: EMPTY_FORM });

    const onSubmit = async (values) => {
        try {
            const response = await authApi.changePassword(values);
            toast.success(response.data.message);
            reset(EMPTY_FORM); // clear the fields
        } catch (error) {
            setServerErrors(error, setError);
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack gap="4">
                <Field.Root invalid={!!errors.current_password} required>
                    <Field.Label>
                        Current password <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                        type="password"
                        autoComplete="current-password"
                        {...register('current_password', { required: 'Enter your current password.' })}
                    />
                    <Field.ErrorText>{errors.current_password?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.password} required>
                    <Field.Label>
                        New password <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                        type="password"
                        autoComplete="new-password"
                        {...register('password', {
                            required: 'Enter a new password.',
                            minLength: { value: 8, message: 'Use at least 8 characters.' },
                        })}
                    />
                    <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.password_confirmation} required>
                    <Field.Label>
                        Confirm new password <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                        type="password"
                        autoComplete="new-password"
                        {...register('password_confirmation', {
                            required: 'Enter the new password again.',
                            validate: (value) =>
                                value === getValues('password') || 'Passwords do not match.',
                        })}
                    />
                    <Field.ErrorText>{errors.password_confirmation?.message}</Field.ErrorText>
                </Field.Root>

                <Button type="submit" colorPalette="brand" loading={isSubmitting} alignSelf="start">
                    Change password
                </Button>
            </Stack>
        </form>
    );
}
