import { Flex, Heading, Text } from '@chakra-ui/react';

// Title at the top of every page, with optional buttons on the right
export default function PageHeader({ title, description, actions }) {
    return (
        <Flex
            justify="space-between"
            align={{ base: 'start', md: 'center' }}
            direction={{ base: 'column', md: 'row' }}
            gap="3"
            mb="6"
        >
            <div>
                <Heading size="xl">{title}</Heading>
                {description && (
                    <Text color="app.muted" fontSize="sm" mt="1">
                        {description}
                    </Text>
                )}
            </div>
            {actions}
        </Flex>
    );
}
