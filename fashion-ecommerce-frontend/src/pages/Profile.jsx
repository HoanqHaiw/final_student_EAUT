import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../redux/slices/authSlice';
import { userAPI } from '../services/authService';

export default function Profile() {
    const dispatch = useDispatch();
    const { user, token } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const response = await userAPI.getProfile();
                if (response.data?.success) {
                    const profile = response.data.data;
                    setFormData({ name: profile.name || '', email: profile.email || '', phone: profile.phone || '' });
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Không thể tải thông tin người dùng');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await userAPI.updateProfile(formData);
            if (response.data?.success) {
                dispatch(loginSuccess({ token, user: response.data.data }));
                setMessage('Thông tin cá nhân đã được cập nhật.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Cập nhật thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setPasswordLoading(true);

        try {
            const response = await userAPI.changePassword(passwordData);
            if (response.data?.success) {
                setMessage(response.data.message || 'Mật khẩu đã được thay đổi.');
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Đổi mật khẩu thất bại');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="container-custom py-16">
            <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                    <h1 className="text-3xl font-bold mb-6">Thông tin cá nhân</h1>
                    {message && <div className="mb-4 rounded bg-green-100 px-4 py-3 text-green-800">{message}</div>}
                    {error && <div className="mb-4 rounded bg-red-100 px-4 py-3 text-red-800">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Họ và tên</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full rounded border border-gray-300 px-4 py-3"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full rounded border border-gray-300 px-4 py-3"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Số điện thoại</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full rounded border border-gray-300 px-4 py-3"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded bg-black px-4 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                    <h2 className="text-2xl font-bold mb-5">Đổi mật khẩu</h2>
                    <form onSubmit={handleChangePassword} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                name="oldPassword"
                                value={passwordData.oldPassword}
                                onChange={handlePasswordChange}
                                className="w-full rounded border border-gray-300 px-4 py-3"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Mật khẩu mới</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full rounded border border-gray-300 px-4 py-3"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Nhập lại mật khẩu mới</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handleChangePassword}
                                className="w-full rounded border border-gray-300 px-4 py-3"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={passwordLoading}
                            className="w-full rounded bg-black px-4 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                            {passwordLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
