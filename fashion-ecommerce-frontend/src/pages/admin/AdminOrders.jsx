import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';

const statusOptions = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
const paymentStatusOptions = ['unpaid', 'paid', 'refunded'];

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [updatingPaymentId, setUpdatingPaymentId] = useState(null);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

    const fetchOrders = async (params = {}) => {
        setLoading(true);
        setError('');
        try {
            const response = await adminService.getOrders(params);
            setOrders(response.data.orders || []);
            setPage(response.data.page || 1);
            setPages(response.data.pages || 1);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Không thể tải đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders({
            page,
            limit: 10,
            status: statusFilter || undefined,
            paymentStatus: paymentStatusFilter || undefined
        });
    }, [page, statusFilter, paymentStatusFilter]);

    const handleStatusChange = async (orderId, status) => {
        setUpdatingId(orderId);
        try {
            await adminService.updateOrderStatus(orderId, status);
            await fetchOrders({
                page,
                limit: 10,
                status: statusFilter || undefined,
                paymentStatus: paymentStatusFilter || undefined
            });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Cập nhật trạng thái thất bại');
        } finally {
            setUpdatingId(null);
        }
    };

    const handlePaymentStatusChange = async (orderId, paymentStatus) => {
        setUpdatingPaymentId(orderId);
        try {
            await adminService.updateOrderPaymentStatus(orderId, paymentStatus);
            await fetchOrders({
                page,
                limit: 10,
                status: statusFilter || undefined,
                paymentStatus: paymentStatusFilter || undefined
            });
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Cập nhật trạng thái thanh toán thất bại');
        } finally {
            setUpdatingPaymentId(null);
        }
    };

    const handleExport = async () => {
        try {
            const response = await adminService.exportOrders({
                status: statusFilter || undefined,
                paymentStatus: paymentStatusFilter || undefined
            });
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = 'orders.xlsx';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Không thể xuất dữ liệu');
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
                    <p className="text-sm text-gray-500">Xem danh sách đơn hàng và cập nhật trạng thái</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setPage(1);
                            setStatusFilter(e.target.value);
                        }}
                        className="rounded border border-gray-300 bg-white px-4 py-2"
                    >
                        <option value="">Tất cả trạng thái</option>
                        {statusOptions.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                    <select
                        value={paymentStatusFilter}
                        onChange={(e) => {
                            setPage(1);
                            setPaymentStatusFilter(e.target.value);
                        }}
                        className="rounded border border-gray-300 bg-white px-4 py-2"
                    >
                        <option value="">Tất cả thanh toán</option>
                        {paymentStatusOptions.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={handleExport}
                        className="inline-flex items-center rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
                    >
                        Xuất Excel
                    </button>
                </div>
            </div>

            {loading && <p className="text-gray-600">Đang tải đơn hàng...</p>}
            {error && <p className="text-red-600 mb-4">{error}</p>}

            {orders.length === 0 && !loading ? (
                <p className="text-gray-600">Chưa có đơn hàng nào.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-sm text-gray-600 uppercase">
                                <th className="px-4 py-3 border border-gray-200">Mã đơn</th>
                                <th className="px-4 py-3 border border-gray-200">Khách hàng</th>
                                <th className="px-4 py-3 border border-gray-200">Tổng tiền</th>
                                <th className="px-4 py-3 border border-gray-200">Thanh toán</th>
                                <th className="px-4 py-3 border border-gray-200">Tracking</th>
                                <th className="px-4 py-3 border border-gray-200">Trạng thái</th>
                                <th className="px-4 py-3 border border-gray-200">Cập nhật</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id} className="border-t border-gray-200 hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-800">
                                        <Link to={`/admin/orders/${order._id}`} className="text-blue-600 hover:underline">
                                            {order._id}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-800">{order.user?.email || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-800">{order.finalPrice?.toLocaleString('vi-VN')} ₫</td>
                                    <td className="px-4 py-3 text-sm text-gray-800">
                                        <select
                                            value={order.paymentStatus}
                                            onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                                            disabled={updatingPaymentId === order._id}
                                            className="rounded border border-gray-300 px-3 py-2 text-sm"
                                        >
                                            {paymentStatusOptions.map((paymentStatus) => (
                                                <option key={paymentStatus} value={paymentStatus}>
                                                    {paymentStatus}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-800">{order.trackingNumber || '—'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-800">{order.status}</td>
                                    <td className="px-4 py-3 text-sm text-gray-800">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                            disabled={updatingId === order._id}
                                            className="rounded border border-gray-300 px-3 py-2 text-sm"
                                        >
                                            {statusOptions.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {pages > 1 && (
                <div className="mt-6 flex items-center justify-between rounded border border-gray-200 bg-white p-4">
                    <button
                        type="button"
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                        Trang trước
                    </button>
                    <p className="text-sm text-gray-600">
                        Trang {page} / {pages}
                    </p>
                    <button
                        type="button"
                        onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
                        disabled={page === pages}
                        className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                        Trang sau
                    </button>
                </div>
            )}
        </div>
    );
}
