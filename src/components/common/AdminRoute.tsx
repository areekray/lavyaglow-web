import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
  requireStaffOnly?: boolean; // Allow staff access too
}

export function AdminRoute({ children, requireStaffOnly = false }: AdminRouteProps) {
  const { user, isAdmin, isStaff, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1a1612',
        color: '#e8e3d8'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '2px solid #3d2317',
            borderTop: '2px solid #e8e3d8',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate 
        to="/auth/login" 
        state={{ from: location, message: 'Please log in to access this area' }} 
        replace 
      />
    );
  }

  // Check permissions based on route requirements
  const hasPermission = requireStaffOnly ? (isAdmin || isStaff) : isAdmin;

  if (!hasPermission) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1a1612',
        color: '#e8e3d8',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div>
          <h1 style={{
            color: '#e8e3d8',
            marginBottom: '1rem',
            fontFamily: 'Proza Libre'
          }}>
            Access Denied
          </h1>
          <p style={{ marginBottom: '1rem' }}>
            {requireStaffOnly 
              ? "You need admin or staff privileges to access this area."
              : "You need admin privileges to access this area."
            }
          </p>
          <p style={{ marginBottom: '2rem', fontSize: '0.9rem', color: '#a39485' }}>
            Current role: {isAdmin ? 'Admin' : isStaff ? 'Staff' : 'Customer'}
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              backgroundColor: '#e8e3d8',
              color: '#1a1612',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
