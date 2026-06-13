import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/authService';

export default function VerifyEmail() {
    const [formData, setFormData] = useState({
        email: '',
        code: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await authAPI.verifyEmail({
                email: formData.email,
                code: formData.code,
            });
            setSuccess('Xác thực thành công! Đang chuyển đến trang đăng nhập...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            const message = err.response?.data?.message || 'Xác thực thất bại';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-custom py-16">
            <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
                <h1 className="text-3xl font-bold mb-8 text-center">Xác thực Email</h1>

                {success && <div className="bg-green-100 text-green-800 p-3 rounded mb-4">{success}</div>}
                {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded"
                            required
                            placeholder="Nhập email đã đăng ký"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Mã xác nhận</label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded"
                            required
                            placeholder="Nhập mã 6 số từ email"
                            maxLength="6"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
                    >
                        {loading ? 'Đang xác thực...' : 'Xác thực'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>Mã xác nhận sẽ hết hạn sau 30 phút.</p>
                    <p>Không nhận được mã? <button className="text-blue-600 hover:underline">Gửi lại</button></p>
                </div>
            </div>
        </div>
    );
}