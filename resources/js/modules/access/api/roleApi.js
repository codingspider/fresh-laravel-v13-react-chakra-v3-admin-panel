import api from '@/api/axios';

// All Role endpoints in one place. Pages never call axios directly.
const roleApi = {
    // { search, page, per_page, sort_by, sort_dir }
    getAll: (params) => api.get('/access/roles', { params }),
    // All roles as [{ id, name }] — for dropdowns and checkboxes
    getOptions: () => api.get('/access/roles/options'),
    getOne: (id) => api.get(`/access/roles/${id}`),
    // { name, permissions: ['access.users.view', ...] }
    create: (data) => api.post('/access/roles', data),
    update: (id, data) => api.put(`/access/roles/${id}`, data),
    remove: (id) => api.delete(`/access/roles/${id}`),
};

export default roleApi;
