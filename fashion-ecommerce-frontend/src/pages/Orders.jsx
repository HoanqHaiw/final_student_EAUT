import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../redux/slices/cartSlice';
import { orderAPI } from '../services/authService';

export default function Orders() {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [refreshToggle, setRefreshToggle] = useState(false);

    useEffect(() => {
        if (searchParams.get('payment_success') === 'true') {
            dispatch(clearCart());
            setSearchParams({});
        }
    }, [searchParams, dispatch, setSearchParams]);

    useEffect(() => {
        const loadOrders = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await orderAPI.getMyOrders();
                setOrders(response.data.data || []);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Không thể tải đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [refreshToggle]);

    const handleCancel = async (orderId) => {
        try {
            await orderAPI.cancel(orderId);
            setRefreshToggle((prev) => !prev);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Huỷ đơn hàng thất bại');
        }
    };

    return (
        <div className="container-custom py-16">
            <h1 className="text-3xl font-bold mb-6">Đơn hàng của tôi</h1>

            {loading && <div className="text-gray-600">Đang tải đơn hàng...</div>}
            {error && <div className="mb-6 rounded bg-red-100 px-4 py-3 text-red-800">{error}</div>}

            {!loading && orders.length === 0 && (
                <div className="rounded bg-gray-50 p-8 text-center text-gray-600">
                    Bạn chưa có đơn hàng nào.
                    <div className="mt-5">
                        <Link to="/products" className="btn-primary">
                            Xem sản phẩm
                        </Link>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order._id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Mã đơn hàng: <span className="font-semibold text-black">{order._id}</span></p>
                                <p className="text-sm text-gray-500">Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">{order.status.toUpperCase()}</span>
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">{order.paymentStatus.toUpperCase()}</span>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                            <div>
                                <p className="text-sm text-gray-500">Tổng đơn hàng</p>
                                <p className="mt-1 text-lg font-semibold text-black">{order.finalPrice.toLocaleString('vi-VN')} ₫</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Giảm giá</p>
                                <p className="mt-1 text-lg font-semibold text-black">{order.discount.toLocaleString('vi-VN')} ₫</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                                <p className="mt-1 text-black">{order.shippingAddress}</p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-4">
                            {order.items.map((item) => (
                                <div key={`${order._id}-${item._id}`} className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-20 w-20 overflow-hidden rounded-3xl bg-white border border-gray-200">
                                            <img
                                                src={item.product?.images?.[0] || '/fallback-image.png'}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-black">{item.name}</p>
                                            <p className="text-sm text-gray-500">Size: {item.size} • Màu: {item.color}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                        <span>Số lượng: {item.quantity}</span>
                                        <span>Giá: {(item.price * item.quantity).toLocaleString('vi-VN')} ₫</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <Link to={`/orders/${order._id}`} className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800">
                                Xem chi tiết đơn hàng
                            </Link>

                            {order.status === 'pending' && (
                                <button
                                    onClick={() => handleCancel(order._id)}
                                    className="rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                                >
                                    Huỷ đơn hàng
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
