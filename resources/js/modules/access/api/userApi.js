import api from '@/api/axios';

// All User endpoints in one place. Pages never call axios directly.
const userApi = {
    // { search, role, status, page, per_page, sort_by, sort_dir }
    getAll: (params) => api.get('/access/users', { params }),
    getOne: (id) => api.get(`/access/users/${id}`),
    // { name, email, phone, password, password_confirmation, is_active, roles: [] }
    create: (data) => api.post('/access/users', data),
    update: (id, data) => api.put(`/access/users/${id}`, data),
    remove: (id) => api.delete(`/access/users/${id}`),
};

export default userApi;
