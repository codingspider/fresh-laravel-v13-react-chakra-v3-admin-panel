import { Button, Input, NativeSelect } from '@chakra-ui/react';
import { LuRotateCcw } from 'react-icons/lu';

/*
 * Filters built from a config list. Supported types: "select" and "date".
 *
 * const filters = [
 *   { key: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'active' }] },
 *   { key: 'joined_from', label: 'Joined from', type: 'date' },
 * ];
 */
export default function TableFilters({ filters, params, onParamsChange }) {
    if (filters.length === 0) return null;

    const hasActiveFilter = filters.some((filter) => params[filter.key]);

    // Clear every filter at once
    const resetFilters = () => {
        const cleared = {};
        filters.forEach((filter) => {
            cleared[filter.key] = '';
        });
        onParamsChange(cleared);
    };

    return (
        <>
            {filters.map((filter) => {
                const value = params[filter.key] || '';
                const handleChange = (event) => onParamsChange({ [filter.key]: event.target.value });

                if (filter.type === 'date') {
                    return (
                        <Input
                            key={filter.key}
                            type="date"
                            size="sm"
                            w="auto"
                            aria-label={filter.label}
                            title={filter.label}
                            value={value}
                            onChange={handleChange}
                        />
                    );
                }

                // type "select"
                return (
                    <NativeSelect.Root key={filter.key} size="sm" w={{ base: 'full', sm: '44' }}>
                        <NativeSelect.Field aria-label={filter.label} value={value} onChange={handleChange}>
                            <option value="">All {filter.label.toLowerCase()}</option>
                            {filter.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                );
            })}

            {hasActiveFilter && (
                <Button size="sm" variant="ghost" onClick={resetFilters}>
                    <LuRotateCcw /> Reset
                </Button>
            )}
        </>
    );
}
