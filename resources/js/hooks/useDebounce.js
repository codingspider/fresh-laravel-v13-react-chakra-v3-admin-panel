import { useEffect, useState } from 'react';

/*
 * Returns the value only after it stopped changing for `delay` ms.
 * Used for search boxes so we do not call the API on every key press.
 *
 * const debouncedSearch = useDebounce(search, 400);
 */
export default function useDebounce(value, delay = 400) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
