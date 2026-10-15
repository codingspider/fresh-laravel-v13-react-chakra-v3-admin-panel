import { useEffect } from 'react';

// App name from .env (VITE_APP_NAME="${APP_NAME}"), with a fallback
const APP_NAME = import.meta.env.VITE_APP_NAME || 'Amar Team';

/*
 * Sets the browser tab title: "Users | Amar Team".
 * PageHeader calls this automatically, so most pages need nothing extra.
 *
 * usePageTitle('Log in');
 */
export default function usePageTitle(title) {
    useEffect(() => {
        document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
    }, [title]);
}
