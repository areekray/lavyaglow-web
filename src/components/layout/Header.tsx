import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CartIcon } from './CartIcon';
import { useAuthModal } from '@/contexts/AuthModalContext';

export function Header() {
  const { user, signOut, isAdmin, isStaff } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();

  const handleSignOut = () => {
    signOut();
    setIsMobileMenuOpen(false); // Close menu after sign out
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false); // Close menu when link is clicked
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleBackButton = () => {
    navigate(-1);
  }

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="header-luxury">
        <div className="header-luxury__container">
          {/* Mobile Menu Button */}
          {location.pathname !== '/' && <button 
            className="header-luxury__back-btn"
            onClick={handleBackButton}
            aria-label="Back button"
          >
            ←
          </button>}
          <button 
            className="header-luxury__menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className={`header-luxury__menu-icon ${isMobileMenuOpen ? 'header-luxury__menu-icon--open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {/* Desktop Left Navigation */}
          <nav className="header-luxury__nav header-luxury__nav--left">
            <Link to="/products" className="header-luxury__link">Shop</Link>
            <Link to="/about" className="header-luxury__link">About Us</Link>
            <Link to="/contact" className="header-luxury__link">Contact Us</Link>
            <Link to="/faq" className="header-luxury__link">FAQ</Link>
          </nav>

          {/* Logo */}
          <Link to="/" className="header-luxury__logo" onClick={handleLinkClick}>
            <div className="header-luxury__logo-container">
              <img 
                src="/pwa-512x512.png" 
                alt="LavyaGlow Logo" 
                className="header-luxury__logo-icon"
              />
            </div>
          </Link>

          {/* Desktop Right Navigation */}
          <nav className="header-luxury__nav header-luxury__nav--right">          
            {user ? (
              <>
                {(isAdmin || isStaff) && (
                  <Link to="/admin" className="header-luxury__link">
                    {isAdmin ? 'Admin Panel' : 'Dashboard'}
                  </Link>
                )}
                
                <Link to="/profile" className="header-luxury__link">Account</Link>
                
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
              <button className="header-luxury__link header-luxury__link--button" onClick={() => openLogin()}>Account</button>
            )}
            
            <CartIcon />
          </nav>

          {/* Mobile Cart Icon */}
          <div className="header-luxury__mobile-cart">
            <CartIcon />
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div className={`header-luxury__mobile-menu ${isMobileMenuOpen ? 'header-luxury__mobile-menu--open' : ''}`}>
        <div className="header-luxury__mobile-menu-overlay" onClick={toggleMobileMenu}></div>
        
        <nav className="header-luxury__mobile-menu-content">
          <div className="header-luxury__mobile-menu-header">
            <h2 className="header-luxury__mobile-menu-title">Menu</h2>
            <button 
              className="header-luxury__mobile-menu-close"
              onClick={toggleMobileMenu}
              aria-label="Close mobile menu"
            >
              <span>×</span>
            </button>
          </div>

          <div className="header-luxury__mobile-menu-links">
            <Link to="/products" className="header-luxury__mobile-link" onClick={handleLinkClick}>
              Shop
            </Link>
            <Link to="/about" className="header-luxury__mobile-link" onClick={handleLinkClick}>
              About Us
            </Link>
            <Link to="/contact" className="header-luxury__mobile-link" onClick={handleLinkClick}>
              Contact Us
            </Link>
            <Link to="/faq" className="header-luxury__mobile-link" onClick={handleLinkClick}>
              FAQ
            </Link>

            {/* Mobile User Navigation */}
            {user ? (
              <>
                {(isAdmin || isStaff) && (
                  <Link to="/admin" className="header-luxury__mobile-link" onClick={handleLinkClick}>
                    {isAdmin ? 'Admin Panel' : 'Dashboard'}
                  </Link>
                )}
                
                <Link to="/profile" className="header-luxury__mobile-link" onClick={handleLinkClick}>
                  Account
                </Link>
                
                {(isAdmin || isStaff) && (
                  <div className="header-luxury__mobile-role-badge">
                    {isAdmin ? 'Admin' : 'Staff'}
                  </div>
                )}
                
                <button 
                  onClick={handleSignOut}
                  className="header-luxury__mobile-link header-luxury__mobile-link--button"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button className="header-luxury__mobile-link header-luxury__mobile-link--button" onClick={() => openLogin()}>
                Account
              </button>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
