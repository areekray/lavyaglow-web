import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export function OAuthCallback() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Small delay to ensure auth state is updated
    const timer = setTimeout(() => {
      if (user) {
        toast.success(`Welcome to LavyaGlow, ${user.full_name || user.email}!`);
        navigate('/', { replace: true });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  return (
    <div className="oauth-callback">
      <div className="loading-screen">
        <div className="loading__spinner"></div>
        <p>Completing sign in...</p>
      </div>
    </div>
  );
}
