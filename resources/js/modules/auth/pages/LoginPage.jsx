import { Button, Checkbox, Field, Heading, Input, Link as ChakraLink, Stack, Text } from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage, setServerErrors } from '@/utils/errors';
import { toast } from '@/utils/toast';
import authApi from '../api/authApi';
import { setUser } from '../store/authSlice';
import usePageTitle from '@/hooks/usePageTitle';

export default function LoginPage() {
    usePageTitle('Log in');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const {
        register,
        control,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues: { login: '', password: '', remember: false } });

    // Send email/phone + password. Laravel sets an HttpOnly session cookie.
    const onSubmit = async (values) => {
        try {
            const response = await authApi.login(values);
            dispatch(setUser(response.data.data.user));
            toast.success(response.data.message);

            // Go back to the page the user wanted, or the dashboard
            navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
        } catch (error) {
            setServerErrors(error, setError);
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack gap="5">
                <div>
                    <Heading size="lg">Log in</Heading>
                    <Text color="app.muted" fontSize="sm">
                        Use your email or phone number.
                    </Text>
                </div>

                <Field.Root invalid={!!errors.login} required>
                    <Field.Label>
                        Email or phone <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                        autoComplete="username"
                        placeholder="you@example.com or 01XXXXXXXXX"
                        {...register('login', { required: 'Enter your email or phone number.' })}
                    />
                    <Field.ErrorText>{errors.login?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.password} required>
                    <Field.Label>
                        Password <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                        type="password"
                        autoComplete="current-password"
                        {...register('password', { required: 'Enter your password.' })}
                    />
                    <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                </Field.Root>

                <Stack direction="row" justify="space-between" align="center">
                    <Controller
                        name="remember"
                        control={control}
                        render={({ field }) => (
                            <Checkbox.Root
                                checked={field.value}
                                onCheckedChange={({ checked }) => field.onChange(checked === true)}
                                size="sm"
                            >
                                <Checkbox.HiddenInput />
                                <Checkbox.Control />
                                <Checkbox.Label>Remember me</Checkbox.Label>
                            </Checkbox.Root>
                        )}
                    />

                    <ChakraLink asChild fontSize="sm" color="brand.fg">
                        <Link to="/forgot-password">Forgot password?</Link>
                    </ChakraLink>
                </Stack>

                <Button type="submit" colorPalette="brand" loading={isSubmitting} w="full">
                    Log in
                </Button>
            </Stack>
        </form>
    );
}
