import { Button } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { LuArrowLeft } from 'react-icons/lu';
import Card from '@/components/common/Card';
import PageHeader from '@/components/common/PageHeader';
import { getErrorMessage, setServerErrors } from '@/utils/errors';
import { toast } from '@/utils/toast';
import userApi from '../api/userApi';
import UserForm from '../components/UserForm';

export default function UserCreatePage() {
    const navigate = useNavigate();

    const handleSubmit = async (values, setError) => {
        try {
            const response = await userApi.create(values);
            toast.success(response.data.message);
            navigate('/access/users');
        } catch (error) {
            setServerErrors(error, setError);
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <>
            <PageHeader
                title="Add user"
                actions={
                    <Button asChild variant="outline" size="sm">
                        <Link to="/access/users">
                            <LuArrowLeft /> Back
                        </Link>
                    </Button>
                }
            />
            <Card>
                <UserForm onSubmit={handleSubmit} submitLabel="Create user" />
            </Card>
        </>
    );
}
