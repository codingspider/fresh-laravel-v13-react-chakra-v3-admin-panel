import { Box, Button, Spinner, Table, Text } from '@chakra-ui/react';
import { flexRender, rowSortingFeature, tableFeatures, useTable } from '@tanstack/react-table';
import { LuArrowDown, LuArrowUp, LuArrowUpDown } from 'react-icons/lu';
import TablePagination from './TablePagination';
import TableToolbar from './TableToolbar';

/*
 * THE table for every list page (TanStack Table v9 + Chakra UI).
 * The API does the paging, searching, filtering and sorting — this component only shows
 * the current page. Table state lives in the URL (see hooks/useTableParams.js).
 * See CLAUDE.md section 11.8 for how to use it.
 */

// Kept outside the component so they never change between renders (TanStack needs this)
const features = tableFeatures({ rowSortingFeature });
const defaultColumn = { enableSorting: false }; // sorting is opt-in per column
const EMPTY_ROWS = [];

export default function DataTable({
    columns,
    data = EMPTY_ROWS,
    meta,
    loading = false,
    error = null,
    onRetry,
    params,
    onParamsChange,
    filters = [],
    searchPlaceholder = 'Search…',
    actions,
    emptyText = 'No records found.',
}) {
    // Current sort comes from the URL params
    const sorting = params.sort_by
        ? [{ id: params.sort_by, desc: params.sort_dir === 'desc' }]
        : [];

    // When a header is clicked, put the new sort in the URL (the page then reloads data)
    const handleSortingChange = (updater) => {
        const next = typeof updater === 'function' ? updater(sorting) : updater;
        const sort = next[0];

        onParamsChange({
            sort_by: sort ? sort.id : '',
            sort_dir: sort ? (sort.desc ? 'desc' : 'asc') : '',
        });
    };

    const table = useTable({
        features,
        columns,
        data,
        defaultColumn,
        manualSorting: true, // the API sorts
        state: { sorting },
        onSortingChange: handleSortingChange,
    });

    const columnCount = columns.length;
    const showRows = !loading && !error && data.length > 0;

    return (
        <Box bg="app.card" borderWidth="1px" borderColor="app.border" rounded="lg">
            <TableToolbar
                params={params}
                onParamsChange={onParamsChange}
                filters={filters}
                searchPlaceholder={searchPlaceholder}
                actions={actions}
            />

            <Box overflowX="auto">
                <Table.Root size="sm" interactive={showRows}>
                    <Table.Header>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Table.Row key={headerGroup.id} bg="app.bg">
                                {headerGroup.headers.map((header) => {
                                    const canSort = header.column.getCanSort();
                                    const sorted = header.column.getIsSorted();

                                    return (
                                        <Table.ColumnHeader
                                            key={header.id}
                                            whiteSpace="nowrap"
                                            cursor={canSort ? 'pointer' : 'default'}
                                            userSelect="none"
                                            onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {canSort && (
                                                <Box as="span" display="inline-block" ml="1" verticalAlign="middle" color="app.muted">
                                                    {sorted === 'asc' && <LuArrowUp />}
                                                    {sorted === 'desc' && <LuArrowDown />}
                                                    {!sorted && <LuArrowUpDown />}
                                                </Box>
                                            )}
                                        </Table.ColumnHeader>
                                    );
                                })}
                            </Table.Row>
                        ))}
                    </Table.Header>

                    <Table.Body>
                        {loading && (
                            <Table.Row>
                                <Table.Cell colSpan={columnCount} textAlign="center" py="10">
                                    <Spinner color="brand.solid" />
                                </Table.Cell>
                            </Table.Row>
                        )}

                        {!loading && error && (
                            <Table.Row>
                                <Table.Cell colSpan={columnCount} textAlign="center" py="10">
                                    <Text color="app.muted" mb="3">
                                        {error}
                                    </Text>
                                    {onRetry && (
                                        <Button size="sm" variant="outline" onClick={onRetry}>
                                            Retry
                                        </Button>
                                    )}
                                </Table.Cell>
                            </Table.Row>
                        )}

                        {!loading && !error && data.length === 0 && (
                            <Table.Row>
                                <Table.Cell colSpan={columnCount} textAlign="center" py="10" color="app.muted">
                                    {emptyText}
                                </Table.Cell>
                            </Table.Row>
                        )}

                        {showRows &&
                            table.getRowModel().rows.map((row) => (
                                <Table.Row key={row.id}>
                                    {row.getAllCells().map((cell) => (
                                        <Table.Cell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </Table.Cell>
                                    ))}
                                </Table.Row>
                            ))}
                    </Table.Body>
                </Table.Root>
            </Box>

            <TablePagination meta={meta} params={params} onParamsChange={onParamsChange} />
        </Box>
    );
}
