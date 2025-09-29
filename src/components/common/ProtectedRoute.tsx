import { type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { openLogin } = useAuthModal();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      openLogin({
        redirectPath: location.pathname,
        message: 'Please sign in to access this page'
      });
    }
  }, [user, loading, openLogin, location.pathname]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading__spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return user ? <>{children}</> : null;
}
