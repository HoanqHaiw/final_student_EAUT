import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });

    const resetForm = () => {
        setEditingCategoryId(null);
        setForm({ name: '', description: '' });
    };

    const fetchCategories = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await adminService.getCategories();
            setCategories(response.data || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Không thể tải danh mục');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.name) {
            setError('Tên danh mục không được để trống.');
            return;
        }

        try {
            if (editingCategoryId) {
                await adminService.updateCategory(editingCategoryId, form);
            } else {
                await adminService.createCategory(form);
            }
            resetForm();
            await fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Lưu danh mục thất bại');
        }
    };

    const handleEdit = (category) => {
        setEditingCategoryId(category._id);
        setForm({ name: category.name || '', description: category.description || '' });
    };

    const handleDelete = async (id) => {
        setLoading(true);
        setError('');
        try {
            await adminService.deleteCategory(id);
            await fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Xóa danh mục thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <h1 className="text-3xl font-bold mb-4">Quản lý danh mục</h1>
                <p className="text-sm text-gray-500 mb-6">Tạo, sửa hoặc xóa danh mục sản phẩm.</p>

                {error && <p className="text-red-600 mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium mb-2">Tên danh mục</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleInputChange}
                            className="w-full rounded border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Mô tả</label>
                        <input
                            name="description"
                            value={form.description}
                            onChange={handleInputChange}
                            className="w-full rounded border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div className="md:col-span-2 flex gap-3 justify-end">
                        {editingCategoryId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-100"
                            >
                                Hủy
                            </button>
                        )}
                        <button
                            type="submit"
                            className="rounded bg-black px-6 py-3 text-white hover:bg-gray-800"
                        >
                            {editingCategoryId ? 'Cập nhật danh mục' : 'Thêm danh mục'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <h2 className="text-2xl font-semibold mb-4">Danh sách danh mục</h2>

                {loading && <p className="text-gray-600">Đang tải danh mục...</p>}
                {categories.length === 0 && !loading ? (
                    <p className="text-gray-600">Chưa có danh mục nào.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-sm text-gray-600 uppercase">
                                    <th className="px-4 py-3 border border-gray-200">Tên danh mục</th>
                                    <th className="px-4 py-3 border border-gray-200">Mô tả</th>
                                    <th className="px-4 py-3 border border-gray-200">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr key={category._id} className="border-t border-gray-200 hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-800">{category.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800">{category.description || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800 space-x-2">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category._id)}
                                                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
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
