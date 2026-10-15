import { useEffect, useState } from 'react';
import { Alert, Button, Center, Spinner, Text } from '@chakra-ui/react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LuArrowLeft } from 'react-icons/lu';
import Card from '@/components/common/Card';
import PageHeader from '@/components/common/PageHeader';
import { getErrorMessage, setServerErrors } from '@/utils/errors';
import { toast } from '@/utils/toast';
import roleApi from '../api/roleApi';
import RoleForm from '../components/RoleForm';

export default function RoleEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Load the role (with its permission names) to edit
    useEffect(() => {
        roleApi
            .getOne(id)
            .then((response) => setRole(response.data.data))
            .catch((err) => setError(getErrorMessage(err)))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async (values, setFormError) => {
        try {
            const response = await roleApi.update(id, values);
            toast.success(response.data.message);
            navigate('/access/roles');
        } catch (err) {
            setServerErrors(err, setFormError);
            toast.error(getErrorMessage(err));
        }
    };

    return (
        <>
            <PageHeader
                title={role ? `Edit role: ${role.name}` : 'Edit role'}
                actions={
                    <Button asChild variant="outline" size="sm">
                        <Link to="/access/roles">
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

                {!loading && role?.is_protected && (
                    <Alert.Root status="info">
                        <Alert.Indicator />
                        <Alert.Title>The super-admin role has every permission and cannot be changed.</Alert.Title>
                    </Alert.Root>
                )}

                {!loading && role && !role.is_protected && (
                    <RoleForm
                        submitLabel="Save changes"
                        onSubmit={handleSubmit}
                        defaultValues={{ name: role.name, permissions: role.permissions }}
                    />
                )}
            </Card>
        </>
    );
}
