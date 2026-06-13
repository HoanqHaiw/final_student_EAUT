import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';

const initialForm = {
    code: '',
    type: 'percent',
    value: '',
    minOrder: '',
    maxDiscount: '',
    expiredAt: '',
    usageLimit: '',
    isActive: true
};

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [editingCouponId, setEditingCouponId] = useState(null);
    const [form, setForm] = useState(initialForm);

    const fetchCoupons = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await adminService.getCoupons();
            setCoupons(response.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Không thể tải coupon');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const resetForm = () => {
        setEditingCouponId(null);
        setForm(initialForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.code || !form.type || !form.value) {
            setError('Vui lòng nhập mã, loại và giá trị coupon.');
            return;
        }

        const payload = {
            code: form.code,
            type: form.type,
            value: Number(form.value),
            minOrder: Number(form.minOrder) || 0,
            maxDiscount: form.type === 'percent' ? (Number(form.maxDiscount) || 0) : 0,
            expiredAt: form.expiredAt || undefined,
            usageLimit: Number(form.usageLimit) || 0,
            isActive: form.isActive
        };

        try {
            if (editingCouponId) {
                await adminService.updateCoupon(editingCouponId, payload);
            } else {
                await adminService.createCoupon(payload);
            }
            resetForm();
            await fetchCoupons();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Lưu coupon thất bại');
        }
    };

    const handleEdit = (coupon) => {
        setEditingCouponId(coupon._id);
        setForm({
            code: coupon.code || '',
            type: coupon.type || 'percent',
            value: coupon.value?.toString() || '',
            minOrder: coupon.minOrder?.toString() || '',
            maxDiscount: coupon.maxDiscount?.toString() || '',
            expiredAt: coupon.expiredAt ? new Date(coupon.expiredAt).toISOString().split('T')[0] : '',
            usageLimit: coupon.usageLimit?.toString() || '',
            isActive: coupon.isActive ?? true
        });
    };

    const handleDelete = async (couponId) => {
        setDeletingId(couponId);
        setError('');
        try {
            await adminService.deleteCoupon(couponId);
            if (editingCouponId === couponId) resetForm();
            await fetchCoupons();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Xóa coupon thất bại');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <h1 className="text-3xl font-bold mb-4">Quản lý Coupon</h1>
                <p className="text-sm text-gray-500 mb-6">Tạo, sửa hoặc xóa mã giảm giá.</p>

                {error && <p className="text-red-600 mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Mã coupon</label>
                            <input
                                name="code"
                                value={form.code}
                                onChange={handleInputChange}
                                className="w-full rounded border border-gray-300 px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Loại</label>
                            <select
                                name="type"
                                value={form.type}
                                onChange={handleInputChange}
                                className="w-full rounded border border-gray-300 px-3 py-2"
                            >
                                <option value="percent">Phần trăm</option>
                                <option value="fixed">Tiền cố định</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Giá trị</label>
                            <input
                                type="number"
                                name="value"
                                value={form.value}
                                onChange={handleInputChange}
                                className="w-full rounded border border-gray-300 px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Giá trị đơn tối thiểu</label>
                            <input
                                type="number"
                                name="minOrder"
                                value={form.minOrder}
                                onChange={handleInputChange}
                                className="w-full rounded border border-gray-300 px-3 py-2"
                            />
                        </div>
                        {form.type === 'percent' && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Mức giảm tối đa (VNĐ)</label>
                                <input
                                    type="number"
                                    name="maxDiscount"
                                    value={form.maxDiscount}
                                    onChange={handleInputChange}
                                    placeholder="Không giới hạn thì để trống hoặc 0"
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium mb-2">Hạn sử dụng</label>
                            <input
                                type="date"
                                name="expiredAt"
                                value={form.expiredAt}
                                onChange={handleInputChange}
                                className="w-full rounded border border-gray-300 px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Giới hạn lượt dùng</label>
                            <input
                                type="number"
                                name="usageLimit"
                                value={form.usageLimit}
                                onChange={handleInputChange}
                                className="w-full rounded border border-gray-300 px-3 py-2"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                id="isActive"
                                type="checkbox"
                                name="isActive"
                                checked={form.isActive}
                                onChange={handleInputChange}
                                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                            />
                            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                Kích hoạt coupon
                            </label>
                        </div>
                    </div>
                    <div className="flex flex-col justify-between gap-3">
                        <div className="rounded border border-gray-200 bg-gray-50 p-4">
                            <p className="font-semibold">{editingCouponId ? 'Chỉnh sửa coupon' : 'Tạo coupon mới'}</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Coupon sẽ được dùng để áp vào đơn hàng nếu thỏa điều kiện.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-end">
                            {editingCouponId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-100"
                                >
                                    Hủy chỉnh sửa
                                </button>
                            )}
                            <button
                                type="submit"
                                className="rounded bg-black px-6 py-3 text-white hover:bg-gray-800"
                            >
                                {editingCouponId ? 'Cập nhật coupon' : 'Thêm coupon'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold">Danh sách Coupon</h2>
                        <p className="text-sm text-gray-500">Quản lý coupon hiện có.</p>
                    </div>
                </div>

                {loading && <p className="text-gray-600">Đang tải coupon...</p>}
                {error && <p className="text-red-600 mb-4">{error}</p>}

                {coupons.length === 0 && !loading ? (
                    <p className="text-gray-600">Chưa có coupon nào.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-sm text-gray-600 uppercase">
                                    <th className="px-4 py-3 border border-gray-200">Mã</th>
                                    <th className="px-4 py-3 border border-gray-200">Loại</th>
                                    <th className="px-4 py-3 border border-gray-200">Giá trị</th>
                                    <th className="px-4 py-3 border border-gray-200">Trạng thái</th>
                                    <th className="px-4 py-3 border border-gray-200">Hạn</th>
                                    <th className="px-4 py-3 border border-gray-200">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map((coupon) => (
                                    <tr key={coupon._id} className="border-t border-gray-200 hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-800">{coupon.code}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800">{coupon.type}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800">{coupon.value}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800">{coupon.isActive ? 'Hoạt động' : 'Không hiệu lực'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800">{coupon.expiredAt ? new Date(coupon.expiredAt).toLocaleDateString('vi-VN') : 'Không hạn'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800 space-x-2">
                                            <button
                                                onClick={() => handleEdit(coupon)}
                                                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                disabled={deletingId === coupon._id}
                                                onClick={() => handleDelete(coupon._id)}
                                                className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
