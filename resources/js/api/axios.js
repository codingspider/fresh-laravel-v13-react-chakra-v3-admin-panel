import axios from 'axios';

// Pages anyone can open without logging in
const GUEST_PAGES = ['/login', '/forgot-password', '/reset-password'];

// One axios instance for the whole app. All API calls use it.
const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true, // send the HttpOnly session cookie
    withXSRFToken: true, // send the XSRF-TOKEN cookie back as a header (CSRF protection)
    headers: { Accept: 'application/json' },
});

// If the session expired (401), send the user to the login page.
// A request can opt out with { skipAuthRedirect: true } (used by /auth/me on app start).
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isUnauthorized = error.response?.status === 401;
        const onGuestPage = GUEST_PAGES.includes(window.location.pathname);

        if (isUnauthorized && !error.config?.skipAuthRedirect && !onGuestPage) {
            window.location.href = '/login';
        }

        return Promise.reject(error);
    },
);

// Ask Laravel to set the CSRF cookie. Call this before login / forgot / reset password.
export const getCsrfCookie = () =>
    axios.get('/sanctum/csrf-cookie', { withCredentials: true });

export default api;
