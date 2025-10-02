// pages/OrderDetails.tsx - Detailed order view
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import {
  ClipboardDocumentListIcon,
  TruckIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { Order, DatabaseOrderItem } from '@/types';
import OrderConfirmed from '@/components/layout/OrderConfirmation';

interface DetailedOrder extends Order {
  order_items?: DatabaseOrderItem[];
  shipped_at?: string;
  delivered_at?: string;
  estimated_delivery_date?: string;
}

export function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<DetailedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const confirmed = searchParams.get("confirmed");

  const fetchOrderDetails = async () => {
    if (!orderId || !user) return;
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            product_sku,
            product_image_url,
            purchase_type,
            set_size,
            quantity,
            unit_price,
            original_price,
            discounted_price,
            total_price,
            savings,
            selected_color,
            selected_scent
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error('Order not found');
        navigate('/profile');
        return;
      }

      // Transform to your Order type
      const transformedOrder: DetailedOrder = {
        id: data.id,
        user_id: data.user_id,
        order_number: data.order_number,
        user_email: data.user_email,
        user_phone: data.user_phone,
        delivery_name: data.delivery_name,
        delivery_address: data.delivery_address,
        delivery_city: data.delivery_city,
        delivery_state: data.delivery_state,
        delivery_phone: data.delivery_phone,
        total_amount: data.total_amount,
        subtotal: data.subtotal,
        total_savings: data.total_savings || 0,
        shipping_cost: data.shipping_cost || 0,
        status: data.order_status as any,
        order_status: data.order_status,
        payment_status: data.payment_status as any,
        payment_method: data.payment_method,
        tracking_number: data.tracking_number,
        courier_partner: data.courier_partner,
        tracking_url: data.tracking_url,
        special_request: data.special_request,
        gift_message: data.gift_message,
        created_at: data.created_at,
        updated_at: data.updated_at,
        confirmed_at: data.confirmed_at,
        shipped_at: data.shipped_at,
        delivered_at: data.delivered_at,
        paid_at: data.paid_at,
        estimated_delivery_date: data.estimated_delivery_date,

        // For compatibility
        shipping_address: {
          full_name: data.delivery_name,
          phone: data.delivery_phone,
          address_line1: data.delivery_address,
          address_line2: data.delivery_apartment || '',
          city: data.delivery_city,
          state: data.delivery_state,
          postal_code: data.delivery_zip,
          country: data.delivery_country || 'India'
        },

        items: [],
        notes: data.special_request,
        order_items: data.order_items
      };

      setOrder(transformedOrder);
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId, user]);

  if (!user) {
    return (
      <div className="order-details__unauthorized">
        <h2>Please log in to view order details</h2>
        <Button onClick={() => navigate('/auth')}>Login</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="order-details__loading">
        <div className="loading__spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details__not-found">
        <ExclamationTriangleIcon className="not-found-icon" />
        <h2>Order Not Found</h2>
        <p>This order doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => navigate('/profile')}>
          Back to Profile
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#f59e0b',
      confirmed: '#10b981',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#22c55e',
      cancelled: '#ef4444',
      completed: '#22c55e',
      failed: '#ef4444',
      refunded: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="order-details">
      <div className="order-details__container">
        {/* Header */}
        <div className="order-details__header">          
          <div className="order-details__title">
            <h1>Order Details</h1>
            <div className="order-number">#{order.order_number}</div>
          </div>
        </div>
        {confirmed &&  <OrderConfirmed />}
        <div className="order-details__content">
          {/* Order Status */}
          <div className="order-section order-section--highlight">
            <div className="section-header">
              <ClipboardDocumentListIcon className="section-icon" />
              <h2>Order Status</h2>
            </div>
            
            <div className="status-overview">
              <div className="status-item">
                <span className="status-label">Order Status</span>
                <span 
                  className="status-value"
                  style={{ color: getStatusColor(order.status) }}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Payment Status</span>
                <span 
                  className="status-value"
                  style={{ color: getStatusColor(order.payment_status) }}
                >
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Order Date</span>
                <span className="status-value">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Tracking Information */}
            {order.tracking_number && (
              <div className="tracking-info">
                <div className="tracking-header">
                  <TruckIcon className="tracking-icon" />
                  <h3>Tracking Information</h3>
                </div>
                <div className="tracking-details">
                  <div className="tracking-item">
                    <span>Tracking Number: <strong>{order.tracking_number}</strong></span>
                  </div>
                  {order.courier_partner && (
                    <div className="tracking-item">
                      <span>Courier: <strong>{order.courier_partner}</strong></span>
                    </div>
                  )}
                  {order.tracking_url && (
                    <div className="tracking-item">
                      <a 
                        href={order.tracking_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="tracking-link"
                      >
                        Track Your Package
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Estimated Delivery */}
            {order.estimated_delivery_date && (
              <div className="delivery-estimate">
                <CalendarIcon className="delivery-icon" />
                <span>
                  Estimated Delivery: {' '}
                  <strong>
                    {new Date(order.estimated_delivery_date).toLocaleDateString('en-IN')}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="order-section">
            <div className="section-header">
              <ShoppingBagIcon className="section-icon" />
              <h2>Order Items ({order.order_items?.length || 0})</h2>
            </div>
            
            <div className="order-items">
              {order.order_items?.map((item) => (
                <div key={item.id} className="order-item">
                  {item.product_image_url && (
                    <div className="item-image">
                      <img 
                        src={item.product_image_url} 
                        alt={item.product_name}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="item-details">
                    <h3>{item.product_name}</h3>
                    <div className="item-specs">
                      {item.purchase_type === 'set' && item.set_size ? (
                        <span>Set of {item.set_size} × {item.quantity}</span>
                      ) : (
                        <span>Quantity: {item.quantity}</span>
                      )}
                      {item.selected_color && (
                        <span>Color: {item.selected_color}</span>
                      )}
                      {item.selected_scent && (
                        <span>Scent: {item.selected_scent}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="item-pricing">
                    <div className="item-price">₹{item.total_price.toLocaleString()}</div>
                    {item.savings > 0 && (
                      <div className="item-savings">
                        You saved ₹{item.savings.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="order-section">
            <div className="section-header">
              <MapPinIcon className="section-icon" />
              <h2>Delivery Address</h2>
            </div>
            
            <div className="address-details">
              <div className="address-name">{order.delivery_name}</div>
              <div className="address-lines">
                <div>{order.delivery_address}</div>
                {order.shipping_address.address_line2 && (
                  <div>{order.shipping_address.address_line2}</div>
                )}
                <div>
                  {order.delivery_city}, {order.delivery_state} {order.shipping_address.postal_code}
                </div>
                <div>📱 {order.delivery_phone}</div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-section">
            <div className="section-header">
              <CurrencyRupeeIcon className="section-icon" />
              <h2>Order Summary</h2>
            </div>
            
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{order.subtotal?.toLocaleString()}</span>
              </div>
              {order.total_savings && order.total_savings > 0 && (
                <div className="summary-row savings">
                  <span>You Saved</span>
                  <span>-₹{order.total_savings.toLocaleString()}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Shipping</span>
                <span>{(order.shipping_cost && order.shipping_cost > 0) ? `₹${order.shipping_cost.toLocaleString()}` : 'Free'}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{order.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {(order.special_request || order.gift_message) && (
            <div className="order-section">
              <div className="section-header">
                <h2>Special Instructions</h2>
              </div>
              
              <div className="special-requests">
                {order.special_request && (
                  <div className="request-item">
                    <strong>Special Request:</strong>
                    <p>{order.special_request}</p>
                  </div>
                )}
                {order.gift_message && (
                  <div className="request-item">
                    <strong>Gift Message:</strong>
                    <p>{order.gift_message}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Information */}
          {order.payment_method && (
            <div className="order-section">
              <div className="section-header">
                <h2>Payment Information</h2>
              </div>
              
              <div className="payment-info">
                <div className="payment-row">
                  <span>Payment Method</span>
                  <span>{order.payment_method.toUpperCase()}</span>
                </div>
                <div className="payment-row">
                  <span>Payment Status</span>
                  <span style={{ color: getStatusColor(order.payment_status) }}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                </div>
                {order.paid_at && (
                  <div className="payment-row">
                    <span>Paid On</span>
                    <span>{new Date(order.paid_at).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
