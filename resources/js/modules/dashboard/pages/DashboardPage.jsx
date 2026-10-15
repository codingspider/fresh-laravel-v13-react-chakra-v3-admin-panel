import { Box, Text } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import PageHeader from '@/components/common/PageHeader';

// Placeholder — the real dashboard is built in Step 11 (Dashboard module)
export default function DashboardPage() {
    const user = useSelector((state) => state.auth.user);

    return (
        <>
            <PageHeader title="Dashboard" description={`Welcome, ${user?.name}.`} />
            <Box bg="app.card" borderWidth="1px" borderColor="app.border" rounded="lg" p="6">
                <Text color="app.muted">Counts and charts will appear here as modules are built.</Text>
            </Box>
        </>
    );
}
