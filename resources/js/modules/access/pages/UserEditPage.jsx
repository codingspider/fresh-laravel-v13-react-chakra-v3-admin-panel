import { useEffect, useState } from 'react';
import { Button, Center, Spinner, Text } from '@chakra-ui/react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LuArrowLeft } from 'react-icons/lu';
import Card from '@/components/common/Card';
import PageHeader from '@/components/common/PageHeader';
import { getErrorMessage, setServerErrors } from '@/utils/errors';
import { toast } from '@/utils/toast';
import userApi from '../api/userApi';
import UserForm from '../components/UserForm';

export default function UserEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Load the user to edit
    useEffect(() => {
        userApi
            .getOne(id)
            .then((response) => setUser(response.data.data))
            .catch((err) => setError(getErrorMessage(err)))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async (values, setFormError) => {
        try {
            const response = await userApi.update(id, values);
            toast.success(response.data.message);
            navigate('/access/users');
        } catch (err) {
            setServerErrors(err, setFormError);
            toast.error(getErrorMessage(err));
        }
    };

    return (
        <>
            <PageHeader
                title={user ? `Edit ${user.name}` : 'Edit user'}
                actions={
                    <Button asChild variant="outline" size="sm">
                        <Link to="/access/users">
                            <LuArrowLeft /> Back
                        </Link>
                    </Button>
                }
            />
            <Card>
                {loading && (
                    <Center py="10">
                        <Spinner color="brand.solid" />
                    </Center>
                )}
                {!loading && error && <Text color="app.muted">{error}</Text>}
                {!loading && user && (
                    <UserForm
                        isEdit
                        submitLabel="Save changes"
                        onSubmit={handleSubmit}
                        defaultValues={{
                            name: user.name,
                            email: user.email,
                            phone: user.phone || '',
                            is_active: user.is_active,
                            roles: user.roles.map((role) => role.name),
                        }}
                    />
                )}
            </Card>
        </>
    );
}
