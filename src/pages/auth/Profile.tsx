import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface ProfileForm {
  full_name: string;
  phone: string;
}

export function Profile() {
  const { user, updateProfile, loading } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    defaultValues: {
      full_name: user?.full_name || '',
      phone: user?.phone || ''
    }
  });

  const onSubmit = async (data: ProfileForm) => {
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading__spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return <div>Please log in to view your profile</div>;
  }

  return (
    <div style={{ 
      padding: '4rem 0', 
      minHeight: '100vh',
      backgroundColor: '#2c1810'
    }}>
      <div className="container">
        <div className="auth-form" style={{ maxWidth: '600px' }}>
          <div className="auth-form__header">
            <h1>Profile Settings</h1>
            <p>Manage your account information</p>
          </div>

          {/* Role Information */}
          <div style={{
            backgroundColor: '#3d2317',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '2rem',
            border: '1px solid #4a2e1a'
          }}>
            <h3 style={{ color: '#c17817', marginBottom: '0.5rem' }}>Account Information</h3>
            <p style={{ margin: '0.25rem 0' }}>Email: <strong>{user.email}</strong></p>
            <p style={{ margin: '0.25rem 0' }}>
              Role: <strong style={{ 
                color: user.isAdmin ? '#4ade80' : user.isStaff ? '#60a5fa' : '#e8e3d8' 
              }}>
                {user.isAdmin ? 'Administrator' : user.isStaff ? 'Staff Member' : 'Customer'}
              </strong>
            </p>
            <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#a39485' }}>
              Member since: {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Full Name"
              placeholder="Your full name"
              error={errors.full_name?.message}
              {...register('full_name', { required: 'Full name is required' })}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 9876543210"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Button 
              type="submit" 
              variant="primary"
              fullWidth
              loading={isSubmitting}
              style={{ marginTop: '1rem' }}
            >
              Update Profile
            </Button>
          </form>

          {(user.isAdmin || user.isStaff) && (
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: 'rgba(193, 120, 23, 0.1)',
              border: '1px solid #c17817',
              borderRadius: '0.5rem'
            }}>
              <h4 style={{ color: '#c17817', marginBottom: '0.5rem' }}>
                {user.isAdmin ? 'Admin' : 'Staff'} Note
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#c9beb0' }}>
                Role assignments can only be modified through the Supabase dashboard by administrators.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
