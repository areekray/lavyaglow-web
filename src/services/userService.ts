import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  is_admin: boolean;
  is_staff: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export const userService = {
  // Get all customers (non-admin, non-staff)
  async getCustomers(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          phone,
          is_admin,
          is_staff,
          created_at,
          updated_at
        `)
        .eq('is_admin', false)
        .eq('is_staff', false)
        .order('full_name');

      if (error) throw error;

      // Get emails from auth.users for each profile
      const profilesWithEmails = await Promise.all(
        data.map(async (profile) => {
          const { data: user } = await supabase.auth.admin.getUserById(profile.id);
          return {
            ...profile,
            email: user.user?.email || '',
            role: 'Customer'
          };
        })
      );

      return profilesWithEmails;
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  },

  // Get all employees (admin or staff)
  async getEmployees(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          phone,
          is_admin,
          is_staff,
          created_at,
          updated_at
        `)
        .or('is_admin.eq.true,is_staff.eq.true')
        .order('full_name');

      if (error) throw error;

      // Get emails from auth.users for each profile
      const profilesWithEmails = await Promise.all(
        data.map(async (profile) => {
          const { data: user } = await supabase.auth.admin.getUserById(profile.id);
          return {
            ...profile,
            email: user.user?.email || '',
            role: profile.is_admin ? 'Administrator' : 'Staff'
          };
        })
      );

      return profilesWithEmails;
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  },

  // Alternative method using a single query with email join
  async getAllUsersWithRoles(): Promise<{ customers: UserProfile[], employees: UserProfile[] }> {
    try {
      // This approach uses a database function to get users with emails
      // You can create a view or use RPC for better performance
      const { data, error } = await supabase
        .rpc('get_users_with_emails');

      if (error) throw error;

      const customers = data
        .filter((user: any) => !user.is_admin && !user.is_staff)
        .map((user: any) => ({ ...user, role: 'Customer' }));

      const employees = data
        .filter((user: any) => user.is_admin || user.is_staff)
        .map((user: any) => ({
          ...user,
          role: user.is_admin ? 'Administrator' : 'Staff'
        }));

      return { customers, employees };
    } catch (error) {
      console.error('Error fetching users with roles:', error);
      return { customers: [], employees: [] };
    }
  }
};
