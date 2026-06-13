import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogout } from '../../redux/slices/adminAuthSlice';

const navItems = [
    { label: 'Tổng quan', path: '/admin', roles: ['admin'] },
    { label: 'Đơn hàng', path: '/admin/orders', roles: ['admin', 'staff'] },
    { label: 'Kho hàng', path: '/admin/inventory', roles: ['admin', 'staff'] },
    { label: 'Sản phẩm', path: '/admin/products', roles: ['admin'] },
    { label: 'Người dùng', path: '/admin/users', roles: ['admin'] },
    { label: 'Coupon', path: '/admin/coupons', roles: ['admin'] },
    { label: 'Danh mục', path: '/admin/categories', roles: ['admin'] },
    { label: 'Sự kiện', path: '/admin/events', roles: ['admin'] },
    { label: 'Trợ lý AI', path: '/admin/chatbot', roles: ['admin', 'staff'] }
];

export default function AdminLayout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.adminAuth);

    const displayName = user?.name ? user.name.trim().split(' ').slice(-1)[0] : 'Người dùng';
    const displayRole = user?.role === 'admin' ? 'ADMIN' : 'Staff';
    const accountLabel = `${displayRole} (${displayName})`;

    const handleLogout = () => {
        dispatch(adminLogout());
        navigate('/admin/login');
    };

    return (
        <div className="container-custom py-16">
            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
                <aside className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="mb-6 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Đã đăng nhập</p>
                        <p className="mt-2 text-lg font-semibold text-black">{accountLabel}</p>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Quản trị hệ thống</h2>
                    </div>
                    <nav className="space-y-2 mb-5">
                        {navItems
                            .filter((item) => item.roles.includes(user?.role))
                            .map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/admin'}
                                    className={({ isActive }) =>
                                        `block rounded-lg px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
                                        }`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                    </nav>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full rounded bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
                    >
                        Logout
                    </button>
                </aside>

                <section className="space-y-6">
                    <Outlet />
                </section>
            </div>
        </div>
    );
}
