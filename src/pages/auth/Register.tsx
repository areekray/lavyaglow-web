import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface RegisterForm {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export function Register() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>();
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    try {
      const result = await signUp(data.email, data.password, {
        full_name: data.full_name,
        phone: data.phone
      });
      
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Registration successful! Please check your email to confirm your account.');
        navigate('/auth/login');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <div style={{ 
      padding: '4rem 0', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      backgroundColor: '#1a1612'
    }}>
      <div className="container">
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="auth-form__header">
            <h1>Create Account</h1>
            <p>Join the LavyaGlow community</p>
          </div>

          <Input
            label="Full Name"
            placeholder="Your full name"
            error={errors.full_name?.message}
            {...register('full_name', { required: 'Full name is required' })}
          />

          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Invalid email address'
              }
            })}
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+91 9876543210"
            error={errors.phone?.message}
            {...register('phone', {
              pattern: {
                value: /^[\+]?[1-9][\d]{0,15}$/,
                message: 'Please enter a valid phone number'
              }
            })}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Your password"
            error={errors.password?.message}
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match'
            })}
          />

          <Button 
            type="submit" 
            variant="primary"
            fullWidth
            loading={loading}
            style={{ marginTop: '1rem' }}
          >
            Create Account
          </Button>

          <div className="auth-form__footer">
            <p>
              Already have an account?{' '}
              <Link to="/auth/login">Sign in here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
