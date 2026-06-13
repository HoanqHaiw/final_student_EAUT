import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [],
    total: 0,
    loading: false,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload;
            const existingItem = state.items.find(
                (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
            );

            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                state.items.push({
                    ...item,
                    id: Date.now(),
                });
            }
            localStorage.setItem('cart', JSON.stringify(state.items));
            state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        },

        removeFromCart: (state, action) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
            localStorage.setItem('cart', JSON.stringify(state.items));
            state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        },

        updateCartItem: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.items.find((i) => i.id === id);
            if (item) {
                item.quantity = quantity;
                if (item.quantity <= 0) {
                    state.items = state.items.filter((i) => i.id !== id);
                }
            }
            localStorage.setItem('cart', JSON.stringify(state.items));
            state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        },

        clearCart: (state) => {
            state.items = [];
            state.total = 0;
            localStorage.removeItem('cart');
        },

        setCart: (state, action) => {
            state.items = action.payload;
            state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        },
    },
});

export const { addToCart, removeFromCart, updateCartItem, clearCart, setCart } = cartSlice.actions;
export default cartSlice.reducer;
