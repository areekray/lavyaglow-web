import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export function AuthModal() {
  const { 
    isOpen, 
    mode, 
    initialEmail, 
    redirectPath, 
    message,
    switchToLogin, 
    switchToRegister, 
    close 
  } = useAuthModal();
  
  const { signIn, signUp, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form
  const loginForm = useForm<LoginForm>({
    defaultValues: {
      email: initialEmail || '',
      password: ''
    }
  });

  // Register form
  const registerForm = useForm<RegisterForm>({
    defaultValues: {
      email: initialEmail || '',
      full_name: '',
      phone: '',
      password: '',
      confirmPassword: ''
    }
  });

  // Update email when initialEmail changes
  useEffect(() => {
    if (initialEmail) {
      loginForm.setValue('email', initialEmail);
      registerForm.setValue('email', initialEmail);
    }
  }, [initialEmail, loginForm, registerForm]);

  // Reset forms when mode changes
  useEffect(() => {
    if (mode === 'login') {
      loginForm.reset({ email: initialEmail || '', password: '' });
    } else {
      registerForm.reset({ 
        email: initialEmail || '', 
        full_name: '', 
        phone: '', 
        password: '', 
        confirmPassword: '' 
      });
    }
  }, [mode, initialEmail, loginForm, registerForm]);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      
      if (result.error) {
        toast.error(result.error.message);
      } else {
        // The redirect will happen automatically
        // onAuthStateChange will handle the success state
        toast.success('Redirecting to Google...');
      }
    } catch (error) {
      toast.error('Failed to sign in with Google. Please try again.');
    }
  };

  // Handle login submission
  const onLoginSubmit = async (data: LoginForm) => {
    try {
      const result = await signIn(data.email, data.password);
      
      if (result.error) {
        // Check if user doesn't exist
        if (result.error.message?.includes('Email not confirmed')) {
          toast.error('Account not found. Would you like to create one?');
          // Auto-switch to register with email populated
        //   switchToRegister(data.email);
          return;
        }
        toast.error('Invalid email/password. If you donot have a account, please create one!');
      } else {
        toast.success('Welcome back to LavyaGlow!');
        close();
        
        // Redirect if specified
        if (redirectPath) {
          navigate(redirectPath, { replace: true });
        }
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  // Handle register submission
  const onRegisterSubmit = async (data: RegisterForm) => {
    try {
      const result = await signUp(data.email, data.password, {
        full_name: data.full_name,
        phone: data.phone
      });
      
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Account created! Please check your email to verify your account.');
        // Switch to login mode with email populated
        switchToLogin(data.email);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      close();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className={`auth-modal-overlay ${isOpen ? 'open' : ''}`}>
      {/* Backdrop */}
      <div className="auth-modal-backdrop" onClick={handleBackdropClick} />
      
      {/* Modal */}
      <div className={`auth-modal ${isOpen ? 'open' : ''}`}>
        {/* Close Button */}
        <button 
          className="auth-modal__close"
          onClick={close}
          aria-label="Close authentication modal"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        
        {/* Header */}
        <div className="auth-modal__header">
          <div className="brand-logo">
            <span className="brand-icon">🕯️</span>
            <span className="brand-name">LavyaGlow</span>
          </div>
          <h2 className="auth-modal__title">
            {mode === 'login' ? 'Welcome Back' : 'Join LavyaGlow'}
          </h2>
          <p className="auth-modal__subtitle">
            {mode === 'login' 
              ? 'Sign in to your account to continue shopping'
              : 'Create an account to start your candle journey'
            }
          </p>
          
          {/* Show message if provided */}
          {message && (
            <div className="auth-modal__message">
              {message}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="auth-modal__content">
           
              <div className="google-auth-section">
            <Button
                onClick={handleGoogleSignIn}
                variant="secondary"
                size="lg"
                fullWidth
                loading={loading}
                className="google-signin-btn"
                >
                <GoogleIcon />
                <span>Continue with Google</span>
                </Button>
                
                <div className="auth-divider">
                <span>or</span>
                </div>
            </div> 
          {mode === 'login' ? (
            // Login Form
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="auth-form">
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                error={loginForm.formState.errors.email?.message}
                {...loginForm.register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })}
              />

              <div className="password-field">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  error={loginForm.formState.errors.password?.message}
                  {...loginForm.register('password', { 
                    required: 'Password is required'
                  })}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 
                    <EyeSlashIcon className="w-5 h-5" /> : 
                    <EyeIcon className="w-5 h-5" />
                  }
                </button>
              </div>

              <Button 
                type="submit" 
                variant="luxury"
                size="lg"
                fullWidth
                loading={loading}
                className="auth-submit-btn"
              >
                Sign In
              </Button>
            </form>
          ) : (
            // Register Form
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="auth-form">
              <Input
                label="Full Name"
                placeholder="Your full name"
                error={registerForm.formState.errors.full_name?.message}
                {...registerForm.register('full_name', { required: 'Full name is required' })}
              />

              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                error={registerForm.formState.errors.email?.message}
                {...registerForm.register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })}
              />

              <Input
                label="Phone Number (Optional)"
                type="tel"
                placeholder="+91 9876543210"
                error={registerForm.formState.errors.phone?.message}
                {...registerForm.register('phone', {
                  pattern: {
                    value: /^[\+]?[1-9][\d]{0,15}$/,
                    message: 'Please enter a valid phone number'
                  }
                })}
              />

              <div className="password-field">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a secure password"
                  error={registerForm.formState.errors.password?.message}
                  {...registerForm.register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 
                    <EyeSlashIcon className="w-5 h-5" /> : 
                    <EyeIcon className="w-5 h-5" />
                  }
                </button>
              </div>

              <div className="password-field">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  error={registerForm.formState.errors.confirmPassword?.message}
                  {...registerForm.register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === registerForm.watch('password') || 'Passwords do not match'
                  })}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? 
                    <EyeSlashIcon className="w-5 h-5" /> : 
                    <EyeIcon className="w-5 h-5" />
                  }
                </button>
              </div>

              <Button 
                type="submit" 
                variant="luxury"
                size="lg"
                fullWidth
                loading={loading}
                className="auth-submit-btn"
              >
                Create Account
              </Button>
            </form>
          )}
          
        <div className="auth-modal__footer">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button 
                type="button"
                className="auth-switch-btn"
                onClick={() => switchToRegister(loginForm.getValues('email'))}
              >
                Create one here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button 
                type="button"
                className="auth-switch-btn"
                onClick={() => switchToLogin(registerForm.getValues('email'))}
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
        </div>

      </div>
    </div>,
    document.body
  );
}

// Google Icon Component
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
