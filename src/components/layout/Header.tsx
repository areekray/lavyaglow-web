import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CartIcon } from './CartIcon';

export function Header() {
  const { user, signOut, isAdmin, isStaff } = useAuth();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <header className="header-luxury">
      <div className="header-luxury__container">
        <nav className="header-luxury__nav header-luxury__nav--left">
          <Link to="/products" className="header-luxury__link">Shop</Link>
          <Link to="/about" className="header-luxury__link">About Us</Link>
          <Link to="/contact" className="header-luxury__link">Contact Us</Link>
          <Link to="/faq" className="header-luxury__link">FAQ</Link>
        </nav>

        <Link to="/" className="header-luxury__logo">
            <div className="header-luxury__logo-container">
                <img 
                src="/pwa-512x512.png" 
                alt="LavyaGlow Logo" 
                className="header-luxury__logo-icon"
                />
            </div>
        </Link>

        <nav className="header-luxury__nav header-luxury__nav--right">          
          {user ? (
            <>
              {/* Role-based navigation */}
                {(isAdmin || isStaff) && (
                <Link to="/admin" className="header-luxury__link">
                    {isAdmin ? 'Admin Panel' : 'Dashboard'}
                </Link>
                )}
                
                <Link to="/profile" className="header-luxury__link">Account</Link>
                
                {/* Role indicator badge (optional) */}
                {(isAdmin || isStaff) && (
                <span className="header-luxury__role-badge">
                    {isAdmin ? 'Admin' : 'Staff'}
                </span>
                )}
                
                <button 
                onClick={handleSignOut}
                className="header-luxury__link header-luxury__link--button"
                >
                Sign Out
                </button>
            </>
          ) : (
            <Link to="/auth/login" className="header-luxury__link">Account</Link>
          )}
          
          <CartIcon />
        </nav>
      </div>
    </header>
  );
}
