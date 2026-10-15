import { useState } from 'react';
import { Alert, Button, Field, Heading, Input, Link as ChakraLink, Stack, Text } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { getErrorMessage, setServerErrors } from '@/utils/errors';
import { toast } from '@/utils/toast';
import authApi from '../api/authApi';
import usePageTitle from '@/hooks/usePageTitle';

export default function ForgotPasswordPage() {
    usePageTitle('Forgot password');
    const [sentMessage, setSentMessage] = useState('');

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues: { email: '' } });

    // Ask the server to email a reset link
    const onSubmit = async (values) => {
        try {
            const response = await authApi.forgotPassword(values);
            setSentMessage(response.data.message);
        } catch (error) {
            setServerErrors(error, setError);
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack gap="5">
                <div>
                    <Heading size="lg">Forgot password</Heading>
                    <Text color="app.muted" fontSize="sm">
                        We will email you a link to set a new password.
                    </Text>
                </div>

                {sentMessage && (
                    <Alert.Root status="success">
                        <Alert.Indicator />
                        <Alert.Title>{sentMessage}</Alert.Title>
                    </Alert.Root>
                )}

                <Field.Root invalid={!!errors.email} required>
                    <Field.Label>
                        Email <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                        type="email"
                        autoComplete="email"
                        {...register('email', { required: 'Enter your email.' })}
                    />
                    <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                </Field.Root>

                <Button type="submit" colorPalette="brand" loading={isSubmitting} w="full">
                    Send reset link
                </Button>

                <ChakraLink asChild fontSize="sm" color="brand.fg" alignSelf="center">
                    <Link to="/login">Back to login</Link>
                </ChakraLink>
            </Stack>
        </form>
    );
}
