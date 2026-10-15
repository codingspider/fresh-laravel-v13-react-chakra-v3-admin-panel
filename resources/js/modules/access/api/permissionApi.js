import api from '@/api/axios';

const permissionApi = {
    // [{ module, label, groups: [{ key, label, permissions: [{ name, action, label }] }] }]
    getGrouped: () => api.get('/access/permissions'),
};

export default permissionApi;
