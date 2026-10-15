import { Button, Center, Heading, Stack, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

// Shown when the user opens a page they have no permission for
export default function Forbidden() {
    return (
        <Center py="20" px="4">
            <Stack align="center" gap="3" textAlign="center">
                <Heading size="3xl" color="brand.fg">
                    403
                </Heading>
                <Text color="app.muted">You do not have permission to open this page.</Text>
                <Button asChild variant="outline">
                    <Link to="/dashboard">Back to dashboard</Link>
                </Button>
            </Stack>
        </Center>
    );
}
