import { useSearchParams } from 'react-router-dom';

/*
 * Keeps table state (page, search, filters, sort) in the URL:
 *   /access/users?page=2&search=rahim&status=active&sort_by=name&sort_dir=asc
 * So refresh, the back button and shared links keep the same view.
 *
 * const { params, setParams, queryKey } = useTableParams();
 */
export default function useTableParams(defaults = {}) {
    const [searchParams, setSearchParams] = useSearchParams();

    const params = {
        page: 1,
        per_page: 15,
        ...defaults,
        ...Object.fromEntries(searchParams),
    };
    params.page = Number(params.page);
    params.per_page = Number(params.per_page);

    const setParams = (changes) => {
        const next = { ...params, ...changes };

        // Search, filter, sort or per-page changed -> start again from page 1
        if (!('page' in changes)) next.page = 1;

        // Remove empty values so the URL stays clean
        Object.keys(next).forEach((key) => {
            if (next[key] === '' || next[key] === null || next[key] === undefined) {
                delete next[key];
            }
        });

        setSearchParams(next);
    };

    // queryKey changes whenever the URL params change — use it in useEffect to reload data
    return { params, setParams, queryKey: searchParams.toString() };
}
