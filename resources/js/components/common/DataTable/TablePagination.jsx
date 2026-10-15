import { Flex, HStack, IconButton, NativeSelect, Text } from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

const PER_PAGE_OPTIONS = [15, 25, 50, 100];

// Bottom of the table: "Showing 1–15 of 125", per-page select, previous / next
export default function TablePagination({ meta, params, onParamsChange }) {
    if (!meta || meta.total === 0) return null;

    const isFirstPage = meta.current_page <= 1;
    const isLastPage = meta.current_page >= meta.last_page;

    return (
        <Flex
            px="3"
            py="2"
            gap="3"
            wrap="wrap"
            align="center"
            justify="space-between"
            borderTopWidth="1px"
            borderColor="app.border"
            fontSize="sm"
        >
            <Text color="app.muted">
                Showing {meta.from}–{meta.to} of {meta.total}
            </Text>

            <HStack gap="3">
                <HStack gap="2">
                    <Text color="app.muted" display={{ base: 'none', sm: 'block' }}>
                        Rows
                    </Text>
                    <NativeSelect.Root size="xs" w="20">
                        <NativeSelect.Field
                            aria-label="Rows per page"
                            value={params.per_page}
                            onChange={(event) => onParamsChange({ per_page: Number(event.target.value) })}
                        >
                            {PER_PAGE_OPTIONS.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                </HStack>

                <HStack gap="1">
                    <IconButton
                        size="xs"
                        variant="outline"
                        aria-label="Previous page"
                        disabled={isFirstPage}
                        onClick={() => onParamsChange({ page: meta.current_page - 1 })}
                    >
                        <LuChevronLeft />
                    </IconButton>
                    <Text px="2" whiteSpace="nowrap">
                        {meta.current_page} / {meta.last_page}
                    </Text>
                    <IconButton
                        size="xs"
                        variant="outline"
                        aria-label="Next page"
                        disabled={isLastPage}
                        onClick={() => onParamsChange({ page: meta.current_page + 1 })}
                    >
                        <LuChevronRight />
                    </IconButton>
                </HStack>
            </HStack>
        </Flex>
    );
}
