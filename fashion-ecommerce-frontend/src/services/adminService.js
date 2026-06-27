import { adminApi } from './api';

export const adminService = {
    getDashboard: () => adminApi.get('/admin/dashboard/overview'),
    getTopProducts: () => adminApi.get('/admin/dashboard/top-products'),
    getOrders: (params) => adminApi.get('/admin/orders', { params }),
    getOrderDetail: (id) => adminApi.get(`/admin/orders/${id}`),
    updateOrderStatus: (id, status) => adminApi.put(`/admin/orders/${id}/status`, { status }),
    updateOrderPaymentStatus: (id, paymentStatus) => adminApi.put(`/admin/orders/${id}/payment-status`, { paymentStatus }),
    updateOrderShipping: (id, data) => adminApi.put(`/admin/orders/${id}/shipping`, data),
    updateOrderReturnStatus: (id, data) => adminApi.put(`/admin/orders/${id}/return`, data),
    getUsers: () => adminApi.get('/admin/users'),
    toggleUserBlock: (id) => adminApi.patch(`/admin/users/${id}/toggle-block`),
    updateUser: (id, data) => adminApi.patch(`/admin/users/${id}`, data),
    deleteUser: (id) => adminApi.delete(`/admin/users/${id}`),
    getCoupons: () => adminApi.get('/admin/coupons'),
    createCoupon: (data) => adminApi.post('/admin/coupons', data),
    updateCoupon: (id, data) => adminApi.put(`/admin/coupons/${id}`, data),
    deleteCoupon: (id) => adminApi.delete(`/admin/coupons/${id}`),
    askChatbot: (message) => adminApi.post('/admin/chatbot/ask', { message }),
    getCategories: () => adminApi.get('/admin/categories'),
    getCategoryById: (id) => adminApi.get(`/admin/categories/${id}`),
    createCategory: (data) => adminApi.post('/admin/categories', data),
    updateCategory: (id, data) => adminApi.put(`/admin/categories/${id}`, data),
    deleteCategory: (id) => adminApi.delete(`/admin/categories/${id}`),
    getProducts: (params) => adminApi.get('/products', { params }),
    createProduct: (data) => adminApi.post('/products', data),
    updateProduct: (id, data) => adminApi.put(`/products/${id}`, data),
    deleteProduct: (id) => adminApi.delete(`/products/${id}`),
    uploadProductImages: (files) => {
        const formData = new FormData();
        files.forEach((file) => formData.append('images', file));
        return adminApi.post('/products/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    exportProducts: (params) => adminApi.get('/admin/products/export', { params, responseType: 'blob' }),
    exportOrders: (params) => adminApi.get('/admin/orders/export', { params, responseType: 'blob' }),
    exportDashboardRevenue: () => adminApi.get('/admin/dashboard/export', { responseType: 'blob' }),
    getEvents: (params) => adminApi.get('/admin/events', { params }),
    getEventDetail: (id) => adminApi.get(`/admin/events/${id}`),
    createEvent: (data) => adminApi.post('/admin/events', data),
    updateEvent: (id, data) => adminApi.put(`/admin/events/${id}`, data),
    deleteEvent: (id) => adminApi.delete(`/admin/events/${id}`),
    getContacts: () => adminApi.get('/admin/contact'),
    updateContactStatus: (id, status) => adminApi.put(`/admin/contact/${id}/status`, { status }),
    deleteContact: (id) => adminApi.delete(`/admin/contact/${id}`),
};
