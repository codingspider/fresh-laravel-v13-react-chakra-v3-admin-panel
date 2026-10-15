import api, { getCsrfCookie } from '@/api/axios';

// All Auth endpoints in one place. Pages never call axios directly.
const authApi = {
    // { login, password, remember } — no device_name on the web, so Laravel uses a cookie
    login: async (data) => {
        await getCsrfCookie();
        return api.post('/auth/login', data);
    },

    logout: () => api.post('/auth/logout'),

    // Who is logged in? Returns 401 for guests (no redirect, we handle it in authSlice)
    me: () => api.get('/auth/me', { skipAuthRedirect: true }),

    // { email }
    forgotPassword: async (data) => {
        await getCsrfCookie();
        return api.post('/auth/forgot-password', data);
    },

    // { token, email, password, password_confirmation }
    resetPassword: async (data) => {
        await getCsrfCookie();
        return api.post('/auth/reset-password', data);
    },

    // { name, email, phone }
    updateProfile: (data) => api.put('/auth/profile', data),

    // { current_password, password, password_confirmation }
    changePassword: (data) => api.put('/auth/change-password', data),
};

export default authApi;
