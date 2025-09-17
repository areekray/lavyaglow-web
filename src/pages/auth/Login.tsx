import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface LoginForm {
  email: string;
  password: string;
}

export function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const { signIn, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect URL from state, default to home
  const from = location.state?.from?.pathname || '/';
  const message = location.state?.message;

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await signIn(data.email, data.password);
      
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Welcome back to LavyaGlow!');
        // Redirect to the page they were trying to access, or home
        navigate(from, { replace: true });
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
            <h1>Sign In</h1>
            <p>Welcome back to LavyaGlow</p>
            {message && (
              <div style={{
                backgroundColor: 'rgba(193, 120, 23, 0.1)',
                border: '1px solid #c17817',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                marginTop: '1rem',
                color: '#c17817',
                fontSize: '0.875rem'
              }}>
                {message}
              </div>
            )}
          </div>

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
            label="Password"
            type="password"
            placeholder="Your password"
            error={errors.password?.message}
            {...register('password', { 
              required: 'Password is required'
            })}
          />

          <Button 
            type="submit" 
            variant="primary"
            fullWidth
            loading={loading}
            style={{ marginTop: '1rem' }}
          >
            Sign In
          </Button>

          <div className="auth-form__footer">
            <p>
              Don't have an account?{' '}
              <Link to="/auth/register">Create one here</Link>
            </p>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#a39485' }}>
              Demo Accounts:<br />
              Admin: saheli.kolkata@gmail.com<br />
              Staff: areek26@gmail.com
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
