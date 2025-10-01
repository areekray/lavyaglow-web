// hooks/useRazorpay.ts - FIXED VERSION
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/services/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface PaymentData {
  deliveryAddress: any;
  billingAddress: any;
  specialRequest?: string;
  giftMessage?: string;
}

export function useRazorpay() {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const { user } = useAuth();
  const { state: cartState, clearCart } = useCart();
  const navigate = useNavigate();

  const initializePayment = useCallback(async (paymentData: PaymentData) => {
    if (!user) {
      toast.error('Please sign in to make payment');
      return { success: false, error: 'User not authenticated' };
    }

    if (cartState.items.length === 0) {
      toast.error('Your cart is empty');
      return { success: false, error: 'Empty cart' };
    }

    setLoading(true);
    setPaymentStatus('processing');

    try {
      // 1. Create order in database - FIXED NULL HANDLING
      const orderData = {
        user_id: user.id,
        user_email: user.email,
        user_phone: user.phone || null,

        // Delivery address - FIXED NULL HANDLING
        delivery_name: paymentData.deliveryAddress.fullName,
        delivery_company: paymentData.deliveryAddress.company || null,
        delivery_address: paymentData.deliveryAddress.address,
        delivery_apartment: paymentData.deliveryAddress.apartment || null,
        delivery_city: paymentData.deliveryAddress.city,
        delivery_state: paymentData.deliveryAddress.state,
        delivery_zip: paymentData.deliveryAddress.zipCode,
        delivery_country: paymentData.deliveryAddress.country || 'India',
        delivery_phone: paymentData.deliveryAddress.phone,

        // Billing address - FIXED NULL HANDLING
        billing_same_as_delivery: paymentData.billingAddress.sameAsDelivery,
        billing_name: paymentData.billingAddress.sameAsDelivery 
          ? paymentData.deliveryAddress.fullName 
          : (paymentData.billingAddress.fullName || null),
        billing_company: paymentData.billingAddress.sameAsDelivery 
          ? (paymentData.deliveryAddress.company || null)
          : (paymentData.billingAddress.company || null),
        billing_address: paymentData.billingAddress.sameAsDelivery 
          ? paymentData.deliveryAddress.address 
          : (paymentData.billingAddress.address || null),
        billing_apartment: paymentData.billingAddress.sameAsDelivery 
          ? (paymentData.deliveryAddress.apartment || null)
          : (paymentData.billingAddress.apartment || null),
        billing_city: paymentData.billingAddress.sameAsDelivery 
          ? paymentData.deliveryAddress.city 
          : (paymentData.billingAddress.city || null),
        billing_state: paymentData.billingAddress.sameAsDelivery 
          ? paymentData.deliveryAddress.state 
          : (paymentData.billingAddress.state || null),
        billing_zip: paymentData.billingAddress.sameAsDelivery 
          ? paymentData.deliveryAddress.zipCode 
          : (paymentData.billingAddress.zipCode || null),
        billing_country: paymentData.billingAddress.sameAsDelivery 
          ? (paymentData.deliveryAddress.country || 'India')
          : (paymentData.billingAddress.country || 'India'),
        billing_phone: paymentData.billingAddress.sameAsDelivery 
          ? paymentData.deliveryAddress.phone 
          : (paymentData.billingAddress.phone || null),

        // Order details
        subtotal: cartState.totalPrice + cartState.totalSavings,
        total_savings: cartState.totalSavings,
        shipping_cost: 0,
        tax_amount: 0,
        total_amount: cartState.totalPrice,
        currency: 'INR',

        // Special requests - FIXED NULL HANDLING
        special_request: paymentData.specialRequest || null,
        gift_message: paymentData.giftMessage || null,

        // Status
        order_status: 'pending',
        payment_status: 'pending'
      };

      console.log('Creating order with data:', orderData);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      console.log('Order created:', order);

      // Create order items - FIXED MAPPING
      const orderItems = cartState.items.map(item => {
        // SAFER DATA EXTRACTION
        const unitPrice = item.breakdown.breakdown.length ? item.breakdown.breakdown[0].unitPrice : (
                         item.product.discounted_price || 
                         item.product.actual_price || 0);

        const selectedScent = item.product.characteristics?.scent ||
                             null;

        const productSku = `${item.product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` ||
                          `product-${item.product.id}`;

        const setSize = item.purchaseType === 'set' && item.breakdown.breakdown?.length > 0
                       ? item.breakdown.breakdown[0].setSize
                       : (item.purchaseType === 'set' ? item.quantity : 1);

        return {
          order_id: order.id,
          product_id: item.product.id,
          product_name: item.product.name,
          product_sku: productSku,
          product_image_url: item.product.images?.[0] || null,
          purchase_type: item.purchaseType,
          set_id: item.setId || null,
          set_size: setSize,
          selected_color: item.selectedColor || null,
          selected_scent: selectedScent,
          unit_price: unitPrice,
          original_price: item.product.actual_price,
          discounted_price: item.product.discounted_price,
          quantity: item.quantity,
          total_price: item.breakdown.totalPrice,
          savings: item.breakdown.savings || 0
        };
      });

      console.log('Creating order items:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      console.log('Order items created successfully');

      // 2. Create Razorpay order via Edge Function
      console.log('Creating Razorpay order for amount:', cartState.totalPrice);
      
      const { data: razorpayOrder, error: razorpayError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: Math.round(cartState.totalPrice * 100), // Convert to paise
          currency: 'INR',
          orderId: order.id,
          orderNumber: order.order_number,
          customerEmail: user.email,
          customerName: user.full_name || user.email,
          customerPhone: user.phone || ''
        }
      });

      if (razorpayError) {
        console.error('Razorpay order creation error:', razorpayError);
        throw new Error(`Failed to create Razorpay order: ${razorpayError.message}`);
      }

      console.log('Razorpay order created:', razorpayOrder);

      // 3. Load Razorpay script and open checkout
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script. Please check your internet connection.');
      }

      // VALIDATE RAZORPAY KEY
      if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
        throw new Error('Razorpay Key ID not found. Please check your .env.local file.');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'LavyaGlow',
        description: `Premium Handcrafted Candles - ${order.order_number}`,
        image: '/pwa-192x192.png',
        order_id: razorpayOrder.id,
        handler: function (response: any) {
          handlePaymentSuccess(response, order);
        },
        prefill: {
          name: user.full_name || user.email,
          email: user.email,
          contact: user.phone || ''
        },
        notes: {
          lavyaglow_order_id: order.id,
          order_number: order.order_number,
          customer_id: user.id
        },
        theme: {
          color: '#e8e3d8'
        },
        config: {
            display: {
                blocks: {
                    banks: {
                    name: 'Most Used Methods',
                    instruments: [
                        { method: 'card' },
                        { method: 'upi' },
                        { method: 'netbanking' },
                        { method: 'wallet' }
                    ]
                    }
                },
                sequence: ['block.banks'],
                preferences: {
                    show_default_blocks: true
                }
            }
         },
        modal: {
          ondismiss: function() {
            handlePaymentDismiss(order.id);
          }
        }
      };

      console.log('Opening Razorpay checkout with options:', options);
      const rzp = new (window as any).Razorpay(options);
      rzp.open();

      return { success: true, order };

    } catch (error: any) {
      console.error('Payment initialization error:', error);
      toast.error(error.message || 'Failed to initialize payment');
      setPaymentStatus('failed');
      setLoading(false);
      return { success: false, error: error.message };
    }
  }, [user, cartState]);

  const handlePaymentSuccess = async (response: any, order: any) => {
    try {
      toast.loading('Verifying payment...', { id: 'payment-verification' });

      console.log('Verifying payment:', response);

      const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
        body: {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          order_id: order.id
        }
      });

      toast.dismiss('payment-verification');

      if (error) {
        console.error('Payment verification error:', error);
        throw new Error(`Payment verification failed: ${error.message}`);
      }

      console.log('Payment verification result:', data);

      if (data.verified) {
        setPaymentStatus('success');
        clearCart(); // Only clear cart on successful payment
        toast.success(`🎉 Payment successful! Order ${order.order_number} confirmed.`, {
          duration: 5000
        });
        
        navigate(`/order-confirmation/${order.id}`);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setPaymentStatus('failed');
      toast.error(error.message || 'Payment verification failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentDismiss = (orderId: string) => {
    setLoading(false);
    setPaymentStatus('failed');
    toast.error('Payment cancelled. Your cart items are preserved.');
    
    // Mark order as cancelled
    (async () => {
      try {
        await supabase
          .from('orders')
          .update({ 
            order_status: 'cancelled',
            payment_status: 'failed'
          })
          .eq('id', orderId);
        console.log('Order marked as cancelled');
      } catch (error) {
        console.error('Failed to update order status:', error);
      }
    })();
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check if script already exists
      if (window.Razorpay) {
        console.log('Razorpay script already loaded');
        resolve(true);
        return;
      }

      console.log('Loading Razorpay script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  return {
    initializePayment,
    loading,
    paymentStatus,
    setPaymentStatus
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}
