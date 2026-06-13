import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/authService';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!token) {
            setError('Liên kết đặt lại mật khẩu không hợp lệ.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu và xác nhận mật khẩu không khớp.');
            return;
        }

        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        setLoading(true);
        try {
            await authAPI.resetPassword({ token, newPassword: password });
            setSuccess('Đặt lại mật khẩu thành công. Đang chuyển tới trang đăng nhập...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            const message = err.response?.data?.message || 'Không thể đặt lại mật khẩu';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-custom py-16">
            <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
                <h1 className="text-3xl font-bold mb-6 text-center">Đặt lại mật khẩu</h1>

                {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
                {success && <div className="bg-green-100 text-green-800 p-3 rounded mb-4">{success}</div>}

                {!success && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Mật khẩu mới</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:bg-gray-400 font-semibold"
                        >
                            {loading ? 'Đang gửi...' : 'Đặt lại mật khẩu'}
                        </button>
                    </form>
                )}

                <p className="text-center text-sm mt-6">
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Quay lại đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}
