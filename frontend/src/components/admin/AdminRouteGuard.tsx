import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAuthSession } from '../../lib/auth';

interface AdminRouteGuardProps {
  children?: ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const location = useLocation();
  const session = getAuthSession();

  if (!session || session.user.role !== 'admin') {
    return <Navigate to={`/admin/login?callbackUrl=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}
