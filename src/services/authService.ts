import { supabase } from './supabase';
import type { User } from '@/types';

export const authService = {
  async signUp(email: string, password: string, userData: { full_name: string; phone?: string }) {
    try {
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

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) return null;

      // Get profile data with roles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        // Fallback to user metadata if profile doesn't exist yet
        return {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || null,
          phone: user.user_metadata?.phone || null,
          isAdmin: user.user_metadata?.is_admin || false,
          isStaff: user.user_metadata?.is_staff || false,
          created_at: user.created_at || new Date().toISOString(),
          updated_at: user.updated_at || new Date().toISOString()
        };
      }

      return {
        id: profile.id,
        email: user.email || '',
        full_name: profile.full_name,
        phone: profile.phone,
        isAdmin: profile.is_admin,
        isStaff: profile.is_staff,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      }
    });
  }
};
