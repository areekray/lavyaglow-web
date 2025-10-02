import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext'; // UNCOMMENT THIS
import { Button } from '@/components/ui/Button';
import type { CheckoutFormData } from '@/pages/checkout/Checkout';
import toast from 'react-hot-toast';
import RazorpayWidget from '../layout/RazorpayWidget';

export function Payment() {
  const { getValues } = useFormContext<CheckoutFormData>();
  const { initializePayment, loading, paymentStatus } = useRazorpay();
  const { state: cartState } = useCart();
  const { user } = useAuth(); // UNCOMMENT THIS - needed for user validation
  
  const [specialRequest, setSpecialRequest] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // const formData = watch();

  const handlePayNow = async () => {
    // ADD USER CHECK
    if (!user) {
      toast.error('Please sign in to complete your order');
      return;
    }

    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    // ADD FORM VALIDATION
    const checkoutData = getValues();
    
    // Validate required fields
    if (!checkoutData.delivery?.fullName || !checkoutData.delivery?.address || 
        !checkoutData.delivery?.city || !checkoutData.delivery?.state || 
        !checkoutData.delivery?.zipCode || !checkoutData.delivery?.phone) {
      toast.error('Please fill in all required delivery address fields');
      return;
    }

    const paymentData = {
      deliveryAddress: checkoutData.delivery,
      billingAddress: checkoutData.billing,
      specialRequest: specialRequest.trim() || undefined,
      giftMessage: giftMessage.trim() || undefined
    };

    console.log('Initiating payment with data:', paymentData); // ADD LOGGING

    const result = await initializePayment(paymentData);
    
    if (!result.success) {
      console.error('Payment initialization failed:', result.error);
      // Error is already handled in the hook with toast
    }
  };

  console.log('import.meta.env.VITE_RAZORPAY_KEY_ID', import.meta.env.VITE_RAZORPAY_KEY_ID)

  return (
    <div className="payment">
      <div className="section-header">
        <h2>Complete Your Order</h2>
        {/* <p>Review your order and make secure payment</p> */}
      </div>

      <div className="payment-container">
        {/* Order Summary */}
        <div className="payment-summary">

          <div className="summary-totals">
            
            <div className="total-row final">
              <strong>Total Amount</strong>
              <strong>₹{cartState.totalPrice.toLocaleString()}</strong>
            </div>
            <div className="total-row">
              <span>Items ({cartState.totalItems})</span>
              <span>₹{(cartState.totalPrice + cartState.totalSavings).toLocaleString()}</span>
            </div>
            {cartState.totalSavings > 0 && (
              <div className="total-row savings">
                <span>You Save</span>
                <span>-₹{cartState.totalSavings.toLocaleString()}</span>
              </div>
            )}
            <div className="total-row">
              <span>Shipping</span>
              <span className="free">FREE</span>
            </div>
          </div>
          
          
          <div className="summary-items">
            {cartState.items.map((item) => (
              <div key={item.id} className="summary-item">
                <img 
                  src={item.product.images?.[0] || '/default-candle.jpg'} 
                  alt={item.product.name}
                  className="item-image"
                />
                <div className="item-details">
                  <h4>{item.product.name}</h4>
                  <p className="item-meta">
                    {item.purchaseType === 'set' 
                      ? `Set of ${item.breakdown.breakdown?.[0]?.setSize || item.quantity}` 
                      : 'Individual'
                    } × {item.quantity}
                  </p>
                  {item.selectedColor && (
                    <p className="item-meta">Color: {item.selectedColor}</p>
                  )}
                </div>
                <div className="item-price">
                  <span className="current-price">₹{item.breakdown.totalPrice.toLocaleString()}</span>
                  {item.breakdown.savings > 0 && (
                    <span className="original-price">₹{(item.breakdown.totalPrice + item.breakdown.savings).toLocaleString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Special Requests */}
        <div className="special-requests">          
          <div className="request-field">
            <label>Special Instructions (Optional)</label>
            <textarea
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              placeholder="Any special delivery instructions, packaging requests, or other notes..."
              rows={3}
              maxLength={500}
            />
            <small>{specialRequest.length}/500 characters</small>
          </div>

          <div className="request-field">
            <label>Gift Message (Optional)</label>
            <textarea
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              placeholder="Add a personalized gift message for the recipient..."
              rows={2}
              maxLength={200}
            />
            <small>{giftMessage.length}/200 characters</small>
          </div>
        </div>

        <RazorpayWidget paymentMode={true} />
        {/* Delivery Address Preview */}
        {/* <div className="address-preview">
          <div className="address-card">
            <strong>{formData.delivery?.fullName}</strong>
            {formData.delivery?.company && <div>{formData.delivery.company}</div>}
            <div>{formData.delivery?.address + ' ' + formData.delivery?.apartment}</div>
            {formData.delivery?.apartment && <div>{formData.delivery.apartment}</div>}
            <div>{formData.delivery?.city}, {formData.delivery?.state} {formData.delivery?.zipCode}</div>
            <div>📱 {formData.delivery?.phone}</div>
          </div>
        </div> */}
        {/* Terms and Conditions */}
        <div className="terms-section">
          <label className="terms-checkbox">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            <span className="checkmark"></span>
            <span className="terms-text">
              I agree to the{' '}
              <a href="/terms" target="_blank" className="terms-link">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" className="terms-link">Privacy Policy</a>
            </span>
          </label>
        </div>

        {/* Payment Button */}
        <div className="payment-actions">
          <Button
            onClick={handlePayNow}
            loading={loading}
            disabled={!acceptedTerms || !user || paymentStatus === 'processing'} // ADD USER CHECK
            size="lg"
            fullWidth
            className="btn btn--primary btn--lg btn--full"
          >
            {loading ? (
              <>
                <div className="payment-spinner" />
                Processing Payment...
              </>
            ) : !user ? ( // ADD USER STATE CHECK
              <>
                Please Sign In
              </>
            ) : (
              <>
                Pay ₹{cartState.totalPrice.toLocaleString()}
              </>
            )}
          </Button>
        </div>

        {/* Payment Status */}
        {paymentStatus === 'failed' && (
          <div className="payment-status error">
            ❌ Payment failed. Please try again or contact support.
          </div>
        )}
        
        {paymentStatus === 'success' && (
          <div className="payment-status success">
            ✅ Payment successful! Redirecting to order confirmation...
          </div>
        )}

        {/* USER STATUS WARNING */}
        {!user && (
          <div className="payment-status warning">
            ⚠️ Please sign in to complete your order
          </div>
        )}
      </div>
    </div>
  );
}
