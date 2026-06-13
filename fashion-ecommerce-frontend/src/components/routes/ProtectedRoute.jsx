import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
    const isAdminRole = requiredRole === 'admin' || requiredRole === 'staff';

    // Admin and staff routes use the isolated adminAuth slice
    // User routes use the regular auth slice — the two never share state
    const adminAuth = useSelector((state) => state.adminAuth);
    const userAuth = useSelector((state) => state.auth);
    const { user, token } = isAdminRole ? adminAuth : userAuth;

    const location = useLocation();

    if (!token) {
        const loginPath = isAdminRole ? '/admin/login' : '/login';
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    if (requiredRole) {
        const role = user?.role;
        const allowedRoles = Array.isArray(requiredRole)
            ? requiredRole
            : requiredRole === 'staff'
                ? ['admin', 'staff']
                : [requiredRole];

        if (!allowedRoles.includes(role)) {
            const redirectPath = isAdminRole ? '/admin/login' : '/';
            return <Navigate to={redirectPath} replace />;
        }
    }

    return children;
}
