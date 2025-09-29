import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
// import { priceOptimizer } from "@/utils/priceOptimizer";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import { productService } from "@/services/productService";
// import { ImageWithPlaceholder } from "@/components/ui/ImageWithPlaceholder";
import { ProductCard } from "@/components/ui/ProductCard";
import { ColorChips } from "@/components/layout/ColorChips";
import { 
  XMarkIcon
} from '@heroicons/react/24/outline';
import { PercentBadgeIcon } from "@heroicons/react/16/solid";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthModal } from "@/contexts/AuthModalContext";

export function Cart() {
  const { state: cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { user } = useAuth();
  const { openLogin } = useAuthModal();
  const navigate = useNavigate();
  const handleProceedToCheckout = () => {
    if (!user) {
      openLogin({
        redirectPath: '/cart',
        message: 'First order gets 5% additional discount upto 50!'
      });
      return;
    }
    navigate('/checkout')
  }

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    setIsUpdating(itemId);

    try {
      // Add small delay for better UX
      const updatedProducts = await productService.getProducts();
      // await new Promise(resolve => setTimeout(resolve, 200));

      if (newQuantity === 0) {
        removeFromCart(itemId);
        toast.success("Item removed from cart");
      } else {
        const cartItem = cart.items.find((item) => item.id === itemId);
        const product = updatedProducts?.find(
          (data) => data.id === cartItem?.product?.id
        );
        if (!product) {
          throw new Error("Invalid product");
        }

        updateQuantity(itemId, newQuantity, updatedProducts);
        toast.success("Quantity updated");
      }
    } catch (error) {
      toast.error("Error updating cart");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = (itemId: string, productName: string) => {
    removeFromCart(itemId);
    toast.success(`${productName} removed from cart`);
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      clearCart();
      toast.success("Cart cleared");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalDiscount = () => {
    if (cart.totalOriginalPrice === 0) return 0;
    return Math.round((cart.totalSavings / cart.totalOriginalPrice) * 100);
  };

  if (cart.isLoading) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-loading">
            <div className="loading__spinner"></div>
            <p>Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-empty">
            <div className="cart-empty__content">
              <div className="cart-empty__icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>
                Discover our beautiful handcrafted candles and add some to your
                cart!
              </p>
              <div className="cart-empty__actions">
                <Link to="/products">
                  <Button variant="primary" size="lg">
                    Shop Now
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="secondary" size="md">
                    Browse Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Shopping Cart</span>
        </nav>

        <div className="cart-header">
          <h1 className="cart-title">Shopping Cart</h1>
          <div className="cart-header-info">
            <span className="cart-item-count">{cart.totalItems} items</span>
            <button
              onClick={handleClearCart}
              className="cart-clear-btn"
              disabled={cart.items.length === 0}
            >
              Clear Cart
            </button>
          </div>
        </div>

        <div className="cart-content">
          <div className="savings-highlight">
            <PercentBadgeIcon />
              You're saving <span>{formatCurrency(cart.totalSavings)}</span> with
              our smart pricing!
          </div>
          {/* Cart Items */}
          <div className="cart-items">
            {cart.items.map((item) => {
              const totalItemPrice = item.breakdown.totalPrice;
              const totalItemSavings = item.breakdown.savings;
              const totalItemOriginal = item.breakdown.originalPrice;
              const isUpdatingThis = isUpdating === item.id;

              console.log("Areek Item", item);

              return (
                <div key={item.id} className="cart-item">
                  <div className="cart-item__image">
                    <ProductCard product={item.product} smallVariant={true} />
                  </div>
                  {item.purchaseType === 'set' && (
                  <div className="product-card__featured-badge">
                    📦 Set of {item.product.price_sets?.find(s => s.id === item.setId)?.set_quantity} 
                  </div>)}
                  <button
                      onClick={() => handleRemoveItem(item.id, item.product.name)}
                      disabled={isUpdatingThis}
                      className="cart-item__remove"
                      aria-label="Remove item"
                    >
                      <XMarkIcon className="w-6 h-6"/>
                  </button>
                  {/* <div className="cart-item__details">
                    <h3 className="cart-item__name">{item.product.name}</h3>
                    <p className="cart-item__category">{item.product.category}</p>
                    
                    <div className="cart-item__purchase-info">
                      <div className="cart-item__purchase-type">
                        {item.purchaseType === 'set' ? (
                          <span className="purchase-type purchase-type--set">
                            📦 Set Purchase
                            {item.setId && (
                              <small>
                                {item.product.price_sets?.find(s => s.id === item.setId)?.set_quantity} pieces per set
                              </small>
                            )}
                          </span>
                        ) : (
                          <span className="purchase-type purchase-type--piece">
                            🔢 Individual Pieces
                          </span>
                        )}
                      </div>

                      <div className="cart-item__piece-info">
                        <span>Total pieces: {item.breakdown.totalPieces}</span>
                      </div>
                    </div>

                    {item.breakdown.isOptimized && (
                      <div className="cart-item__optimization">
                        <span className="optimization-badge">🎯 Optimized Pricing</span>
                        <small>{priceOptimizer.getBreakdownText(item.breakdown)}</small>
                      </div>
                    )}
                  </div> */}
                  <div className="cart-item__charateristics">
                    <div className="cart-item__quantity">
                      <label>Quantity:</label>
                      <div className="quantity-controls">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          disabled={isUpdatingThis || item.quantity <= 1}
                          className="quantity-btn"
                        >
                          -
                        </button>
                        <Input
                          type="number"
                          value={item.quantity.toString()}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              parseInt(e.target.value) || 0
                            )
                          }
                          min="1"
                          disabled={isUpdatingThis}
                          className="quantity-input"
                        />
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          disabled={isUpdatingThis}
                          className="quantity-btn"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {item.selectedColor && (
                      <div className="cart-item__quantity">
                        <label>Color:</label>
                        <div className="quantity-controls">
                          <ColorChips colors={item.selectedColor} />
                        </div>
                      </div>
                    )}

                    <div className="cart-item__pricing">
                      <label>Price:</label>
                      <div className="cart-item__price-breakdown">
                        <span className="price-line current">
                          {formatCurrency(totalItemPrice)}
                        </span>
                        {totalItemSavings > 0 && (
                          <small className="price-line original">
                            {formatCurrency(totalItemOriginal)}
                          </small>
                        )}
                        {totalItemSavings > 0 && (
                          <small className="price-line savings">
                            {formatCurrency(totalItemSavings)} OFF
                          </small>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* <div className="cart-item__actions">
                    <button
                      onClick={() => handleRemoveItem(item.id, item.product.name)}
                      disabled={isUpdatingThis}
                      className="remove-btn"
                      aria-label="Remove item"
                    >
                      {isUpdatingThis ? '...' : '🗑️'}
                    </button>
                  </div> */}
                </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div className="cart-summary">
            <div className="cart-summary__content">
              {/* <h3>Order Summary</h3> */}

              <div className="summary-breakdown">
                <div className="summary-line">
                  <span>Total MRP:</span>
                  <span>{formatCurrency(cart.totalOriginalPrice)}</span>
                </div>

                {cart.totalSavings > 0 && (
                  <div className="summary-line">
                    <span>Smart Savings:</span>
                    <span>-{formatCurrency(cart.totalSavings)}</span>
                  </div>
                )}

                <div className="summary-line shipping">
                  <span>Shipping:</span>
                  <span>FREE</span>
                </div>

                <div className="summary-line total">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(cart.totalPrice)}</span>
                </div>

                {cart.totalSavings > 0 && (
                  <div className="summary-line">
                    <span>Total Discount:</span>
                    <span>{getTotalDiscount()}%</span>
                  </div>
                )}
              </div>

              <div className="cart-summary__actions">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout
                </Button>

                <Link to="/products">
                  <Button variant="secondary" size="md" fullWidth>
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              {/* Bulk Order Info */}
              {/* <div className="bulk-order-info">
                <h4>📦 Need Bulk Orders?</h4>
                <p>For large quantities or custom requirements:</p>
                <div className="contact-links">
                  <a
                    href="https://wa.me/+919038644125"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📱 WhatsApp
                  </a>
                  <a
                    href="https://instagram.com/lavyaglow"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📷 Instagram
                  </a>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
