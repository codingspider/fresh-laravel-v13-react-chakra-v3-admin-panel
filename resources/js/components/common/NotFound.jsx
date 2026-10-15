import { Button, Center, Heading, Stack, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import usePageTitle from '@/hooks/usePageTitle';

// Shown for any URL that has no page
export default function NotFound() {
    usePageTitle('Page not found');
    return (
        <Center minH="100vh" px="4">
            <Stack align="center" gap="3" textAlign="center">
                <Heading size="4xl" color="brand.fg">
                    404
                </Heading>
                <Text color="app.muted">This page does not exist.</Text>
                <Button asChild colorPalette="brand">
                    <Link to="/">Go home</Link>
                </Button>
            </Stack>
        </Center>
    );
}
