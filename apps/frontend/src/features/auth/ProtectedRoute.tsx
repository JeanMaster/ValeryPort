import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
    children: ReactNode;
    roles?: string[]; // Allowed roles
    permission?: string; // Required permission
}

export const ProtectedRoute = ({ children, roles, permission }: ProtectedRouteProps) => {
    const { isAuthenticated, hasRole, hasPermission } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && !roles.some(role => hasRole(role))) {
        // Redirect to unauthorized or dashboard? For now, Dashboard is mostly safe or just show restricted
        return <Navigate to="/" replace />;
    }

    if (permission && !hasPermission(permission)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
