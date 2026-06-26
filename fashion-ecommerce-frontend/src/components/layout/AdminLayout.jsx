import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogout } from '../../redux/slices/adminAuthSlice';
import { 
    LayoutDashboard, 
    ShoppingCart, 
    Box, 
    Tags, 
    Users, 
    Ticket, 
    ListTree, 
    CalendarDays, 
    Bot, 
    LogOut,
    MessageSquare
} from 'lucide-react';

const navItems = [
    { label: 'Tổng quan', path: '/admin', roles: ['admin'], icon: LayoutDashboard },
    { label: 'Đơn hàng', path: '/admin/orders', roles: ['admin', 'staff'], icon: ShoppingCart },
    { label: 'Kho hàng', path: '/admin/inventory', roles: ['admin', 'staff'], icon: Box },
    { label: 'Sản phẩm', path: '/admin/products', roles: ['admin'], icon: Tags },
    { label: 'Người dùng', path: '/admin/users', roles: ['admin'], icon: Users },
    { label: 'Góp ý', path: '/admin/feedback', roles: ['admin'], icon: MessageSquare },
    { label: 'Coupon', path: '/admin/coupons', roles: ['admin'], icon: Ticket },
    { label: 'Danh mục', path: '/admin/categories', roles: ['admin'], icon: ListTree },
    { label: 'Sự kiện', path: '/admin/events', roles: ['admin'], icon: CalendarDays },
    { label: 'Trợ lý AI', path: '/admin/chatbot', roles: ['admin', 'staff'], icon: Bot }
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
        <div className="container-custom py-10 min-h-screen">
            <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
                {/* Sidebar Sạch sẽ Trắng sáng */}
                <aside className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xl shadow-gray-100/50 h-fit sticky top-10">
                    <div className="mb-8 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/60 p-4 text-center">
                        <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Đã đăng nhập</p>
                        <p className="text-base font-bold text-gray-900">{accountLabel}</p>
                    </div>
                    
                    <div className="mb-4 px-2">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quản lý hệ thống</h2>
                    </div>

                    <nav className="space-y-1.5 mb-8">
                        {navItems
                            .filter((item) => item.roles.includes(user?.role))
                            .map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.path === '/admin'}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                                                isActive 
                                                ? 'bg-black text-white shadow-md shadow-gray-300' 
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <Icon className={`w-5 h-5 ${isActive ? 'opacity-100' : 'opacity-70'}`} strokeWidth={isActive ? 2.5 : 2} />
                                                {item.label}
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                    </nav>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full rounded-xl bg-red-50 text-red-600 px-4 py-3.5 text-sm font-bold hover:bg-red-600 hover:text-white transition-all duration-300"
                    >
                        <LogOut className="w-4 h-4" strokeWidth={2.5} />
                        Đăng xuất
                    </button>
                </aside>

                <section className="space-y-6">
                    <Outlet />
                </section>
            </div>
        </div>
    );
}
