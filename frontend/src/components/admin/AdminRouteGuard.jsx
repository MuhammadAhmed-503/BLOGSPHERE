import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAuthSession } from '../../services/auth';
export default function AdminRouteGuard({ children }) {
    const location = useLocation();
    const session = getAuthSession();
    if (!session || session.user.role !== 'admin') {
        return <Navigate to={`/admin/login?callbackUrl=${encodeURIComponent(location.pathname + location.search)}`} replace/>;
    }
    if (children) {
        return <>{children}</>;
    }
    return <Outlet />;
}
