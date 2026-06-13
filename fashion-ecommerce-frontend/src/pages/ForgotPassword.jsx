import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/authService';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await authAPI.forgotPassword(email);
            setSuccess('Yêu cầu đã được gửi. Vui lòng kiểm tra email để đặt lại mật khẩu.');
        } catch (err) {
            const message = err.response?.data?.message || 'Không thể gửi yêu cầu quên mật khẩu';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-custom py-16">
            <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
                <h1 className="text-3xl font-bold mb-6 text-center">Quên mật khẩu</h1>

                {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
                {success && <div className="bg-green-100 text-green-800 p-3 rounded mb-4">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:bg-gray-400 font-semibold"
                    >
                        {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </button>
                </form>

                <p className="text-center text-sm mt-6">
                    Đã nhớ mật khẩu?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}
