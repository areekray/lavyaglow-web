import { useState, useEffect, Fragment } from 'react';
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
      navigate('/cart');
    }
  }, [user, openLogin]);

  // Redirect to cart if no items
  useEffect(() => {
    if (!cartState.items.length) {
      navigate('/cart');
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
      setTimeout(() => {
        const stepper = document.getElementById('checkout-stepper');
        if (stepper) {
          stepper.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    } else {
      toast.error('Please fill in all required fields correctly');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setTimeout(() => {
      const stepper = document.getElementById('checkout-stepper');
      if (stepper) {
        stepper.scrollIntoView({ behavior: "smooth" });
      }
    }, 500);
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
      navigate(`/orders/${order.id}?confirmed=true`);
      
    } catch (error: any) {
      toast.error('Failed to place order. Please try again.');
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

                <div className={`checkout__actions${currentStep === 2 ? ' last-step' : ''}`}>
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="btn btn--luxury btn--lg"
                      disabled={isSubmitting}
                    >
                      ← Back
                    </button>
                  )}
                  
                  {currentStep < STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn btn--primary btn--lg"
                      disabled={isSubmitting}
                    >
                      Continue →
                    </button>
                  ) : (
                    // <button
                    //   type="submit"
                    //   className="checkout__submit-btn"
                    //   disabled={isSubmitting}
                    // >
                    //   {isSubmitting ? (
                    //     <>
                    //       <div className="btn-spinner" />
                    //       Placing Order...
                    //     </>
                    //   ) : (
                    //     <>
                    //       Place Order 🕯️ ₹{cartState.totalPrice.toLocaleString()}
                    //     </>
                    //   )}
                    // </button>
                    <Fragment />
                  )}
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
