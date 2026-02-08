import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import { LoadingScreen } from './LoadingScreen';

interface AdminRouteProps {
    children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
    const { user, isSystemAdmin, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!user || !isSystemAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
