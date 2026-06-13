import { createSlice } from '@reduxjs/toolkit';

// Admin session uses SEPARATE localStorage keys (admin_token, admin_user)
// so it never conflicts with the user session (token, user)
const initialState = {
    user: localStorage.getItem('admin_user') ? JSON.parse(localStorage.getItem('admin_user')) : null,
    token: localStorage.getItem('admin_token') || null,
    loading: false,
    error: null,
};

const adminAuthSlice = createSlice({
    name: 'adminAuth',
    initialState,
    reducers: {
        adminLoginSuccess: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.loading = false;
            localStorage.setItem('admin_user', JSON.stringify(user));
            localStorage.setItem('admin_token', token);
        },
        adminLogout: (state) => {
            state.user = null;
            state.token = null;
            state.error = null;
            localStorage.removeItem('admin_user');
            localStorage.removeItem('admin_token');
        },
        adminSetError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        adminClearError: (state) => {
            state.error = null;
        },
    },
});

export const { adminLoginSuccess, adminLogout, adminSetError, adminClearError } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
