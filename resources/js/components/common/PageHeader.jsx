import { Flex, Heading, Text } from '@chakra-ui/react';
import usePageTitle from '@/hooks/usePageTitle';

/*
 * Title at the top of every page, with optional buttons on the right.
 * It also sets the browser tab title (e.g. "Users | Amar Team").
 * Pass documentTitle if the tab should show something different from the heading.
 */
export default function PageHeader({ title, description, actions, documentTitle }) {
    usePageTitle(documentTitle ?? title);

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
