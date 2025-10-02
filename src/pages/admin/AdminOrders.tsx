import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { 
  EyeIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  TruckIcon,
  PencilIcon,
  PlusIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { Order, DatabaseOrderItem, Product } from '@/types';
import { ColorChips } from '@/components/layout/ColorChips';
import { useNavigate } from 'react-router-dom';

// Extended order type for database queries
interface AdminOrder extends Order {
  order_items?: DatabaseOrderItem[];
  shipped_at?: string;
}

export function AdminOrders() {
  const { user, isAdmin, isStaff } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [shippingData, setShippingData] = useState({
    orderId: '',
    trackingNumber: '',
    courierPartner: '',
    trackingUrl: ''
  });
  // Permission check
  if (!user || (!isAdmin && !isStaff)) {
    return (
      <div className="admin-orders__unauthorized">
        <h2>🚫 Access Denied</h2>
        <p>You don't have permission to view orders.</p>
      </div>
    );
  }

  const [products, setProducts] = useState<Product[]>([]);
   const [createOrderData, setCreateOrderData] = useState({
    // Customer Info (simplified)
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    
    // Items (flexible)
    items: [] as Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      isExistingProduct: boolean;
      productId?: string;
    }>,
    
    // Status
    orderStatus: 'confirmed' as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered',
    paymentStatus: 'completed' as 'pending' | 'completed' | 'failed',
    paymentMethod: 'cash' as 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other'
  });

  // Fetch products for offline order creation
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_price_sets (
            id,
            set_quantity,
            actual_price,
            discounted_price
          )
        `)
        .eq('in_stock', true)
        .order('name');

      if (error) throw error;

      // Transform to match your Product type
      const transformedProducts: Product[] = (data || []).map(dbProduct => ({
        ...dbProduct,
        price: dbProduct.discounted_price, // backward compatibility
        characteristics: dbProduct.characteristics || {},
        price_sets: dbProduct.product_price_sets
      }));

      setProducts(transformedProducts);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const resetCreateOrderForm = () => {
    setCreateOrderData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      address: '',
      items: [],
      orderStatus: 'confirmed',
      paymentStatus: 'completed',
      paymentMethod: 'cash'
    });
  };

  // createOfflineOrder function
  const createOfflineOrder = async () => {
    if (!createOrderData.customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    if (!createOrderData.customerEmail.trim()) {
      toast.error('Customer email is required');
      return;
    }
    if (createOrderData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    try {
      setUpdating('create-order');

      const totalAmount = createOrderData.items.reduce((sum, item) => sum + item.totalPrice, 0);

      // Create simplified order
      const orderData = {
        user_id: user.id,
        user_email: createOrderData.customerEmail.trim(),
        user_phone: createOrderData.customerPhone.trim() || null,
        
        // Simplified delivery address
        delivery_name: createOrderData.customerName.trim(),
        delivery_address: createOrderData.address.trim() || 'Offline Order - Address Not Required',
        delivery_city: 'N/A',
        delivery_state: 'N/A', 
        delivery_zip: '000000',
        delivery_country: 'India',
        delivery_phone: createOrderData.customerPhone.trim() || 'N/A',
        
        // Same for billing
        billing_same_as_delivery: true,
        billing_name: createOrderData.customerName.trim(),
        billing_address: createOrderData.address.trim() || 'Offline Order - Address Not Required',
        billing_city: 'N/A',
        billing_state: 'N/A',
        billing_zip: '000000',
        billing_country: 'India',
        billing_phone: createOrderData.customerPhone.trim() || 'N/A',
        
        // Simple totals
        subtotal: totalAmount,
        total_savings: 0,
        shipping_cost: 0,
        tax_amount: 0,
        total_amount: totalAmount,
        currency: 'INR',
        
        // Status
        order_status: createOrderData.orderStatus,
        payment_status: createOrderData.paymentStatus,
        payment_method: createOrderData.paymentMethod,
        
        // Admin tracking
        last_updated_by: user.id
      };

      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // 🔧 FIXED: Handle NULL product_id properly
      const orderItems = createOrderData.items.map(item => {
        // Create base item object
        const baseItem = {
          order_id: newOrder.id,
          product_name: item.productName.trim(),
          product_sku: 'offline-' + item.productName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          purchase_type: 'piece',
          set_size: 1,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          original_price: item.unitPrice,
          discounted_price: item.unitPrice,
          total_price: item.totalPrice,
          savings: 0
        };

        // Add product_id only if it exists, otherwise leave it undefined (NULL)
        if (item.isExistingProduct && item.productId) {
          return {
            ...baseItem,
            product_id: item.productId
          };
        } else {
          // For manual products, don't include product_id field at all
          // This will insert NULL automatically
          return baseItem;
        }
      });

      console.log('📝 Inserting order items:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast.success(`Offline order ${newOrder.order_number} created successfully!`);
      
      // Reset and close
      resetCreateOrderForm();
      setShowCreateOrderModal(false);
      await fetchOrders();

    } catch (error: any) {
      console.error('Error creating offline order:', error);
      toast.error(`Failed to create order: ${error.message}`);
    } finally {
      setUpdating(null);
    }
  };


  // Load products when create modal opens
  useEffect(() => {
    if (showCreateOrderModal && products.length === 0) {
      fetchProducts();
    }
  }, [showCreateOrderModal]);


  // Fetch orders from your database
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            product_sku,
            product_image_url,
            purchase_type,
            set_id,
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      // DEBUG: Log the raw data to see set_size values
      console.log('🔍 Raw orders data with set_size:', ordersData);
      
      // Transform database data to match your types
      const transformedOrders: AdminOrder[] = (ordersData || []).map(dbOrder => ({
        id: dbOrder.id,
        user_id: dbOrder.user_id,
        order_number: dbOrder.order_number,
        user_email: dbOrder.user_email,
        user_phone: dbOrder.user_phone,
        delivery_name: dbOrder.delivery_name,
        delivery_address: dbOrder.delivery_address,
        delivery_city: dbOrder.delivery_city,
        delivery_state: dbOrder.delivery_state,
        delivery_phone: dbOrder.delivery_phone,
        total_amount: dbOrder.total_amount,
        subtotal: dbOrder.subtotal,
        total_savings: dbOrder.total_savings || 0,
        shipping_cost: dbOrder.shipping_cost || 0,
        status: dbOrder.order_status as any,
        order_status: dbOrder.order_status,
        payment_status: dbOrder.payment_status as any,
        payment_method: dbOrder.payment_method,
        tracking_number: dbOrder.tracking_number,
        special_request: dbOrder.special_request,
        gift_message: dbOrder.gift_message,
        razorpay_order_id: dbOrder.razorpay_order_id,
        razorpay_payment_id: dbOrder.razorpay_payment_id,
        created_at: dbOrder.created_at,
        updated_at: dbOrder.updated_at,
        confirmed_at: dbOrder.confirmed_at,
        paid_at: dbOrder.paid_at,
        
        // Transform to your existing format
        shipping_address: {
          full_name: dbOrder.delivery_name,
          phone: dbOrder.delivery_phone,
          address_line1: dbOrder.delivery_address,
          address_line2: dbOrder.delivery_apartment || '',
          city: dbOrder.delivery_city,
          state: dbOrder.delivery_state,
          postal_code: dbOrder.delivery_zip,
          country: dbOrder.delivery_country || 'India'
        },
        
        items: [], // We'll use order_items instead
        notes: dbOrder.special_request,
        order_items: dbOrder.order_items // ← This should now include set_size
      }));

      setOrders(transformedOrders);
      setFilteredOrders(transformedOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error(`Failed to fetch orders: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);


  // Filter orders
  useEffect(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.order_number?.toLowerCase().includes(term) ||
        order.user_email?.toLowerCase().includes(term) ||
        order.delivery_name?.toLowerCase().includes(term) ||
        order.delivery_city?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(order => 
        new Date(order.created_at) >= filterDate
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, dateRange]);

  // Update order status
  // Enhanced update order status with shipping modal
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (newStatus === 'shipped') {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setShippingData({
          orderId: orderId,
          trackingNumber: order.tracking_number || '',
          courierPartner: order.courier_partner || '',
          trackingUrl: order.tracking_url || ''
        });
        setShowShippingModal(true);
      }
      return;
    }

    await updateOrderStatusDirect(orderId, newStatus);
  };

  // Direct status update (without shipping modal)
  const updateOrderStatusDirect = async (orderId: string, newStatus: string, trackingInfo?: any) => {
    try {
      setUpdating(orderId);
      
      const updateData: any = {
        order_status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Add tracking info if provided
      if (trackingInfo) {
        updateData.tracking_number = trackingInfo.trackingNumber || null;
        updateData.courier_partner = trackingInfo.courierPartner || null;
        updateData.tracking_url = trackingInfo.trackingUrl || null;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus as any, 
              order_status: newStatus,
              ...updateData
            }
          : order
      ));

      if (trackingInfo && newStatus === 'shipped') {
        toast.success(`Order shipped! Tracking: ${trackingInfo.trackingNumber}`);
      } else {
        toast.success(`Order status updated to ${newStatus}`);
      }
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast.error(`Failed to update order: ${error.message}`);
    } finally {
      setUpdating(null);
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(orderId);
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, payment_status: newStatus as any }
          : order
      ));

      toast.success(`Payment status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      toast.error(`Failed to update payment status: ${error.message}`);
    } finally {
      setUpdating(null);
    }
  };


  // Handle shipping form submission
  const handleShippingSubmit = async () => {
    if (!shippingData.trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    if (!shippingData.courierPartner.trim()) {
      toast.error('Please select a courier partner');
      return;
    }

    const trackingInfo = {
      trackingNumber: shippingData.trackingNumber.trim(),
      courierPartner: shippingData.courierPartner.trim(),
      trackingUrl: shippingData.trackingUrl.trim()
    };

    await updateOrderStatusDirect(shippingData.orderId, 'shipped', trackingInfo);
    setShowShippingModal(false);
    
    // Reset form
    setShippingData({
      orderId: '',
      trackingNumber: '',
      courierPartner: '',
      trackingUrl: ''
    });
  };


  // Delete order (Admin only)
  const deleteOrder = async (orderId: string, orderNumber: string) => {
    if (!isAdmin) {
      toast.error('Only administrators can delete orders');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete order ${orderNumber}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setUpdating(orderId);

      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.filter(order => order.id !== orderId));
      toast.success(`Order ${orderNumber} deleted successfully`);
      
      if (selectedOrder?.id === orderId) {
        setShowOrderModal(false);
        setSelectedOrder(null);
      }
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast.error(`Failed to delete order: ${error.message}`);
    } finally {
      setUpdating(null);
    }
  };

  // Export orders to CSV
  const exportOrders = () => {
    const csvData = filteredOrders.map(order => ({
      'Order Number': order.order_number,
      'Date': new Date(order.created_at).toLocaleDateString(),
      'Customer Email': order.user_email || '',
      'Customer Name': order.delivery_name || order.shipping_address.full_name,
      'Status': order.status,
      'Payment Status': order.payment_status,
      'Total Amount': order.total_amount,
      'Items': order.order_items?.length || 0,
      'City': order.delivery_city || order.shipping_address.city,
      'State': order.delivery_state || order.shipping_address.state
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lavyaglow-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get status class
  const getStatusClass = (status: string, type: 'order' | 'payment') => {
    return `status-badge status-badge--${type} status-badge--${status.replace('_', '-')}`;
  };

  // Load orders on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="admin-orders__loading">
        <div className="loading__spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="admin-orders">
      {/* Header */}
      <div className="admin-orders__header">
        <div className="admin-orders__title-section">
          <h2>📦 Order Management</h2>
          <p className="admin-orders__count">
            {filteredOrders.length} of {orders.length} orders
          </p>
        </div>

        <div className="admin-orders__actions">
          <button 
            className="admin-orders__export-btn"
            onClick={exportOrders}
            disabled={filteredOrders.length === 0}
          >
            <ArrowDownTrayIcon className="btn-icon" />
            Export CSV
          </button>
          {isAdmin && (
            <Button 
              onClick={() => setShowCreateOrderModal(true)}
              className="admin-orders__create-btn"
              variant="primary"
            >
              <PlusIcon className="btn-icon" />
              Create Offline Order
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="admin-orders__filters">
        <div className="filter-group">
          <MagnifyingGlassIcon className="filter-group__icon" />
          <input
            type="text"
            className="filter-group__input"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <FunnelIcon className="filter-group__icon" />
          <select
            className="filter-group__select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            className="filter-group__select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-orders__table-container">
        {filteredOrders.length === 0 ? (
          <div className="admin-orders__empty">
            <h3>📭 No Orders Found</h3>
            <p>No orders match your current filters.</p>
          </div>
        ) : (
          <div className="admin-orders__table-wrapper">
            <table className="admin-orders__table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Tracking</th>
                  <th>Actions</th>
                </tr>
              </thead><tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <button 
                        className="order-link"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                      >
                        {order.order_number}
                      </button>
                    </td>
                    <td>
                      <div className="order-date">
                        <div>{new Date(order.created_at).toLocaleDateString()}</div>
                        <small>{new Date(order.created_at).toLocaleTimeString()}</small>
                      </div>
                    </td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">
                          {order.delivery_name || order.shipping_address.full_name}
                        </div>
                        <div className="customer-email">
                          {order.user_email || 'N/A'}
                        </div>
                        <div className="customer-location">
                          {order.delivery_city || order.shipping_address.city}, {order.delivery_state || order.shipping_address.state}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="items-count">
                        {order.order_items?.length || order.items.length} items
                      </span>
                    </td>
                    <td>
                      <div className="amount-info">
                        <div className="total-amount">
                          ₹{order.total_amount.toLocaleString()}
                        </div>
                        {order.total_savings && order.total_savings > 0 && (
                          <div className="savings">
                            -₹{order.total_savings.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <select
                        className={getStatusClass(order.status, 'order')}
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        disabled={updating === order.id}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className={getStatusClass(order.payment_status, 'payment')}
                        value={order.payment_status}
                        onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                        disabled={updating === order.id}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>
                    <td>
                      {/* NEW: Tracking column */}
                      <div className="tracking-info">
                        {order.tracking_number ? (
                          <div className="tracking-details">
                            <div className="tracking-number">
                              #{order.tracking_number}
                            </div>
                            <div className="courier-partner">
                              {order.courier_partner}
                            </div>
                            {order.tracking_url && (
                              <a 
                                href={order.tracking_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="tracking-link"
                                title="Track Package"
                              >
                                🔗 Track
                              </a>
                            )}
                          </div>
                        ) : order.status === 'shipped' ? (
                          <span className="no-tracking">No tracking</span>
                        ) : (
                          <span className="tracking-na">-</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn action-btn--view"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                          title="View Details"
                        >
                          <EyeIcon />
                        </button>
                        
                        {/* NEW: Edit shipping button for shipped orders */}
                        {order.status === 'shipped' && (
                          <button
                            className="action-btn action-btn--edit"
                            onClick={() => {
                              setShippingData({
                                orderId: order.id,
                                trackingNumber: order.tracking_number || '',
                                courierPartner: order.courier_partner || '',
                                trackingUrl: order.tracking_url || ''
                              });
                              setShowShippingModal(true);
                            }}
                            title="Edit Shipping Info"
                          >
                            <PencilIcon />
                          </button>
                        )}
                        
                        {isAdmin && (
                          <button
                            className="action-btn action-btn--delete"
                            onClick={() => deleteOrder(order.id, order.order_number)}
                            disabled={updating === order.id}
                            title="Delete Order"
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {showShippingModal && (
        <ShippingModal 
          shippingData={shippingData}
          setShippingData={setShippingData}
          onSubmit={handleShippingSubmit}
          onClose={() => {
            setShowShippingModal(false);
            setShippingData({
              orderId: '',
              trackingNumber: '',
              courierPartner: '',
              trackingUrl: ''
            });
          }}
          loading={updating === shippingData.orderId}
        />
      )}

      {showCreateOrderModal && (
        <SimplifiedCreateOrderModal
          createOrderData={createOrderData}
          setCreateOrderData={setCreateOrderData}
          products={products}
          onSubmit={createOfflineOrder}
          onClose={() => {
            setShowCreateOrderModal(false);
            resetCreateOrderForm();
          }}
          loading={updating === 'create-order'}
        />
      )}
    </div>
  );
}

// Simplified Create Order Modal Component
function SimplifiedCreateOrderModal({
  createOrderData,
  setCreateOrderData,
  products,
  onSubmit,
  onClose,
  loading
}: {
  createOrderData: any;
  setCreateOrderData: any;
  products: Product[];
  onSubmit: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [itemForm, setItemForm] = useState({
    isExisting: false,
    productId: '',
    productName: '',
    quantity: 1,
    unitPrice: 0
  });

  const addItemToOrder = () => {
    if (!itemForm.productName.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (itemForm.quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    if (itemForm.unitPrice <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    const newItem = {
      productName: itemForm.productName.trim(),
      quantity: itemForm.quantity,
      unitPrice: itemForm.unitPrice,
      totalPrice: itemForm.unitPrice * itemForm.quantity,
      isExistingProduct: itemForm.isExisting,
      productId: itemForm.productId || undefined
    };

    setCreateOrderData((prev: any) => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    // Reset form
    setItemForm({
      isExisting: false,
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0
    });

    toast.success('Item added to order');
  };

  const removeItem = (index: number) => {
    setCreateOrderData((prev: any) => ({
      ...prev,
      items: prev.items.filter((_: any, i: number) => i !== index)
    }));
  };

  // When existing product is selected, auto-fill details
  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setItemForm((prev: any) => ({
        ...prev,
        productId: productId,
        productName: product.name,
        unitPrice: product.discounted_price
      }));
    }
  };

  const totalAmount = createOrderData.items.reduce((sum: number, item: any) => sum + item.totalPrice, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <PhoneIcon className="modal-icon" />
            Create Offline Order
          </h2>
          <button className="modal-close" onClick={onClose}>
            <XMarkIcon />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="offline-order-form">
            {/* Step 1: Customer Info (Simplified) */}
            <div className="form-section">
              <h3>👤 Customer Information</h3>
              <div className="form-grid form-grid--2">
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input
                    type="text"
                    value={createOrderData.customerName}
                    onChange={(e) => setCreateOrderData((prev: any) => ({
                      ...prev,
                      customerName: e.target.value
                    }))}
                    placeholder="Full name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={createOrderData.customerEmail}
                    onChange={(e) => setCreateOrderData((prev: any) => ({
                      ...prev,
                      customerEmail: e.target.value
                    }))}
                    placeholder="email@example.com"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={createOrderData.customerPhone}
                    onChange={(e) => setCreateOrderData((prev: any) => ({
                      ...prev,
                      customerPhone: e.target.value
                    }))}
                    placeholder="+91 9876543210"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Address (Optional)</label>
                  <input
                    type="text"
                    value={createOrderData.address}
                    onChange={(e) => setCreateOrderData((prev: any) => ({
                      ...prev,
                      address: e.target.value
                    }))}
                    placeholder="Basic address for reference"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Add Items (Flexible) */}
            <div className="form-section">
              <h3>🛍️ Add Items</h3>
              
              <div className="add-item-form">
                <div className="form-group">
                  <label>Product Source</label>
                  <div className="radio-group">
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="productSource"
                        checked={itemForm.isExisting}
                        onChange={() => setItemForm((prev: any) => ({ 
                          ...prev, 
                          isExisting: true,
                          productName: '',
                          unitPrice: 0
                        }))}
                      />
                      <span>Existing Product</span>
                    </label>
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="productSource"
                        checked={!itemForm.isExisting}
                        onChange={() => setItemForm((prev: any) => ({ 
                          ...prev, 
                          isExisting: false,
                          productId: '',
                          productName: '',
                          unitPrice: 0
                        }))}
                      />
                      <span>Manual Entry</span>
                    </label>
                  </div>
                </div>

                {itemForm.isExisting ? (
                  <div className="form-group">
                    <label>Select Product *</label>
                    <select
                      value={itemForm.productId}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      className="form-input"
                    >
                      <option value="">Choose a product...</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ₹{product.discounted_price}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      value={itemForm.productName}
                      onChange={(e) => setItemForm((prev: any) => ({
                        ...prev,
                        productName: e.target.value
                      }))}
                      placeholder="Enter product name"
                      className="form-input"
                    />
                  </div>
                )}

                <div className="form-grid form-grid--3">
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      value={itemForm.quantity}
                      onChange={(e) => setItemForm((prev: any) => ({
                        ...prev,
                        quantity: parseInt(e.target.value) || 1
                      }))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Unit Price (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemForm.unitPrice}
                      onChange={(e) => setItemForm((prev: any) => ({
                        ...prev,
                        unitPrice: parseFloat(e.target.value) || 0
                      }))}
                      placeholder="0.00"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Total: ₹{(itemForm.unitPrice * itemForm.quantity).toFixed(0)}</label>
                    <Button 
                      onClick={addItemToOrder}
                      disabled={!itemForm.productName.trim() || itemForm.quantity <= 0 || itemForm.unitPrice <= 0}
                      className="add-item-btn"
                    >
                      <PlusIcon className="btn-icon" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              {createOrderData.items.length > 0 && (
                <div className="items-list">
                  <h4>📦 Order Items ({createOrderData.items.length})</h4>
                  {createOrderData.items.map((item: any, index: number) => (
                    <div key={index} className="item-row">
                      <div className="item-details">
                        <strong>{item.productName}</strong>
                        <span>Qty: {item.quantity} × ₹{item.unitPrice} = ₹{item.totalPrice}</span>
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="remove-btn"
                        title="Remove item"
                      >
                        <XMarkIcon />
                      </button>
                    </div>
                  ))}
                  <div className="items-total">
                    <strong>Total Amount: ₹{totalAmount.toLocaleString()}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Order Status (Simplified) */}
            <div className="form-section">
              <h3>✅ Order Status</h3>
              <div className="form-grid form-grid--3">
                <div className="form-group">
                  <label>Order Status</label>
                  <select
                    value={createOrderData.orderStatus}
                    onChange={(e) => setCreateOrderData((prev: any) => ({
                      ...prev,
                      orderStatus: e.target.value as any
                    }))}
                    className="form-input"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Payment Status</label>
                  <select
                    value={createOrderData.paymentStatus}
                    onChange={(e) => setCreateOrderData((prev: any) => ({
                      ...prev,
                      paymentStatus: e.target.value as any
                    }))}
                    className="form-input"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    value={createOrderData.paymentMethod}
                    onChange={(e) => setCreateOrderData((prev: any) => ({
                      ...prev,
                      paymentMethod: e.target.value as any
                    }))}
                    className="form-input"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <Button onClick={onClose} variant="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={onSubmit}
            loading={loading}
            disabled={
              !createOrderData.customerName.trim() ||
              !createOrderData.customerEmail.trim() ||
              createOrderData.items.length === 0
            }
            className="create-order-btn"
          >
            <PlusIcon className="btn-icon" />
            {loading ? 'Creating...' : `Create Order (₹${totalAmount.toLocaleString()})`}
          </Button>
        </div>
      </div>
    </div>
  );
}



function ShippingModal({ 
  shippingData, 
  setShippingData, 
  onSubmit, 
  onClose, 
  loading 
}: {
  shippingData: any;
  setShippingData: any;
  onSubmit: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  const courierOptions = [
    { value: '', label: 'Select Courier Partner' },
    { value: 'Blue Dart', label: 'Blue Dart Express' },
    { value: 'DTDC', label: 'DTDC Express' },
    { value: 'FedEx', label: 'FedEx India' },
    { value: 'DHL', label: 'DHL Express' },
    { value: 'India Post', label: 'India Post' },
    { value: 'Ecom Express', label: 'Ecom Express' },
    { value: 'Delhivery', label: 'Delhivery' },
    { value: 'Ekart', label: 'Ekart Logistics' },
    { value: 'Other', label: 'Other' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🚚 Add Shipping Information</h2>
          <button className="modal-close" onClick={onClose}>
            <XMarkIcon />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="shipping-form">
            <div className="form-group">
              <label>Courier Partner *</label>
              <select
                value={shippingData.courierPartner}
                onChange={(e) => setShippingData((prev: any) => ({
                  ...prev,
                  courierPartner: e.target.value
                }))}
                className="form-input"
                required
              >
                {courierOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tracking Number *</label>
              <input
                type="text"
                value={shippingData.trackingNumber}
                onChange={(e) => setShippingData((prev: any) => ({
                  ...prev,
                  trackingNumber: e.target.value
                }))}
                placeholder="Enter tracking number"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Tracking URL (Optional)</label>
              <input
                type="url"
                value={shippingData.trackingUrl}
                onChange={(e) => setShippingData((prev: any) => ({
                  ...prev,
                  trackingUrl: e.target.value
                }))}
                placeholder="https://track.courier.com/track?id=..."
                className="form-input"
              />
              <small>Direct link to track this shipment</small>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <Button onClick={onClose} variant="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={onSubmit} 
            loading={loading}
            disabled={!shippingData.trackingNumber.trim() || !shippingData.courierPartner.trim()}
          >
            <TruckIcon className="btn-icon" />
            {loading ? 'Updating...' : 'Mark as Shipped'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Order Details Modal using your types
function OrderDetailsModal({ 
  order, 
  onClose
}: { 
  order: AdminOrder; 
  onClose: () => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content--large"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>📦 Order Details: {order.order_number}</h2>
          <button className="modal-close" onClick={onClose}>
            <XMarkIcon />
          </button>
        </div>

        <div className="modal-body">
          <div className="order-details-admin">
            {/* Order Summary */}
            <div className="order-section">
              <h3>📋 Order Summary</h3>
              <div className="order-info-grid">
                <div className="info-item">
                  <label>Order Number:</label>
                  <span>{order.order_number}</span>
                </div>
                <div className="info-item">
                  <label>Date:</label>
                  <span>{new Date(order.created_at).toLocaleString()}</span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span
                    className={`status-badge status-badge--${order.status}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="info-item">
                  <label>Payment:</label>
                  <span
                    className={`status-badge status-badge--${order.payment_status}`}
                  >
                    {order.payment_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="order-section">
              <h3>👤 Customer Information</h3>
              <div className="order-info-grid">
                <div className="info-item">
                  <label>Email:</label>
                  <span>{order.user_email || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>
                    {order.user_phone || order.shipping_address.phone}
                  </span>
                </div>
              </div>
            </div>
            {(order.status === 'shipped' || order.status === 'delivered') && (
              <div className="order-section">
                <h3>🚚 Shipping Information</h3>
                <div className="order-info-grid">
                  {order.courier_partner && (
                    <div className="info-item">
                      <label>Courier Partner:</label>
                      <span>{order.courier_partner}</span>
                    </div>
                  )}
                  {order.tracking_number && (
                    <div className="info-item">
                      <label>Tracking Number:</label>
                      <span className="tracking-number">{order.tracking_number}</span>
                    </div>
                  )}
                  {order.shipped_at && (
                    <div className="info-item">
                      <label>Shipped At:</label>
                      <span>{new Date(order.shipped_at).toLocaleString()}</span>
                    </div>
                  )}
                  {order.tracking_url && (
                    <div className="info-item">
                      <label>Track Package:</label>
                      <a 
                        href={order.tracking_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="tracking-link-full"
                      >
                        🔗 Open Tracking Page
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Shipping Address */}
            <div className="order-section">
              <h3>📍 Shipping Address</h3>
              <div className="address-display">
                <strong>
                  {order.delivery_name || order.shipping_address.full_name}
                </strong>
                <br />
                {order.delivery_address || order.shipping_address.address_line1}
                <br />
                {order.shipping_address.address_line2 && (
                  <>
                    {order.shipping_address.address_line2}
                    <br />
                  </>
                )}
                {order.delivery_city || order.shipping_address.city},{" "}
                {order.delivery_state || order.shipping_address.state}{" "}
                {order.shipping_address.postal_code}
                <br />
                📱 {order.delivery_phone || order.shipping_address.phone}
              </div>
            </div>

            {/* Order Items */}
            <div className="order-section">
              <h3>🛍️ Order Items</h3>
              <div className="order-items">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="item-info">
                      <h4 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {item.product_image_url && item.product_id && (<img
                          style={{ 
                            cursor: "pointer",
                            border: '1px solid white',
                            borderRadius: 5
                          }}
                          src={item.product_image_url}
                          alt={item.product_name}
                          width={50}
                          onClick={() => {
                            navigate(`/products/${item.product_id}`);
                          }}
                        />)}
                        {item.product_name}
                      </h4>
                      {item.purchase_type === "set" ? (
                        <p>
                          {item.quantity} x Set of {item.set_size}
                        </p>
                      ) : (
                        <p>
                          {item.purchase_type} × {item.quantity}
                        </p>
                      )}
                      {item.selected_color && (
                        <p>
                          Color: {item.selected_color}{" "}
                          <ColorChips colors={item.selected_color} />
                        </p>
                      )}
                    </div>
                    <div className="item-pricing">
                      <div className="item-total">
                        ₹{item.total_price.toLocaleString()}
                      </div>
                      {item.savings > 0 && (
                        <div className="item-savings">
                          Saved: ₹{item.savings.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="order-section">
              <h3>💰 Order Total</h3>
              <div className="order-totals">
                {order.subtotal && (
                  <div className="total-row">
                    <span>Subtotal:</span>
                    <span>₹{order.subtotal.toLocaleString()}</span>
                  </div>
                )}
                {order.total_savings && order.total_savings > 0 && (
                  <div className="total-row savings">
                    <span>You Saved:</span>
                    <span>-₹{order.total_savings.toLocaleString()}</span>
                  </div>
                )}
                {order.shipping_cost !== undefined && (
                  <div className="total-row">
                    <span>Shipping:</span>
                    <span>₹{order.shipping_cost.toLocaleString()}</span>
                  </div>
                )}
                <div className="total-row final">
                  <span>Total:</span>
                  <span>₹{order.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {(order.special_request || order.gift_message) && (
              <div className="order-section">
                <h3>📝 Special Requests</h3>
                {order.special_request && (
                  <div>
                    <strong>Special Instructions:</strong>
                    <p>{order.special_request}</p>
                  </div>
                )}
                {order.gift_message && (
                  <div>
                    <strong>Gift Message:</strong>
                    <p>{order.gift_message}</p>
                  </div>
                )}
              </div>
            )}

            {/* Payment Details */}
            {order.razorpay_payment_id && (
              <div className="order-section">
                <h3>💳 Payment Details</h3>
                <div className="order-info-grid">
                  <div className="info-item">
                    <label>Payment ID:</label>
                    <span className="payment-id">
                      {order.razorpay_payment_id}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Order ID:</label>
                    <span className="payment-id">
                      {order.razorpay_order_id}
                    </span>
                  </div>
                  {order.payment_method && (
                    <div className="info-item">
                      <label>Method:</label>
                      <span>{order.payment_method}</span>
                    </div>
                  )}
                  {order.paid_at && (
                    <div className="info-item">
                      <label>Paid At:</label>
                      <span>{new Date(order.paid_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
