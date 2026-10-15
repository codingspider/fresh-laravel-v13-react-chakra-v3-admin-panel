import { Button, Field, Heading, Input, Stack, Text } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getErrorMessage, setServerErrors } from '@/utils/errors';
import { toast } from '@/utils/toast';
import authApi from '../api/authApi';

// Opened from the email link: /reset-password?token=...&email=...
export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';

    const {
        register,
        handleSubmit,
        setError,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues: { password: '', password_confirmation: '' } });

    const onSubmit = async (values) => {
        try {
            const response = await authApi.resetPassword({ ...values, token, email });
            toast.success(response.data.message);
            navigate('/login', { replace: true });
        } catch (error) {
            setServerErrors(error, setError);
            toast.error(getErrorMessage(error)); // e.g. "This password reset token is invalid."
        }
    };

    if (!token || !email) {
        return <Text color="app.muted">This reset link is not valid. Please ask for a new one.</Text>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack gap="5">
                <div>
                    <Heading size="lg">Set a new password</Heading>
                    <Text color="app.muted" fontSize="sm">
                        For {email}
                    </Text>
                </div>

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
                            required: 'Enter the password again.',
                            validate: (value) =>
                                value === getValues('password') || 'Passwords do not match.',
                        })}
                    />
                    <Field.ErrorText>{errors.password_confirmation?.message}</Field.ErrorText>
                </Field.Root>

                <Button type="submit" colorPalette="brand" loading={isSubmitting} w="full">
                    Save new password
                </Button>
            </Stack>
        </form>
    );
}
