import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { 
  UserIcon, 
  ClipboardDocumentListIcon, 
  MapPinIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { Order, DatabaseOrderItem } from '@/types';

interface UserAddress {
  id: string;
  full_name: string;
  company?: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string;
  is_default: boolean;
  address_type: 'home' | 'office' | 'other';
  created_at: string;
  updated_at: string;
}

interface ProfileOrder extends Order {
  order_items?: DatabaseOrderItem[];
}

export function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');
  
  // Profile state
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Orders state
  const [orders, setOrders] = useState<ProfileOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  // Addresses state
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [addressForm, setAddressForm] = useState<Partial<UserAddress>>({
    full_name: '',
    company: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'India',
    phone: '',
    is_default: false,
    address_type: 'home'
  });

  if (!user) {
    return (
      <div className="profile__unauthorized">
        <h2>Please log in to view your profile</h2>
        <Button onClick={() => navigate('/auth')}>Login</Button>
      </div>
    );
  }

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            quantity,
            unit_price,
            total_price,
            selected_color,
            selected_scent
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to match your Order type
      const transformedOrders: ProfileOrder[] = (data || []).map(dbOrder => ({
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
        courier_partner: dbOrder.courier_partner,
        tracking_url: dbOrder.tracking_url,
        special_request: dbOrder.special_request,
        gift_message: dbOrder.gift_message,
        created_at: dbOrder.created_at,
        updated_at: dbOrder.updated_at,
        confirmed_at: dbOrder.confirmed_at,
        paid_at: dbOrder.paid_at,
        
        // For compatibility
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
        
        items: [], // We'll use order_items
        notes: dbOrder.special_request,
        order_items: dbOrder.order_items
      }));

      setOrders(transformedOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch user addresses
  const fetchAddresses = async () => {
    try {
      setAddressesLoading(true);
      
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error: any) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setAddressesLoading(false);
    }
  };

  // Update profile
  const handleProfileUpdate = async () => {
    try {
      setProfileLoading(true);
      await updateProfile(profileData);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Save address
  const saveAddress = async () => {
    if (!addressForm.full_name?.trim() || !addressForm.address?.trim()) {
      toast.error('Name and address are required');
      return;
    }

    try {
      setAddressesLoading(true);

      if (editingAddress) {
        // Update existing
        const { error } = await supabase
          .from('user_addresses')
          .update(addressForm)
          .eq('id', editingAddress.id);

        if (error) throw error;
        toast.success('Address updated successfully');
      } else {
        // Create new
        const { error } = await supabase
          .from('user_addresses')
          .insert([{ ...addressForm, user_id: user.id }]);

        if (error) throw error;
        toast.success('Address added successfully');
      }

      setShowAddressModal(false);
      setEditingAddress(null);
      resetAddressForm();
      await fetchAddresses();
    } catch (error: any) {
      toast.error(`Failed to save address: ${error.message}`);
    } finally {
      setAddressesLoading(false);
    }
  };

  // Delete address
  const deleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
      toast.success('Address deleted successfully');
      await fetchAddresses();
    } catch (error: any) {
      toast.error('Failed to delete address');
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      full_name: '',
      company: '',
      address: '',
      apartment: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'India',
      phone: '',
      is_default: false,
      address_type: 'home'
    });
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'orders' && orders.length === 0) {
      fetchOrders();
    } else if (activeTab === 'addresses' && addresses.length === 0) {
      fetchAddresses();
    }
  }, [activeTab]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'orders', label: 'Orders', icon: ClipboardDocumentListIcon },
    { id: 'addresses', label: 'Addresses', icon: MapPinIcon }
  ];

  return (
    <div className="profile">
      <div className="profile__container">
        <div className="profile__header">
          <h1>My Account</h1>
          <p>Manage your profile, orders, and addresses</p>
        </div>

        {/* Tab Navigation */}
        <div className="profile__tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`profile__tab ${activeTab === tab.id ? 'profile__tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                <Icon className="profile__tab-icon" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="profile__content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile__section">
              <div className="profile__section-header">
                <h2>Profile Settings</h2>
                <p>Update your personal information</p>
              </div>
              
              <div className="profile__form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      full_name: e.target.value
                    }))}
                    className="form-input"
                    placeholder="Your full name"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="form-input form-input--disabled"
                  />
                  <small>Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))}
                    className="form-input"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div className="form-actions">
                  <Button
                    onClick={handleProfileUpdate}
                    loading={profileLoading}
                    disabled={profileLoading}
                  >
                    Update Profile
                  </Button>
                  
                  <Button
                    onClick={signOut}
                    variant="secondary"
                    className="profile__logout-btn"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="profile__section">
              <div className="profile__section-header">
                <h2>My Orders</h2>
                <p>View and track your orders</p>
              </div>

              {ordersLoading ? (
                <div className="profile__loading">
                  <div className="loading__spinner"></div>
                  <p>Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="profile__empty">
                  <ShoppingBagIcon className="empty-icon" />
                  <h3>No Orders Yet</h3>
                  <p>You haven't placed any orders yet.</p>
                  <Button onClick={() => navigate('/products')}>
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="orders__grid">
                  {orders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-card__header">
                        <div className="order-card__number">
                          #{order.order_number}
                        </div>
                        <div className="order-card__date">
                          <CalendarIcon className="date-icon" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="order-card__body">
                        <div className="order-card__status">
                          <span className={`status-badge status-badge--${order.status}`}>
                            {order.status}
                          </span>
                          <span className={`status-badge status-badge--${order.payment_status}`}>
                            {order.payment_status}
                          </span>
                        </div>

                        <div className="order-card__details">
                          <div className="order-detail">
                            <ShoppingBagIcon className="detail-icon" />
                            <span>{order.order_items?.length || 0} items</span>
                          </div>
                          <div className="order-detail">
                            <CurrencyRupeeIcon className="detail-icon" />
                            <span>₹{order.total_amount.toLocaleString()}</span>
                          </div>
                        </div>

                        {order.tracking_number && (
                          <div className="order-card__tracking">
                            <span>Tracking: {order.tracking_number}</span>
                            {order.tracking_url && (
                              <a 
                                href={order.tracking_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="tracking-link"
                              >
                                Track Package
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="order-card__footer">
                        <Button
                          onClick={() => navigate(`/orders/${order.id}`)}
                          variant="secondary"
                          size="sm"
                        >
                          <EyeIcon className="btn-icon" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="profile__section">
              <div className="profile__section-header">
                <h2>Saved Addresses</h2>
                <p>Manage your delivery addresses</p>
                <Button
                  onClick={() => {
                    resetAddressForm();
                    setEditingAddress(null);
                    setShowAddressModal(true);
                  }}
                  className="profile__add-btn"
                >
                  <PlusIcon className="btn-icon" />
                  Add Address
                </Button>
              </div>

              {addressesLoading ? (
                <div className="profile__loading">
                  <div className="loading__spinner"></div>
                  <p>Loading addresses...</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="profile__empty">
                  <MapPinIcon className="empty-icon" />
                  <h3>No Addresses Saved</h3>
                  <p>Add a delivery address to make checkout faster.</p>
                </div>
              ) : (
                <div className="addresses__grid">
                  {addresses.map((address) => (
                    <div key={address.id} className="address-card">
                      <div className="address-card__header">
                        <div className="address-card__type">
                          <span className={`address-type address-type--${address.address_type}`}>
                            {address.address_type}
                          </span>
                          {address.is_default && (
                            <span className="address-default">Default</span>
                          )}
                        </div>
                        <div className="address-card__actions">
                          <button
                            onClick={() => {
                              setEditingAddress(address);
                              setAddressForm(address);
                              setShowAddressModal(true);
                            }}
                            className="address-action address-action--edit"
                            title="Edit address"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            onClick={() => deleteAddress(address.id)}
                            className="address-action address-action--delete"
                            title="Delete address"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>

                      <div className="address-card__content">
                        <div className="address-name">
                          <strong>{address.full_name}</strong>
                        </div>
                        <div className="address-details">
                          {address.company && <div>{address.company}</div>}
                          <div>{address.address}</div>
                          {address.apartment && <div>{address.apartment}</div>}
                          <div>{address.city}, {address.state} {address.zip_code}</div>
                          <div>📱 {address.phone}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <AddressModal
          addressForm={addressForm}
          setAddressForm={setAddressForm}
          onSave={saveAddress}
          onClose={() => {
            setShowAddressModal(false);
            setEditingAddress(null);
            resetAddressForm();
          }}
          loading={addressesLoading}
          isEditing={!!editingAddress}
        />
      )}
    </div>
  );
}

// Address Modal Component
function AddressModal({
  addressForm,
  setAddressForm,
  onSave,
  onClose,
  loading,
  isEditing
}: {
  addressForm: Partial<UserAddress>;
  setAddressForm: (data: Partial<UserAddress>) => void;
  onSave: () => void;
  onClose: () => void;
  loading: boolean;
  isEditing: boolean;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Address' : 'Add New Address'}</h2>
          <button className="modal-close" onClick={onClose}>
            <XMarkIcon />
          </button>
        </div>

        <div className="modal-body">
          <div className="address-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={addressForm.full_name || ''}
                  onChange={(e) => setAddressForm({
                    ...addressForm,
                    full_name: e.target.value
                  })}
                  className="form-input"
                  placeholder="Full name"
                />
              </div>

              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  value={addressForm.company || ''}
                  onChange={(e) => setAddressForm({
                    ...addressForm,
                    company: e.target.value
                  })}
                  className="form-input"
                  placeholder="Company (optional)"
                />
              </div>

              <div className="form-group form-group--full">
                <label>Address *</label>
                <input
                  type="text"
                  value={addressForm.address || ''}
                  onChange={(e) => setAddressForm({
                    ...addressForm,
                    address: e.target.value
                  })}
                  className="form-input"
                  placeholder="Street address"
                />
              </div>

              <div className="form-group">
                <label>Apartment/Suite</label>
                <input
                  type="text"
                  value={addressForm.apartment || ''}
                  onChange={(e) => setAddressForm({
                    ...addressForm,
                    apartment: e.target.value
                  })}
                  className="form-input"
                  placeholder="Apt, suite, etc."
                />
              </div>

              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={addressForm.city || ''}
                  onChange={(e) => setAddressForm({
                    ...addressForm,
                    city: e.target.value
                  })}
                  className="form-input"
                  placeholder="City"
                />
              </div>

              <div className="form-group">
                <label>State *</label>
                <select
                  value={addressForm.state || ''}
                  onChange={(e) => setAddressForm({
                    ...addressForm,
                    state: e.target.value
                  })}
                  className="form-input"
                >
                  <option value="">Select State</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                </select>
              </div>

              <div className="form-group">
                <label>ZIP Code *</label>
                <input
                  type="text"
                  value={addressForm.zip_code || ''}
                  onChange={(e) => setAddressForm({
                    ...addressForm,
                    zip_code: e.target.value
                  })}
                  className="form-input"
                  placeholder="123456"
                />
              </div>

              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={addressForm.phone || ''}
                  onChange={(e) => setAddressForm({
                    ...addressForm,
                    phone: e.target.value
                  })}
                  className="form-input"
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="form-group">
                <label>Address Type</label>
                <select
                  value={addressForm.address_type || 'home'}
                  onChange={(e) => setAddressForm({
                    ...addressForm,
                    address_type: e.target.value as any
                  })}
                  className="form-input"
                >
                  <option value="home">Home</option>
                  <option value="office">Office</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group form-group--full">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={addressForm.is_default || false}
                    onChange={(e) => setAddressForm({
                      ...addressForm,
                      is_default: e.target.checked
                    })}
                  />
                  <span>Set as default address</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button onClick={onClose} variant="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            loading={loading}
            disabled={!addressForm.full_name?.trim() || !addressForm.address?.trim()}
          >
            {isEditing ? 'Update Address' : 'Save Address'}
          </Button>
        </div>
      </div>
    </div>
  );
}
