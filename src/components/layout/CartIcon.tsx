import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';

export function CartIcon() {
  const { state: cart } = useCart();
  
  return (
    <Link to="/cart" className="cart-icon">
      <span className="cart-icon__symbol">🛒</span>
      {cart.totalItems > 0 && (
        <span className="cart-icon__badge">{cart.totalItems}</span>
      )}
      {/* <span className="cart-icon__text">Cart</span> */}
    </Link>
  );
}
