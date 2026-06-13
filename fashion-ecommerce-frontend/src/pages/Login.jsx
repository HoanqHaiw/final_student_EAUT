import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess, setError } from '../redux/slices/authSlice';
import { authAPI } from '../services/authService';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setErrorMsg] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            const response = await authAPI.login({ email, password });
            const { token, user } = response.data;

            if (user?.role === 'admin' || user?.role === 'staff') {
                setErrorMsg('Tài khoản admin/staff chỉ được đăng nhập ở trang quản trị.');
                return;
            }

            dispatch(loginSuccess({ token, user }));
            navigate(from, { replace: true });
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Login failed';
            setErrorMsg(message);
            dispatch(setError(message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-custom py-16">
            <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
                <h1 className="text-3xl font-bold mb-8 text-center">Login</h1>

                {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}

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

                    <div>
                        <label className="block text-sm font-semibold mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:bg-gray-400 font-semibold"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="text-center text-sm mt-6">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-blue-600 hover:underline">
                        Đăng ký
                    </Link>
                </p>
                <p className="text-center text-sm mt-2">
                    <Link to="/forgot-password" className="text-blue-600 hover:underline">
                        Quên mật khẩu?
                    </Link>
                </p>
            </div>
        </div>
    );
}
