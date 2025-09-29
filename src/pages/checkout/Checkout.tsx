import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';
import { supabase } from '@/services/supabase';
import toast from 'react-hot-toast';
import { DeliveryAddress } from '@/components/checkout/DeliveryAddress';
import { BillingAddress } from '@/components/checkout/BillingAddress';
import { Payment } from '@/components/checkout/Payment';

export interface CheckoutFormData {
  // Delivery Address
  delivery: {
    fullName: string;
    company?: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    country: string;
    saveAddress: boolean;
  };
  
  // Billing Address
  billing: {
    sameAsDelivery: boolean;
    fullName?: string;
    company?: string;
    address?: string;
    apartment?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
    country?: string;
  };
  
  // Order Notes
  orderNotes?: string;
}

const STEPS = [
  { id: 'delivery', label: 'Delivery' },
  { id: 'billing', label: 'Billing' },
  { id: 'payment', label: 'Payment' }
];

export function Checkout() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { state: cartState, clearCart } = useCart();
  const { openLogin } = useAuthModal();
  const navigate = useNavigate();

  const methods = useForm<CheckoutFormData>({
    mode: 'onChange',
    defaultValues: {
      delivery: {
        fullName: user?.full_name || '',
        company: '',
        address: '',
        apartment: '',
        city: '',
        state: '',
        zipCode: '',
        phone: user?.phone || '',
        country: 'India',
        saveAddress: false
      },
      billing: {
        sameAsDelivery: true
      },
      orderNotes: ''
    }
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      openLogin({
        redirectPath: '/checkout',
        message: 'Please sign in to complete your order'
      });
    }
  }, [user, openLogin]);

  // Redirect to cart if no items
  useEffect(() => {
    if (!cartState.items.length) {
      navigate('/cart');
      toast.error('Your cart is empty');
    }
  }, [cartState.items, navigate]);

  const validateStep = async (stepIndex: number): Promise<boolean> => {
    let fieldsToValidate: string[] = [];
    
    switch (stepIndex) {
      case 0: // Delivery
        fieldsToValidate = [
          'delivery.fullName',
          'delivery.address', 
          'delivery.city',
          'delivery.state',
          'delivery.zipCode',
          'delivery.phone'
        ];
        break;
      case 1: // Billing
        if (!methods.getValues('billing.sameAsDelivery')) {
          fieldsToValidate = [
            'billing.fullName',
            'billing.address',
            'billing.city', 
            'billing.state',
            'billing.zipCode',
            'billing.phone'
          ];
        }
        break;
      case 2: // Payment - will add validation later
        break;
    }

    const isValid = fieldsToValidate.length === 0 || await methods.trigger(fieldsToValidate as any);
    return isValid;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    
    if (isValid) {
      setCompletedSteps(prev => [...prev.filter(step => step !== currentStep), currentStep]);
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    } else {
      toast.error('Please fill in all required fields correctly');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow clicking on completed steps or current step
    if (completedSteps.includes(stepIndex) || stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const saveAddressIfRequested = async (addressData: CheckoutFormData['delivery']) => {
    if (!addressData.saveAddress || !user) return;

    try {
      const { error } = await supabase
        .from('user_addresses')
        .insert({
          user_id: user.id,
          full_name: addressData.fullName,
          company: addressData.company,
          address: addressData.address,
          apartment: addressData.apartment,
          city: addressData.city,
          state: addressData.state,
          zip_code: addressData.zipCode,
          phone: addressData.phone,
          country: addressData.country,
          is_default: false
        });

      if (error) throw error;
      toast.success('Address saved for future orders! 📍');
    } catch (error) {
      console.error('Failed to save address:', error);
      toast.error('Address was not saved, but your order will proceed');
    }
  };

  const handleSubmitOrder = async (data: CheckoutFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      // Save address if requested
      await saveAddressIfRequested(data.delivery);

      // Prepare order data
      const orderData = {
        user_id: user.id,
        user_email: user.email,
        user_phone: user.phone,
        
        // Delivery Address
        delivery_name: data.delivery.fullName,
        delivery_company: data.delivery.company,
        delivery_address: data.delivery.address,
        delivery_apartment: data.delivery.apartment,
        delivery_city: data.delivery.city,
        delivery_state: data.delivery.state,
        delivery_zip: data.delivery.zipCode,
        delivery_phone: data.delivery.phone,
        delivery_country: data.delivery.country,
        
        // Billing Address
        billing_same_as_delivery: data.billing.sameAsDelivery,
        billing_name: data.billing.sameAsDelivery ? data.delivery.fullName : data.billing.fullName,
        billing_company: data.billing.sameAsDelivery ? data.delivery.company : data.billing.company,
        billing_address: data.billing.sameAsDelivery ? data.delivery.address : data.billing.address,
        billing_apartment: data.billing.sameAsDelivery ? data.delivery.apartment : data.billing.apartment,
        billing_city: data.billing.sameAsDelivery ? data.delivery.city : data.billing.city,
        billing_state: data.billing.sameAsDelivery ? data.delivery.state : data.billing.state,
        billing_zip: data.billing.sameAsDelivery ? data.delivery.zipCode : data.billing.zipCode,
        billing_phone: data.billing.sameAsDelivery ? data.delivery.phone : data.billing.phone,
        billing_country: data.billing.sameAsDelivery ? data.delivery.country : data.billing.country,
        
        // Order Details
        items: cartState.items.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          purchase_type: item.purchaseType,
          set_id: item.setId,
          selected_color: item.selectedColor,
          unit_price: item.breakdown.breakdown?.length ? item.breakdown.breakdown[0].unitPrice : '',
          total_price: item.breakdown.totalPrice,
          original_price: item.breakdown.originalPrice,
          savings: item.breakdown.savings
        })),
        
        total_items: cartState.totalItems,
        subtotal: cartState.totalPrice,
        total_savings: cartState.totalSavings,
        total_amount: cartState.totalPrice,
        
        order_notes: data.orderNotes,
        order_status: 'pending',
        payment_status: 'pending'
      };

      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Clear cart and redirect
      clearCart();
      toast.success('🎉 Order placed successfully! We\'ll contact you for payment details.');
      navigate(`/order-confirmation/${order.id}`);
      
    } catch (error: any) {
      console.error('Order submission error:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !cartState.items.length) {
    return (
      <div className="checkout-loading">
        <div className="loading__spinner"></div>
        <p>Loading checkout...</p>
      </div>
    );
  }

  return (
    <div className="checkout">
      <div className="container">
        <div className="checkout__header">
          <h1>Secure Checkout</h1>
          <p>Complete your LavyaGlow order safely and securely</p>
        </div>

        <div className="checkout__layout">
          <div className="checkout__main">
            <CheckoutStepper 
              steps={STEPS}
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
            />

            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(handleSubmitOrder)} className="checkout__form">
                {currentStep === 0 && <DeliveryAddress />}
                {currentStep === 1 && <BillingAddress />}
                {currentStep === 2 && <Payment />}

                <div className="checkout__actions">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="checkout__back-btn"
                      disabled={isSubmitting}
                    >
                      ← Back
                    </button>
                  )}
                  
                  {currentStep < STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="checkout__next-btn"
                      disabled={isSubmitting}
                    >
                      Continue →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="checkout__submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="btn-spinner" />
                          Placing Order...
                        </>
                      ) : (
                        <>
                          Place Order 🕯️ ₹{cartState.totalPrice.toLocaleString()}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </FormProvider>
          </div>

          <div className="checkout__sidebar">
            {/* Order Summary */}
            <div className="order-summary" style={{ marginBottom: 0 }}>
              {/* <h3>Order Summary</h3>
              
              <div className="order-summary__items">
                {cartState.items.map((item) => (
                  <div key={item.id} className="order-summary__item">
                    <img 
                      src={item.product.images?.[0] || '/default-candle.jpg'} 
                      alt={item.product.name} 
                    />
                    <div className="item-details">
                      <h4>{item.product.name}</h4>
                      <p className="item-meta">
                        {item.purchaseType === 'set' ? `Set of ${item.breakdown.breakdown[0]?.setSize}` : 'Individual'} × {item.quantity}
                      </p>
                      {item.selectedColor && (
                        <p className="item-color">Color: {item.selectedColor}</p>
                      )}
                    </div>
                    <div className="item-pricing">
                      <span className="item-price">₹{item.breakdown.totalPrice.toLocaleString()}</span>
                      {item.breakdown.savings > 0 && (
                        <span className="item-savings">Save ₹{item.breakdown.savings.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div> */}
              
              <div className="order-summary__totals" style={{ paddingTop: 0, marginBottom: 0 }}>
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
                <div className="total-row shipping">
                  <span>Shipping</span>
                  <span className="free">FREE</span>
                </div>
                <div className="total-row final">
                  <strong>Total</strong>
                  <strong>₹{cartState.totalPrice.toLocaleString()}</strong>
                </div>
              </div>
            </div>
            
            {/* Security Badge */}
            {/* <div className="security-badge">
              <div className="security-icon">🔒</div>
              <div className="security-text">
                <h4>Secure Checkout</h4>
                <p>Your information is protected with industry-standard encryption</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
