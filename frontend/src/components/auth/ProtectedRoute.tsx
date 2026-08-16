import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PageLoader } from '../common/PageLoader';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <div className="p-4 text-red-600">Access Denied: Please log in.</div>;

  return <>{children}</>;
};
