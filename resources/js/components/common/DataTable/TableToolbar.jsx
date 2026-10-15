import { Flex, HStack } from '@chakra-ui/react';
import TableFilters from './TableFilters';
import TableSearch from './TableSearch';

// Top of the table: search box + filters on the left, action buttons on the right
export default function TableToolbar({ params, onParamsChange, filters, searchPlaceholder, actions }) {
    const hasSearch = searchPlaceholder !== null;

    if (!hasSearch && filters.length === 0 && !actions) {
        return null;
    }

    return (
        <Flex
            p="3"
            gap="3"
            wrap="wrap"
            align="center"
            justify="space-between"
            borderBottomWidth="1px"
            borderColor="app.border"
        >
            <Flex gap="3" wrap="wrap" align="center" flex="1">
                {hasSearch && (
                    <TableSearch
                        value={params.search || ''}
                        placeholder={searchPlaceholder}
                        onChange={(search) => onParamsChange({ search })}
                    />
                )}
                <TableFilters filters={filters} params={params} onParamsChange={onParamsChange} />
            </Flex>

            {actions && <HStack gap="2">{actions}</HStack>}
        </Flex>
    );
}
