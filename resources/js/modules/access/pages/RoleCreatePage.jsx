import { Button } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { LuArrowLeft } from 'react-icons/lu';
import Card from '@/components/common/Card';
import PageHeader from '@/components/common/PageHeader';
import { getErrorMessage, setServerErrors } from '@/utils/errors';
import { toast } from '@/utils/toast';
import roleApi from '../api/roleApi';
import RoleForm from '../components/RoleForm';

export default function RoleCreatePage() {
    const navigate = useNavigate();

    const handleSubmit = async (values, setError) => {
        try {
            const response = await roleApi.create(values);
            toast.success(response.data.message);
            navigate('/access/roles');
        } catch (error) {
            setServerErrors(error, setError);
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <>
            <PageHeader
                title="Add role"
                actions={
                    <Button asChild variant="outline" size="sm">
                        <Link to="/access/roles">
                            <LuArrowLeft /> Back
                        </Link>
                    </Button>
                }
            />
            <Card>
                <RoleForm onSubmit={handleSubmit} submitLabel="Create role" />
            </Card>
        </>
    );
}
