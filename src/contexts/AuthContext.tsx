import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthContextType, User } from '@/types';
import { supabase } from '@/services/supabase';
import { useCart } from './CartContext';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { setUser: setCartUser } = useCart();

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | undefined = undefined;

    // Function to safely update state only if component is mounted
    const safeSetState = (updater: () => void) => {
      if (isMounted) {
        updater();
      }
    };

    // Get initial user with timeout protection
    const getInitialUser = async () => {
      try {
        // Add timeout to prevent hanging
        const userPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 10000)
        );

        const { data, error } = await Promise.race([userPromise, timeoutPromise]) as any;
        
        if (!isMounted) return;

        if (error) {
          console.error('Auth error:', error);
          safeSetState(() => {
            setUser(null);
            setCartUser(undefined);
            setLoading(false);
          });
          return;
        }

        if (data?.user) {
          const userProfile = await fetchUserProfile(data.user);
          safeSetState(() => {
            setUser(userProfile);
            setCartUser(userProfile?.id);
            setLoading(false);
          });
        } else {
          safeSetState(() => {
            setUser(null);
            setCartUser(undefined);
            setLoading(false);
          });
        }
      } catch (error) {
        console.error('Initial auth check failed:', error);
        safeSetState(() => {
          setUser(null);
          setCartUser(undefined);
          setLoading(false);
        });
      }
    };

    // Get initial user
    getInitialUser();

    // Auth state change listener - CRITICAL: Use setTimeout to avoid deadlocks
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? 'session exists' : 'no session');
      
      // IMPORTANT: Use setTimeout to prevent deadlocks as per Supabase docs
      setTimeout(async () => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT') {
          safeSetState(() => {
            setUser(null);
            setCartUser(undefined);
            setLoading(false);
          });
          return;
        }

        if (session?.user) {
          try {
            const userProfile = await fetchUserProfile(session.user);
            safeSetState(() => {
              setUser(userProfile);
              setCartUser(userProfile?.id);
              setLoading(false);
            });
          } catch (error) {
            console.error('Error fetching user profile:', error);
            safeSetState(() => {
              setUser(null);
              setCartUser(undefined);
              setLoading(false);
            });
          }
        } else {
          safeSetState(() => {
            setUser(null);
            setCartUser(undefined);
            setLoading(false);
          });
        }
      }, 0); // This setTimeout is crucial to prevent deadlocks
    });

    // Cleanup function
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to fetch user profile
  const fetchUserProfile = async (authUser: any): Promise<User | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error);
        // Fall back to auth user metadata
      }

      return {
        id: authUser.id,
        email: authUser.email || '',
        full_name: profile?.full_name || authUser.user_metadata?.full_name || '',
        phone: profile?.phone || authUser.user_metadata?.phone || '',
        isAdmin: profile?.is_admin || false,
        isStaff: profile?.is_staff || false,
        created_at: profile?.created_at || authUser.created_at || new Date().toISOString(),
        updated_at: profile?.updated_at || authUser.updated_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('fetchUserProfile error:', error);
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setLoading(false);
        return { data: null, error };
      }

      // User will be set via onAuthStateChange
      return { data, error: null };
    } catch (error: any) {
      setLoading(false);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            phone: userData.phone || null
          }
        }
      });

      setLoading(false);
      return { data, error };
    } catch (error: any) {
      setLoading(false);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // User will be set to null via onAuthStateChange
    } catch (error) {
      console.error('Sign out error:', error);
      setLoading(false);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Refresh user data
      const updatedUser = await fetchUserProfile(user);
      if (updatedUser) {
        setUser(updatedUser);
        setCartUser(updatedUser.id);
      };
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      isAdmin: user?.isAdmin || false,
      isStaff: user?.isStaff || false
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
