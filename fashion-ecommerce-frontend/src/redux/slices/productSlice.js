import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    products: [],
    loading: false,
    error: null,
    totalCount: 0,
};

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setLoading: (state) => {
            state.loading = true;
            state.error = null;
        },
        setProducts: (state, action) => {
            state.products = action.payload.products || action.payload;
            state.totalCount = action.payload.total || state.products.length;
            state.loading = false;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const { setLoading, setProducts, setError, clearError } = productSlice.actions;
export default productSlice.reducer;
