import { Box, Heading, SimpleGrid } from '@chakra-ui/react';
import PageHeader from '@/components/common/PageHeader';
import ChangePasswordForm from '../components/ChangePasswordForm';
import ProfileForm from '../components/ProfileForm';

// A white card with a title
function Card({ title, children }) {
    return (
        <Box bg="app.card" borderWidth="1px" borderColor="app.border" rounded="lg" p="6">
            <Heading size="md" mb="4">
                {title}
            </Heading>
            {children}
        </Box>
    );
}

export default function ProfilePage() {
    return (
        <>
            <PageHeader title="My profile" description="Your account details and password." />

            <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
                <Card title="Profile">
                    <ProfileForm />
                </Card>
                <Card title="Change password">
                    <ChangePasswordForm />
                </Card>
            </SimpleGrid>
        </>
    );
}
