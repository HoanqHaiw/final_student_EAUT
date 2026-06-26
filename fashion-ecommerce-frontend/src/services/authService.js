import api from './api';

// Auth APIs
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    verifyEmail: (data) => api.post('/auth/verify-email', data),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Contact APIs
export const contactAPI = {
    send: (data) => api.post('/contact', data),
};

// Product APIs
export const productAPI = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

// Category APIs
export const categoryAPI = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

// Cart APIs
export const cartAPI = {
    get: () => api.get('/cart'),
    add: (data) => api.post('/cart', data),
    update: (id, data) => api.put(`/cart/${id}`, data),
    remove: (id) => api.delete(`/cart/${id}`),
    clear: () => api.delete('/cart'),
};

// Order APIs
export const orderAPI = {
    create: (data) => api.post('/orders', data),
    getMyOrders: () => api.get('/orders/my'),
    getById: (id) => api.get(`/orders/${id}`),
    cancel: (id) => api.put(`/orders/${id}/cancel`),
};

// Payment APIs
export const paymentAPI = {
    checkout: (orderId, data) => api.post(`/payments/checkout/${orderId}`, data),
    verifySession: (sessionId) => api.post('/payments/verify-session', { sessionId }),
};

// Coupon APIs
export const couponAPI = {
    validate: (code, totalPrice) => api.post('/coupons/validate', { code, totalPrice }),
    getAll: () => api.get('/coupons'),
};

// User APIs
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    changePassword: (data) => api.post('/users/change-password', data),
};

// Chatbot APIs
export const chatbotAPI = {
    chat: (message) => api.post('/chatbot/ask', { message }),
};

// Review APIs
export const reviewAPI = {
    getByProduct: (productId) => api.get(`/reviews/${productId}`),
    create: (productId, data) => api.post(`/reviews/${productId}`, data),
};

// Admin APIs
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard/overview'),
    getOrders: (params) => api.get('/admin/orders', { params }),
    getOrderDetail: (id) => api.get(`/admin/orders/${id}`),
    updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
    getUsers: () => api.get('/admin/users'),
    toggleUserBlock: (id) => api.patch(`/admin/users/${id}/toggle-block`),
    getCoupons: () => api.get('/admin/coupons'),
    createCoupon: (data) => api.post('/admin/coupons', data),
    updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
    deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
    askChatbot: (message) => api.post('/admin/chatbot/ask', { message }),
};

export const adminCategoryAPI = {
    getAll: () => api.get('/admin/categories'),
    getById: (id) => api.get(`/admin/categories/${id}`),
    create: (data) => api.post('/admin/categories', data),
    update: (id, data) => api.put(`/admin/categories/${id}`, data),
    delete: (id) => api.delete(`/admin/categories/${id}`),
};

export const adminProductAPI = {
    getAll: (params) => api.get('/products', { params }),
    create: (data) => api.post('/products', data),
    delete: (id) => api.delete(`/products/${id}`),
};

