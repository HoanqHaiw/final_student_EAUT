import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';

const paymentOptions = ['unpaid', 'paid', 'refunded'];
const shippingMethods = ['standard', 'express', 'overnight'];
const returnOptions = ['none', 'requested', 'approved', 'rejected', 'returned'];

export default function AdminOrderDetail() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('unpaid');
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [returnStatus, setReturnStatus] = useState('none');
    const [returnReason, setReturnReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await adminService.getOrderDetail(id);
                const orderData = response.data;
                setOrder(orderData);
                setPaymentStatus(orderData.paymentStatus || 'unpaid');
                setShippingMethod(orderData.shippingMethod || 'standard');
                setTrackingNumber(orderData.trackingNumber || '');
                setReturnStatus(orderData.returnStatus || 'none');
                setReturnReason(orderData.returnReason || '');
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Không thể tải chi tiết đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    const handlePaymentSave = async () => {
        setSaving(true);
        setError('');
        try {
            const response = await adminService.updateOrderPaymentStatus(id, paymentStatus);
            setOrder(response.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Cập nhật thanh toán thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleShippingSave = async () => {
        setSaving(true);
        setError('');
        try {
            const response = await adminService.updateOrderShipping(id, {
                shippingMethod,
                trackingNumber
            });
            setOrder(response.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Cập nhật thông tin giao hàng thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleReturnSave = async () => {
        setSaving(true);
        setError('');
        try {
            const response = await adminService.updateOrderReturnStatus(id, {
                returnStatus,
                returnReason
            });
            setOrder(response.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Cập nhật trạng thái trả hàng thất bại');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">Đang tải chi tiết đơn hàng...</div>;
    }

    if (error) {
        return <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-red-600">{error}</div>;
    }

    if (!order) {
        return <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">Không tìm thấy đơn hàng.</div>;
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <h1 className="text-3xl font-bold mb-4">Chi tiết đơn hàng</h1>
            <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-500">Mã đơn hàng</p>
                    <p className="font-semibold">{order._id}</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <p className="font-semibold">{order.status}</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-500">Thanh toán</p>
                    <p className="font-semibold">{order.paymentStatus}</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-500">Tổng giá</p>
                    <p className="font-semibold">{order.finalPrice?.toLocaleString('vi-VN')} ₫</p>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                    <h2 className="font-semibold mb-2">Thông tin khách hàng</h2>
                    <p>Email: {order.user?.email || 'N/A'}</p>
                    <p>Tên: {order.user?.name || 'N/A'}</p>
                    <p>Điện thoại: {order.phone || order.user?.phone || 'N/A'}</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                    <h2 className="font-semibold mb-2">Địa chỉ giao hàng</h2>
                    <p>{order.shippingAddress}</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h2 className="font-semibold mb-2">Thông tin vận chuyển</h2>
                    <p>Phương thức: {order.shippingMethod}</p>
                    <p>Mã tracking: {order.trackingNumber || 'Chưa có'}</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h2 className="font-semibold mb-2">Trạng thái trả hàng</h2>
                    <p>Trạng thái: {order.returnStatus}</p>
                    {order.returnReason && <p>Lý do: {order.returnReason}</p>}
                </div>
            </div>

            <div className="grid gap-4 mb-6 lg:grid-cols-3">
                <div className="p-4 border border-gray-200 rounded-lg bg-white">
                    <h2 className="font-semibold mb-3">Thanh toán</h2>
                    <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                        className="mb-3 w-full rounded border border-gray-300 bg-white px-3 py-2"
                    >
                        {paymentOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={handlePaymentSave}
                        disabled={saving}
                        className="inline-flex w-full justify-center rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                        Lưu thanh toán
                    </button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-white">
                    <h2 className="font-semibold mb-3">Giao hàng</h2>
                    <label className="block text-sm font-medium text-gray-700">Phương thức</label>
                    <select
                        value={shippingMethod}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="mb-3 w-full rounded border border-gray-300 bg-white px-3 py-2"
                    >
                        {shippingMethods.map((method) => (
                            <option key={method} value={method}>
                                {method}
                            </option>
                        ))}
                    </select>
                    <label className="block text-sm font-medium text-gray-700">Tracking</label>
                    <input
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Nhập mã theo dõi"
                        className="mb-3 w-full rounded border border-gray-300 px-3 py-2"
                    />
                    <button
                        type="button"
                        onClick={handleShippingSave}
                        disabled={saving}
                        className="inline-flex w-full justify-center rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                        Lưu giao hàng
                    </button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-white">
                    <h2 className="font-semibold mb-3">Trả hàng</h2>
                    <select
                        value={returnStatus}
                        onChange={(e) => setReturnStatus(e.target.value)}
                        className="mb-3 w-full rounded border border-gray-300 bg-white px-3 py-2"
                    >
                        {returnOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <textarea
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        placeholder="Lý do trả hàng"
                        rows={3}
                        className="mb-3 w-full rounded border border-gray-300 px-3 py-2"
                    />
                    <button
                        type="button"
                        onClick={handleReturnSave}
                        disabled={saving}
                        className="inline-flex w-full justify-center rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                        Lưu trả hàng
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-sm text-gray-600 uppercase">
                            <th className="px-4 py-3 border border-gray-200">Sản phẩm</th>
                            <th className="px-4 py-3 border border-gray-200">Size</th>
                            <th className="px-4 py-3 border border-gray-200">Màu</th>
                            <th className="px-4 py-3 border border-gray-200">Giá</th>
                            <th className="px-4 py-3 border border-gray-200">Số lượng</th>
                            <th className="px-4 py-3 border border-gray-200">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item) => (
                            <tr key={item._id || `${item.product}-${item.size}-${item.color}`} className="border-t border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-800">{item.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-800">{item.size}</td>
                                <td className="px-4 py-3 text-sm text-gray-800">{item.color}</td>
                                <td className="px-4 py-3 text-sm text-gray-800">{item.price?.toLocaleString('vi-VN')} ₫</td>
                                <td className="px-4 py-3 text-sm text-gray-800">{item.quantity}</td>
                                <td className="px-4 py-3 text-sm text-gray-800">{(item.price * item.quantity)?.toLocaleString('vi-VN')} ₫</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
