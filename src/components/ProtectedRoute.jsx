import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from './ui/LoadingSpinner';

export default function ProtectedRoute() {
  const { user, loading, authError } = useAuth();
  const location = useLocation();

  // Show error toast if there's an auth error
  useEffect(() => {
    if (authError && !loading) {
      toast.error('Session expired. Please log in again.');
    }
  }, [authError, loading]);

  // Show loading state while checking auth status
  if (loading) {
    return (
      <div className="full-page-center">
        <LoadingSpinner />
        <p>Checking authentication...</p>
      </div>
    );
  }

  // If user exists, render child routes via Outlet
  if (user) {
    return <Outlet />;
  }

  // If no user and not loading, redirect to home
  return (
    <Navigate 
      to="/" 
      replace
      state={{ 
        from: location.pathname,
        reason: 'unauthenticated'
      }}
    />
  );
}