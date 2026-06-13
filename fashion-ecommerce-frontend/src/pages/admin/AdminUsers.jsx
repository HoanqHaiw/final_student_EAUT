import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [actionId, setActionId] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', role: 'user' });

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await adminService.getUsers();
            setUsers(response.data || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Không thể tải người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleBlock = async (userId) => {
        setActionId(userId);
        try {
            await adminService.toggleUserBlock(userId);
            await fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Không thể cập nhật trạng thái người dùng');
        } finally {
            setActionId(null);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setForm({ name: user.name || '', email: user.email || '', role: user.role || 'user' });
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setForm({ name: '', email: '', role: 'user' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.name || !form.email) {
            setError('Vui lòng nhập tên và email.');
            return;
        }

        try {
            await adminService.updateUser(editingUser._id, form);
            handleCancelEdit();
            await fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Cập nhật người dùng thất bại');
        }
    };

    const handleDelete = async (userId) => {
        setActionId(userId);
        try {
            await adminService.deleteUser(userId);
            if (editingUser?._id === userId) handleCancelEdit();
            await fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Xóa người dùng thất bại');
        } finally {
            setActionId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
                    <p className="text-sm text-gray-500">Danh sách người dùng và bật/tắt tài khoản</p>
                </div>
                {editingUser && (
                    <div className="mb-6 rounded border border-gray-200 bg-gray-50 p-6">
                        <h2 className="text-2xl font-semibold mb-4">Chỉnh sửa người dùng</h2>
                        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium mb-2">Tên</label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Quyền</label>
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                >
                                    <option value="user">User</option>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex items-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="rounded border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-100"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="rounded bg-black px-6 py-3 text-white hover:bg-gray-800"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                {error && <p className="text-red-600 mb-4">{error}</p>}
            </div>

            {loading && <p className="text-gray-600">Đang tải người dùng...</p>}
            {error && <p className="text-red-600 mb-4">{error}</p>}

            {users.length === 0 && !loading ? (
                <p className="text-gray-600">Chưa có người dùng nào.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-sm text-gray-600 uppercase">
                                <th className="px-4 py-3 border border-gray-200">Email</th>
                                <th className="px-4 py-3 border border-gray-200">Tên</th>
                                <th className="px-4 py-3 border border-gray-200">Quyền</th>
                                <th className="px-4 py-3 border border-gray-200">Trạng thái</th>
                                <th className="px-4 py-3 border border-gray-200">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id} className="border-t border-gray-200 hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-800">{user.email}</td>
                                    <td className="px-4 py-3 text-sm text-gray-800">{user.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-800">{user.role}</td>
                                    <td className="px-4 py-3 text-sm text-gray-800">
                                        {user.isBlocked ? 'Bị khóa' : 'Hoạt động'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-800 space-y-2">
                                        <button
                                            disabled={actionId === user._id}
                                            onClick={() => handleToggleBlock(user._id)}
                                            className="w-full rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
                                        >
                                            {user.isBlocked ? 'Mở khóa' : 'Khóa'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(user)}
                                            className="w-full rounded border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-100"
                                        >
                                            Chỉnh sửa
                                        </button>
                                        <button
                                            type="button"
                                            disabled={actionId === user._id}
                                            onClick={() => handleDelete(user._id)}
                                            className="w-full rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
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
    );
}
