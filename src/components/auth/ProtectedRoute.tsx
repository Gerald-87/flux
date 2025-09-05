import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Subscription check for vendors
  if (user.role === 'vendor' && user.subscriptionExpiry) {
    const expiryDate = new Date(user.subscriptionExpiry);
    if (expiryDate < new Date()) {
      if (location.pathname !== '/subscription') {
        return <Navigate to="/subscription" replace />;
      }
    }
  }

  return children;
}
