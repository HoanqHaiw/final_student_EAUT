import { useEffect, useState, useMemo } from 'react';
import { adminService } from '../../services/adminService';

const STATUS_LABELS = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã huỷ'
};

export default function AdminDashboard() {
    const [overview, setOverview] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [overviewResponse, topProductsResponse] = await Promise.all([
                    adminService.getDashboard(),
                    adminService.getTopProducts()
                ]);

                setOverview(overviewResponse.data);
                setTopProducts(topProductsResponse.data || []);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Không thể tải dashboard');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleExportRevenue = async () => {
        setError('');
        try {
            const response = await adminService.exportDashboardRevenue();
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'revenue.xlsx';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Không thể xuất doanh thu Excel');
        }
    };

    const maxRevenue = useMemo(() => {
        if (!overview?.revenueTrend?.length) return 1;
        return Math.max(...overview.revenueTrend.map((item) => item.revenue), 1);
    }, [overview]);

    const statusEntries = useMemo(() => {
        if (!overview?.statusCount) return [];
        return Object.entries(overview.statusCount);
    }, [overview]);

    return (
        <div className="container-custom py-16">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                        <p className="text-gray-600">
                            Chào mừng bạn đến trang quản trị. Các số liệu bên dưới được cập nhật từ hệ thống.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleExportRevenue}
                        className="rounded bg-black px-5 py-3 text-sm text-white hover:bg-gray-800"
                    >
                        Xuất doanh thu Excel
                    </button>
                </div>

                {loading && <p className="text-gray-600">Đang tải dữ liệu...</p>}
                {error && <p className="text-red-600">{error}</p>}

                {overview && (
                    <>
                        <div className="grid gap-4 md:grid-cols-3 mb-8">
                            <div className="p-5 border border-gray-200 rounded-lg bg-gray-50">
                                <p className="text-sm text-gray-500">Tổng đơn hàng</p>
                                <p className="text-3xl font-semibold mt-2">{overview.totalOrders ?? 0}</p>
                            </div>
                            <div className="p-5 border border-gray-200 rounded-lg bg-gray-50">
                                <p className="text-sm text-gray-500">Tổng doanh thu</p>
                                <p className="text-3xl font-semibold mt-2">{overview.totalRevenue?.toLocaleString('vi-VN') ?? 0} ₫</p>
                            </div>
                            <div className="p-5 border border-gray-200 rounded-lg bg-gray-50">
                                <p className="text-sm text-gray-500">Giá trị đơn trung bình</p>
                                <p className="text-3xl font-semibold mt-2">{overview.averageOrderValue?.toLocaleString('vi-VN') ?? 0} ₫</p>
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2 mb-8">
                            <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-semibold">Doanh thu 6 tháng</h2>
                                        <p className="text-sm text-gray-500">Tổng doanh thu theo tháng từ đơn đã thanh toán.</p>
                                    </div>
                                </div>
                                <div className="flex items-end gap-3 h-56">
                                    {overview.revenueTrend.map((item) => (
                                        <div key={item.label} className="flex-1 flex flex-col justify-end">
                                            <div
                                                className="mx-auto w-full rounded-t-xl bg-black transition-all"
                                                style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                                            />
                                            <div className="mt-3 text-center text-[11px] text-gray-600">{item.label}</div>
                                            <div className="text-center text-xs text-gray-500">{item.revenue.toLocaleString('vi-VN')}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-semibold">Đơn hàng theo trạng thái</h2>
                                        <p className="text-sm text-gray-500">Phân bố số lượng đơn hiện tại.</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {statusEntries.map(([status, count]) => (
                                        <div key={status}>
                                            <div className="flex justify-between text-sm text-gray-700 mb-1">
                                                <span>{STATUS_LABELS[status] || status}</span>
                                                <span>{count}</span>
                                            </div>
                                            <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-black"
                                                    style={{ width: `${(count / (overview.totalOrders || 1)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {topProducts.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Sản phẩm bán chạy nhất</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-sm text-gray-600 uppercase">
                                        <th className="px-4 py-3 border border-gray-200">Tên sản phẩm</th>
                                        <th className="px-4 py-3 border border-gray-200">Số lượng bán</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topProducts.map((product) => (
                                        <tr key={product._id} className="border-t border-gray-200 hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-800">{product.name || product._id}</td>
                                            <td className="px-4 py-3 text-sm text-gray-800">{product.totalSold ?? 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
