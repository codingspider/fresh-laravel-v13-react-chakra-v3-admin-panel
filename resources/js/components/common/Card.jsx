import { Box, Flex, Heading, Text } from '@chakra-ui/react';

// A white (dark mode: dark gray) box with an optional title — used for forms and sections
export default function Card({ title, description, actions, children, ...props }) {
    return (
        <Box bg="app.card" borderWidth="1px" borderColor="app.border" rounded="lg" p={{ base: '4', md: '6' }} {...props}>
            {(title || actions) && (
                <Flex justify="space-between" align="start" gap="3" mb="4" wrap="wrap">
                    <div>
                        {title && <Heading size="md">{title}</Heading>}
                        {description && (
                            <Text color="app.muted" fontSize="sm" mt="1">
                                {description}
                            </Text>
                        )}
                    </div>
                    {actions}
                </Flex>
            )}
            {children}
        </Box>
    );
}
