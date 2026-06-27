import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { 
    ShoppingBag, 
    TrendingUp, 
    DollarSign, 
    Package, 
    Clock, 
    CheckCircle, 
    Truck, 
    XCircle, 
    ArrowRight
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LabelList
} from 'recharts';

const STATUS_CONFIG = {
    pending: { label: 'Chờ xử lý', color: 'bg-yellow-500', hexColor: '#eab308', text: 'text-yellow-700', bg: 'bg-yellow-100', icon: Clock },
    confirmed: { label: 'Đã xác nhận', color: 'bg-blue-500', hexColor: '#3b82f6', text: 'text-blue-700', bg: 'bg-blue-100', icon: CheckCircle },
    shipping: { label: 'Đang giao', color: 'bg-purple-500', hexColor: '#a855f7', text: 'text-purple-700', bg: 'bg-purple-100', icon: Truck },
    delivered: { label: 'Đã giao', color: 'bg-green-500', hexColor: '#22c55e', text: 'text-green-700', bg: 'bg-green-100', icon: Package },
    cancelled: { label: 'Đã huỷ', color: 'bg-red-500', hexColor: '#ef4444', text: 'text-red-700', bg: 'bg-red-100', icon: XCircle }
};

export default function AdminDashboard() {
    const [overview, setOverview] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showExportModal, setShowExportModal] = useState(false);
    const currentYear = new Date().getFullYear();
    const [exportMonth, setExportMonth] = useState(String(new Date().getMonth() + 1));
    const [exportYear, setExportYear] = useState(String(currentYear));
    const [exportMode, setExportMode] = useState('month'); // 'month' | 'year' | 'all'

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [overviewResponse, topProductsResponse, ordersResponse] = await Promise.all([
                    adminService.getDashboard(),
                    adminService.getTopProducts(),
                    adminService.getOrders({ page: 1, limit: 5 })
                ]);

                setOverview(overviewResponse.data);
                setTopProducts(topProductsResponse.data || []);
                setRecentOrders(ordersResponse.data?.orders || []);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Không thể tải dashboard');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleExportRevenue = async () => {
        setShowExportModal(false);
        setError('');
        try {
            const params = {};
            if (exportMode === 'month') { params.month = exportMonth; params.year = exportYear; }
            else if (exportMode === 'year') { params.year = exportYear; }
            const response = await adminService.exportDashboardRevenue(params);
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const label = exportMode === 'month' ? `thang${exportMonth}-${exportYear}` : exportMode === 'year' ? `nam${exportYear}` : 'tat-ca';
            link.download = `bao-cao-doanh-thu-${label}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Không thể xuất dỏ liệu');
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

    const statusData = useMemo(() => {
        if (!overview?.statusCount) return [];
        return Object.entries(overview.statusCount).map(([status, count]) => ({
            name: STATUS_CONFIG[status]?.label || status,
            value: count,
            color: STATUS_CONFIG[status]?.hexColor || '#cbd5e1'
        })).filter(item => item.value > 0);
    }, [overview]);

    return (
        <div className="container-custom py-10 min-h-screen">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Tổng quan hệ thống</h1>
                    <p className="text-gray-500">
                        Theo dõi các chỉ số quan trọng và hoạt động gần đây của cửa hàng.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowExportModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-all hover:shadow-lg hover:shadow-gray-200"
                >
                    <TrendingUp className="w-4 h-4" />
                    Xuất Báo Cáo Excel
                </button>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
            )}
            
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-8 flex items-center gap-3">
                    <XCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Modal chọn kỳ xuất báo cáo */}
            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Xuất Báo Cáo Excel</h2>
                        <p className="text-sm text-gray-500 mb-6">Chọn kỳ báo cáo muốn xuất. File sẽ bao gồm 3 sheet: Tổng quan, Danh sách đơn hàng, Chi tiết sản phẩm.</p>

                        <div className="space-y-4 mb-6">
                            {/* Radio mode */}
                            <div className="flex gap-3">
                                {[['month', 'Theo tháng'], ['year', 'Theo năm'], ['all', 'Tất cả']].map(([val, lbl]) => (
                                    <label key={val} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 cursor-pointer text-sm font-semibold transition-all ${
                                        exportMode === val ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                                    }`}>
                                        <input type="radio" className="hidden" value={val} checked={exportMode === val} onChange={() => setExportMode(val)} />
                                        {lbl}
                                    </label>
                                ))}
                            </div>

                            {/* Year selector */}
                            {exportMode !== 'all' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Năm</label>
                                    <select
                                        value={exportYear}
                                        onChange={e => setExportYear(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black transition"
                                    >
                                        {Array.from({ length: 5 }, (_, i) => currentYear - i).map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Month selector */}
                            {exportMode === 'month' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tháng</label>
                                    <select
                                        value={exportMonth}
                                        onChange={e => setExportMonth(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black transition"
                                    >
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                            <option key={m} value={m}>Tháng {String(m).padStart(2, '0')}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowExportModal(false)}
                                className="flex-1 rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleExportRevenue}
                                className="flex-1 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition flex items-center justify-center gap-2"
                            >
                                <TrendingUp className="w-4 h-4" />
                                Tải Excel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!loading && overview && (
                <div className="space-y-8">
                    {/* Thẻ Thống kê */}
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Thẻ Đơn hàng */}
                        <div className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Tổng Đơn Hàng</p>
                                    <p className="text-3xl font-bold text-gray-900">{overview.totalOrders ?? 0}</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        {/* Thẻ Doanh thu */}
                        <div className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Tổng Doanh Thu</p>
                                    <p className="text-3xl font-bold text-gray-900">{overview.totalRevenue?.toLocaleString('vi-VN') ?? 0} <span className="text-xl text-gray-400">₫</span></p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shadow-inner">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        {/* Thẻ AOV */}
                        <div className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Trung bình / Đơn</p>
                                    <p className="text-3xl font-bold text-gray-900">{overview.averageOrderValue?.toLocaleString('vi-VN') ?? 0} <span className="text-xl text-gray-400">₫</span></p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                        {/* Biểu đồ doanh thu 6 tháng */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Doanh Thu 6 Tháng Gần Nhất</h2>
                                    <p className="text-sm text-gray-500">Biến động doanh thu từ các đơn hàng thành công.</p>
                                </div>
                            </div>
                            <div className="flex-1 w-full min-h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={overview.revenueTrend} margin={{ top: 30, right: 10, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fill: '#6b7280', fontSize: 12}}
                                            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                                            width={50}
                                        />
                                        <Tooltip 
                                            cursor={{fill: '#f3f4f6'}}
                                            formatter={(value) => [`${value.toLocaleString('vi-VN')} ₫`, 'Doanh thu']}
                                            labelStyle={{color: '#111827', fontWeight: 'bold'}}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="revenue" fill="#111827" radius={[6, 6, 0, 0]} maxBarSize={50}>
                                            <LabelList 
                                                dataKey="revenue" 
                                                position="top" 
                                                formatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value.toLocaleString('vi-VN')} 
                                                style={{ fill: '#4b5563', fontSize: 11, fontWeight: 'bold' }} 
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Phân bố trạng thái đơn hàng */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-1">Trạng Thái Đơn Hàng</h2>
                                <p className="text-sm text-gray-500">Tỉ lệ phân bổ các trạng thái đơn hàng hiện tại.</p>
                            </div>
                            <div className="flex-1 w-full min-h-[300px] mt-4">
                                {statusData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                cx="50%"
                                                cy="45%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                formatter={(value) => [value, 'Đơn hàng']}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Legend 
                                                verticalAlign="bottom" 
                                                height={36} 
                                                iconType="circle" 
                                                formatter={(value, entry) => <span className="text-sm text-gray-700 font-medium mr-2">{value}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        Chưa có đơn hàng nào
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Đơn hàng gần đây */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Đơn Hàng Gần Đây</h2>
                                <Link to="/admin/orders" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                                    Xem tất cả <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                            
                            <div className="space-y-4">
                                {recentOrders.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">Chưa có đơn hàng nào.</p>
                                ) : (
                                    recentOrders.map((order) => {
                                        const StatusIcon = STATUS_CONFIG[order.status]?.icon || Package;
                                        const config = STATUS_CONFIG[order.status] || { label: order.status, color: 'bg-gray-500', text: 'text-gray-700', bg: 'bg-gray-100' };
                                        
                                        return (
                                            <div key={order._id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bg} ${config.text}`}>
                                                        <StatusIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">#{order._id.slice(-6).toUpperCase()}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{order.user?.name || order.shippingAddress?.fullName || 'Khách'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-gray-900">{(order.finalPrice || order.totalPrice).toLocaleString('vi-VN')} ₫</p>
                                                    <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${config.text}`}>{config.label}</p>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Top Sản Phẩm Bán Chạy</h2>
                            </div>
                            
                            <div className="space-y-4">
                                {topProducts.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">Chưa có dữ liệu sản phẩm.</p>
                                ) : (
                                    topProducts.map((product, idx) => (
                                        <div key={product._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="relative flex-shrink-0">
                                                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                                    {product.images && product.images[0] ? (
                                                        <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                {idx < 3 && (
                                                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white shadow-sm
                                                        ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : 'bg-orange-500'}
                                                    `}>
                                                        {idx + 1}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate pr-4">{product.name || product._id}</p>
                                                <p className="text-xs text-gray-500 mt-1">Đã bán: <span className="font-bold text-black">{product.totalSold ?? 0}</span> chiếc</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
