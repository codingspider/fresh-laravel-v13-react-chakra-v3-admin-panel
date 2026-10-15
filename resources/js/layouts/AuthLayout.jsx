import { Box, Center, Heading, Stack, Text } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { ColorModeButton } from '@/components/ui/color-mode';

// Layout for login / forgot / reset password: a centered card
export default function AuthLayout() {
    return (
        <Center minH="100vh" px="4" py="10" position="relative">
            <Box position="absolute" top="4" right="4">
                <ColorModeButton />
            </Box>

            <Stack w="full" maxW="md" gap="6">
                <Stack align="center" gap="1">
                    <Heading size="2xl" color="brand.fg">
                        Amar Team
                    </Heading>
                    <Text color="app.muted" fontSize="sm">
                        MotoTrack staff & operations portal
                    </Text>
                </Stack>

                <Box
                    bg="app.card"
                    borderWidth="1px"
                    borderColor="app.border"
                    rounded="xl"
                    shadow="sm"
                    p={{ base: '6', md: '8' }}
                >
                    <Outlet />
                </Box>
            </Stack>
        </Center>
    );
}
