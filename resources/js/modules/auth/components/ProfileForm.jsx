import { Button, Field, Input, Stack } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { getErrorMessage, setServerErrors } from '@/utils/errors';
import { toast } from '@/utils/toast';
import authApi from '../api/authApi';
import { setUser } from '../store/authSlice';

// Edit your own name, email and phone
export default function ProfileForm() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
        },
    });

    const onSubmit = async (values) => {
        try {
            const response = await authApi.updateProfile(values);
            dispatch(setUser(response.data.data)); // update the name in the header too
            toast.success(response.data.message);
        } catch (error) {
            setServerErrors(error, setError);
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack gap="4">
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
                    <Field.ErrorText>{errors.phone?.message}</Field.ErrorText>
                </Field.Root>

                <Button type="submit" colorPalette="brand" loading={isSubmitting} alignSelf="start">
                    Save profile
                </Button>
            </Stack>
        </form>
    );
}
