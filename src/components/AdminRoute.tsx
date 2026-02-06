import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AdminRouteProps {
    children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
    const { user, isSystemAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F7F7F2] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3A2D]"></div>
            </div>
        );
    }

    if (!user || !isSystemAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
