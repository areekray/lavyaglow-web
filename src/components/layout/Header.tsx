import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CartIcon } from './CartIcon';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { ArrowLeftIcon, ArrowRightEndOnRectangleIcon, Bars3Icon, DevicePhoneMobileIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { InstallPwaModal } from '@/components/pwa/InstallPwaModal';
import { isStandalone, useInstalledState } from '@/utils/detectPlatform';

export function Header() {
  const { user, signOut, isAdmin, isStaff, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();
  const [openPwaModal, setOpenPwaModal] = useState(false);
  const installed = useInstalledState();
  const standalone = useMemo(() => isStandalone(), []);

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
          {location.pathname !== "/" && (
            <button
              className="header-luxury__mobile-btn"
              onClick={handleBackButton}
              aria-label="Back button"
            >
              <ArrowLeftIcon style={{ width: 20, height: 20 }} />
            </button>
          )}
          <button
            className="header-luxury__mobile-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Bars3Icon style={{ width: 25, height: 25 }} />
            {/* <span
              className={`header-luxury__menu-icon ${
                isMobileMenuOpen ? "header-luxury__menu-icon--open" : ""
              }`}
            >
              <span></span>
              <span></span>
              <span></span>
            </span> */}
          </button>
          {location.pathname === "/" && !installed && !standalone && (
            <button
              className="header-luxury__mobile-btn"
              onClick={() => setOpenPwaModal(true)}
              aria-label="Back button"
            >
              <DevicePhoneMobileIcon style={{ width: 20, height: 20 }} />
            </button>
          )}
          {/* Desktop Left Navigation */}
          <nav className="header-luxury__nav header-luxury__nav--left">
            <Link to="/products" className="header-luxury__link">
              Shop
            </Link>
            <Link to="/about" className="header-luxury__link">
              About Us
            </Link>
            <Link to="/contact" className="header-luxury__link">
              Contact Us
            </Link>
            <Link to="/faq" className="header-luxury__link">
              FAQ
            </Link>
          </nav>

          {/* Logo */}
          <Link
            to="/"
            className="header-luxury__logo"
            onClick={handleLinkClick}
          >
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
                    {isAdmin ? "Admin Panel" : "Dashboard"}
                  </Link>
                )}

                <Link to="/profile" className="header-luxury__link">
                  Profile
                </Link>

                {(isAdmin || isStaff) && (
                  <span className="header-luxury__role-badge">
                    {isAdmin ? "Admin" : "Staff"}
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
              <button
                className="header-luxury__link header-luxury__link--button"
                onClick={() => openLogin()}
              >
                Sign In
              </button>
            )}
            <CartIcon />
          </nav>

          {/* Mobile Cart Icon */}
          <div className="header-luxury__mobile-cart">
            {loading ? (
              <button
                className="header-luxury__mobile-btn"
                // onClick={handleBackButton}
                aria-label="Back button"
              >
              <div className="loading__spinner" style={{ width: 20, height: 20, marginBottom: 0 }}></div></button>
            ) : !user ? (
              <button
                className="header-luxury__mobile-btn"
                // onClick={handleBackButton}
                aria-label="Back button"
                onClick={() => openLogin()}
              >
                <ArrowRightEndOnRectangleIcon style={{ width: 20, height: 20 }} />
              </button>
            ) : (
              <button
                className="header-luxury__mobile-btn"
                onClick={() => navigate('/profile')}
                aria-label="Back button"
              >
                <UserIcon style={{ width: 20, height: 20 }} />
              </button>
            )}
            <CartIcon />
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div
        className={`header-luxury__mobile-menu ${
          isMobileMenuOpen ? "header-luxury__mobile-menu--open" : ""
        }`}
      >
        <div
          className="header-luxury__mobile-menu-overlay"
          onClick={toggleMobileMenu}
        ></div>

        <nav className="header-luxury__mobile-menu-content">
          <div className="header-luxury__mobile-menu-header">
            <div className="header-luxury__logo-container">
              <img
                src="/pwa-512x512.png"
                alt="LavyaGlow Logo"
                className="header-luxury__logo-icon"
              />
            </div>
            <button
              className="header-luxury__mobile-menu-close"
              onClick={toggleMobileMenu}
              aria-label="Close mobile menu"
            >
              <XMarkIcon style={{ height: '2rem', width: '2rem' }} />
            </button>
          </div>

          <div className="header-luxury__mobile-menu-links">
            <Link
              to="/products"
              className="header-luxury__mobile-link"
              onClick={handleLinkClick}
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="header-luxury__mobile-link"
              onClick={handleLinkClick}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="header-luxury__mobile-link"
              onClick={handleLinkClick}
            >
              Contact Us
            </Link>
            <Link
              to="/faq"
              className="header-luxury__mobile-link"
              onClick={handleLinkClick}
            >
              FAQ
            </Link>

            {/* Mobile User Navigation */}
            {user ? (
              <>
                {(isAdmin || isStaff) && (
                  <Link
                    to="/admin"
                    className="header-luxury__mobile-link"
                    onClick={handleLinkClick}
                  >
                    {isAdmin ? "Admin Panel" : "Dashboard"}
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="header-luxury__mobile-link"
                  onClick={handleLinkClick}
                >
                  Profile {(isAdmin ? '(Admin)' : isStaff ? '(Staff)' : '')}
                </Link>

                <button
                  onClick={handleSignOut}
                  className="header-luxury__mobile-link header-luxury__mobile-link--button"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                className="header-luxury__mobile-link header-luxury__mobile-link--button"
                onClick={() => openLogin()}
              >
                Sign In
              </button>
            )}
          </div>
          <div className="header-luxury__mobile-menu-contact">
            <a
              className="btn btn--luxury btn--lg"
              href="https://wa.me/+919036758208?text=Hi%20LavyaGlow%20Team%20(from%20App)"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img style={{marginRight: '0.5rem'}}
                src="https://fajpirmuqtbewsebwkhv.supabase.co/storage/v1/object/public/misc/WhatsApp.svg"
                alt="WhatsApp"
                className="contact-page__icon"
                loading="lazy"
              />
              WhatsApp
            </a>

            <a
              className="btn btn--luxury btn--lg"
              href="https://instagram.com/lavyaglow"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img style={{marginRight: '0.5rem'}}
                src="https://fajpirmuqtbewsebwkhv.supabase.co/storage/v1/object/public/misc/Instagram_logo.svg"
                alt="Instagram"
                className="contact-page__icon"
                loading="lazy"
              />
              Instagram
            </a>
        </div>
        </nav>
      </div>
      
          {openPwaModal && <InstallPwaModal open={openPwaModal} onClose={() => setOpenPwaModal(false)} />}
    </>
  );
}
