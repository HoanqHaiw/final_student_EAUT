import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateCartItem } from '../redux/slices/cartSlice';

export default function Cart() {
    const dispatch = useDispatch();
    const { items } = useSelector((state) => state.cart);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleUpdateQuantity = (id, quantity) => {
        const item = items.find((i) => i.id === id);
        if (!item) return;

        let newQuantity = parseInt(quantity);
        if (isNaN(newQuantity) || newQuantity < 1) newQuantity = 1;

        if (item.stock && newQuantity > item.stock) {
            alert(`Không đủ tồn kho. Tồn kho tối đa: ${item.stock}`);
            newQuantity = item.stock;
        }

        dispatch(updateCartItem({ id, quantity: newQuantity }));
    };

    const handleRemove = (id) => {
        dispatch(removeFromCart(id));
    };

    if (items.length === 0) {
        return (
            <div className="container-custom py-16 text-center">
                <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
                <p className="text-gray-600 mb-8">Add some items to get started!</p>
                <Link to="/products" className="btn-primary">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container-custom py-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-4 border border-gray-200 p-4 rounded">
                                <img
                                    src={item.image || 'https://via.placeholder.com/100'}
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded"
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-sm text-gray-600">
                                        Size: {item.size} | Color: {item.color}
                                    </p>
                                    <p className="font-bold">{item.price.toLocaleString('vi-VN')} ₫</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        max={item.stock || ""}
                                        value={item.quantity}
                                        onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                    />
                                    <button
                                        onClick={() => handleRemove(item.id)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 p-6 rounded sticky top-20 h-fit">
                    <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                    <div className="space-y-3 mb-6 pb-6 border-b">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{total.toLocaleString('vi-VN')} ₫</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping:</span>
                            <span>Tính khi thanh toán</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax:</span>
                            <span>{(total * 0.1).toLocaleString('vi-VN')} ₫</span>
                        </div>
                    </div>
                    <div className="flex justify-between text-lg font-bold mb-6">
                        <span>Total:</span>
                        <span>{(total * 1.1).toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <Link to="/checkout" className="w-full bg-black text-white py-3 rounded text-center font-semibold hover:bg-gray-800 block mb-3">
                        Proceed to Checkout
                    </Link>
                    <Link to="/products" className="w-full bg-gray-200 text-black py-3 rounded text-center font-semibold hover:bg-gray-300 block">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
