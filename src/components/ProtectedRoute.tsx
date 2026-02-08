import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F7F7F2] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3A2D]"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Admins bypass status check to access management
    if (profile?.role === 'super_admin' || (profile?.role === 'admin' && profile?.status === 'approved')) {
        return <>{children}</>;
    }

    if (profile?.status === 'pending' || profile?.status === 'rejected') {
        return <Navigate to="/pending-approval" replace />;
    }

    if (profile?.status !== 'approved') {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
