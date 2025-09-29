import { createContext, useContext, useState, type ReactNode } from 'react';

type AuthModalMode = 'login' | 'register';

interface AuthModalContextType {
  isOpen: boolean;
  mode: AuthModalMode;
  initialEmail?: string;
  redirectPath?: string;
  message?: string;
  openLogin: (options?: { 
    redirectPath?: string; 
    message?: string;
    initialEmail?: string;
  }) => void;
  openRegister: (options?: { 
    redirectPath?: string; 
    initialEmail?: string;
  }) => void;
  switchToLogin: (email?: string) => void;
  switchToRegister: (email?: string) => void;
  close: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthModalMode>('login');
  const [initialEmail, setInitialEmail] = useState<string | undefined>();
  const [redirectPath, setRedirectPath] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();

  const openLogin = (options?: { 
    redirectPath?: string; 
    message?: string;
    initialEmail?: string;
  }) => {
    setMode('login');
    setInitialEmail(options?.initialEmail);
    setRedirectPath(options?.redirectPath);
    setMessage(options?.message);
    setIsOpen(true);
  };

  const openRegister = (options?: { 
    redirectPath?: string; 
    initialEmail?: string;
  }) => {
    setMode('register');
    setInitialEmail(options?.initialEmail);
    setRedirectPath(options?.redirectPath);
    setMessage(undefined);
    setIsOpen(true);
  };

  const switchToLogin = (email?: string) => {
    setMode('login');
    setInitialEmail(email);
    setMessage(undefined);
  };

  const switchToRegister = (email?: string) => {
    setMode('register');
    setInitialEmail(email);
    setMessage(undefined);
  };

  const close = () => {
    setIsOpen(false);
    // Clear state after animation
    setTimeout(() => {
      setInitialEmail(undefined);
      setRedirectPath(undefined);
      setMessage(undefined);
    }, 300);
  };

  return (
    <AuthModalContext.Provider value={{
      isOpen,
      mode,
      initialEmail,
      redirectPath,
      message,
      openLogin,
      openRegister,
      switchToLogin,
      switchToRegister,
      close
    }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};
