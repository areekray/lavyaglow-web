import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

export function CartIcon() {
  const { state: cart } = useCart();
  
  return (
    <Link to="/cart" className="cart-icon">
      <button 
        className="header-luxury__header-btn"
        // onClick={handleBackButton}
        aria-label="Back button"
      >
        <ShoppingBagIcon style={{ width: 20, height: 20 }}/>
      </button>
      {/* <span className="cart-icon__symbol">🛒</span> */}
      {cart.totalItems > 0 && (
        <span className="cart-icon__badge">{cart.totalItems}</span>
      )}
      {/* <span className="cart-icon__text">Cart</span> */}
    </Link>
  );
}
