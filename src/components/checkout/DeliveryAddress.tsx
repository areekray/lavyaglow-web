import React, { useEffect, useState, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { UserIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationIQAutocomplete } from '@/hooks/useLocationIQAutocomplete';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/services/supabase';
import type { CheckoutFormData } from '@/pages/checkout/Checkout';
import toast from 'react-hot-toast';

interface SavedAddress {
  id: string;
  full_name: string;
  company?: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  country: string;
  is_default: boolean;
}

export function DeliveryAddress() {
  const { register, setValue, watch, formState: { errors }, trigger } = useFormContext<CheckoutFormData>();
  const { user } = useAuth();
  const { validatePinCode } = useLocationIQAutocomplete();
  
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<string>('');
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const deliveryData = watch('delivery');

  // Memoize customer info to prevent unnecessary re-renders
  const customerInfo = useMemo(() => ({
    name: user?.full_name || user?.email || 'Customer',
    email: user?.email || '',
    phone: user?.phone || ''
  }), [user?.full_name, user?.email, user?.phone]);

  // Load saved addresses on mount
  useEffect(() => {
    if (user?.id) {
      loadSavedAddresses();
    }
  }, [user?.id]);

  const loadSavedAddresses = async () => {
    if (!user?.id) return;

    setLoadingAddresses(true);
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedAddresses(data || []);
    } catch (error) {
      console.error('Failed to load saved addresses:', error);
      toast.error('Failed to load saved addresses');
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleUseSavedAddress = (address: SavedAddress) => {
    setValue('delivery.fullName', address.full_name);
    setValue('delivery.company', address.company || '');
    setValue('delivery.address', address.address);
    setValue('delivery.apartment', address.apartment || '');
    setValue('delivery.city', address.city);
    setValue('delivery.state', address.state);
    setValue('delivery.zipCode', address.zip_code);
    setValue('delivery.phone', address.phone);
    setValue('delivery.country', address.country);
    
    setSelectedSavedAddress(address.id);
    setShowSavedAddresses(false);
    
    // Trigger validation
    setTimeout(() => {
      trigger(['delivery.fullName', 'delivery.address', 'delivery.city', 'delivery.state', 'delivery.zipCode', 'delivery.phone']);
    }, 100);
    
    toast.success('Address loaded! 📍');
  };

  const handleUseAccountInfo = () => {
    if (user?.full_name) setValue('delivery.fullName', user.full_name);
    if (user?.phone) setValue('delivery.phone', user.phone);
    trigger(['delivery.fullName', 'delivery.phone']);
  };

  const handleAddressSelect = (addressComponents: any) => {
    setValue('delivery.address', addressComponents.fullAddress);
    setValue('delivery.city', addressComponents.city);
    setValue('delivery.state', addressComponents.state);
    setValue('delivery.zipCode', addressComponents.zipCode);
    
    // Clear selected saved address
    setSelectedSavedAddress('');
    
    // Trigger validation
    setTimeout(() => {
      trigger(['delivery.address', 'delivery.city', 'delivery.state', 'delivery.zipCode']);
    }, 100);
  };

  const handlePinCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pinCode = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setValue('delivery.zipCode', pinCode);

    if (pinCode.length === 6) {
      try {
        const validation = await validatePinCode(pinCode);
        
        if (validation.isValid) {
          if (validation.city && !deliveryData.city) {
            setValue('delivery.city', validation.city);
          }
          if (validation.state && !deliveryData.state) {
            setValue('delivery.state', validation.state);
          }
          toast.success('PIN code validated! 📍');
        } else {
          toast.error('Invalid PIN code');
        }
      } catch (error) {
        toast.error('PIN code validation failed');
      }
      
      trigger('delivery.zipCode');
    }
  };

  return (
    <div className="delivery-address">
      <div className="section-header">
        <h2>🚚 Delivery Address</h2>
      </div>

      {/* Customer Info Summary */}
      <div className="customer-summary">
        <div className="customer-info">
          <h3>Order for: {customerInfo.name}</h3>
          <p>📧 {customerInfo.email}</p>
          {customerInfo.phone && <p>📱 {customerInfo.phone}</p>}
        </div>
      </div>

      {/* Saved Addresses */}
      {savedAddresses.length > 0 && (
        <div className="saved-addresses-section">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowSavedAddresses(!showSavedAddresses)}
            className="toggle-saved-btn"
            loading={loadingAddresses}
          >
            <MapPinIcon className="w-5 h-5" />
            Choose from saved addresses ({savedAddresses.length})
            <span className={`toggle-arrow ${showSavedAddresses ? 'open' : ''}`}>▼</span>
          </Button>

          {showSavedAddresses && (
            <div className="saved-addresses-list">
              {savedAddresses.map((address) => (
                <div
                  key={address.id}
                  className={`saved-address-card ${selectedSavedAddress === address.id ? 'selected' : ''}`}
                  onClick={() => handleUseSavedAddress(address)}
                >
                  <div className="address-info">
                    <h4>
                      {address.full_name}
                      {address.is_default && <span className="default-badge">Default</span>}
                    </h4>
                    {address.company && <p className="company">{address.company}</p>}
                    <p className="address-line">{address.address}</p>
                    {address.apartment && <p className="apartment">{address.apartment}</p>}
                    <p className="location">{address.city}, {address.state} {address.zip_code}</p>
                    <p className="phone">📱 {address.phone}</p>
                  </div>
                  <div className="address-actions">
                    <span className="select-text">Click to use</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="address-form">
        {/* Full Name with Account Info Option */}
        <div className="form-row">
          <div className="input-with-suggestion">
            <Input
              label="Full Name *"
              {...register('delivery.fullName', { required: 'Full name is required' })}
              error={errors.delivery?.fullName?.message}
              autoComplete="name"
            />
            {user?.full_name && deliveryData.fullName !== user.full_name && (
              <button
                type="button"
                className="suggestion-btn"
                onClick={handleUseAccountInfo}
              >
                <UserIcon className="w-4 h-4" />
                Use account name
              </button>
            )}
          </div>
        </div>

        {/* Company */}
        <div className="form-row">
          <Input
            label="Company (Optional)"
            {...register('delivery.company')}
            placeholder="Company or Organization name"
            autoComplete="organization"
          />
        </div>

        {/* Country */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-group__label">Country *</label>
            <select 
              {...register('delivery.country')}
              className="form-group__select country-select"
              disabled
            >
              <option value="India">🇮🇳 India</option>
            </select>
          </div>
        </div>

        {/* Address with LocationIQ Autocomplete */}
        <div className="form-row">
          <AddressAutocomplete
            label="Street Address *"
            value={deliveryData.address || ''}
            onChange={(value) => setValue('delivery.address', value)}
            onAddressSelect={handleAddressSelect}
            error={errors.delivery?.address?.message}
            placeholder="House number, building name, street name..."
            required
          />
        </div>

        {/* Apartment */}
        <div className="form-row">
          <Input
            label="Apartment, Suite, Floor, etc. (Optional)"
            {...register('delivery.apartment')}
            placeholder="Apt 4B, Floor 2, Near Metro Station..."
            autoComplete="address-line2"
          />
        </div>

        {/* City, State, ZIP */}
        <div className="form-row form-row--three-col">
          <Input
            label="City *"
            {...register('delivery.city', { required: 'City is required' })}
            error={errors.delivery?.city?.message}
            placeholder="Mumbai"
            autoComplete="address-level2"
          />
          <Input
            label="State *"
            {...register('delivery.state', { required: 'State is required' })}
            error={errors.delivery?.state?.message}
            placeholder="Maharashtra"
            autoComplete="address-level1"
          />
          <Input
            label="PIN Code *"
            {...register('delivery.zipCode', { 
              required: 'PIN code is required',
              pattern: {
                value: /^[1-9][0-9]{5}$/,
                message: 'Please enter a valid 6-digit PIN code'
              },
              onChange: handlePinCodeChange
            })}
            error={errors.delivery?.zipCode?.message}
            placeholder="400001"
            maxLength={6}
            autoComplete="postal-code"
          />
        </div>

        {/* Phone with Account Info Option */}
        <div className="form-row">
          <div className="input-with-suggestion">
            <Input
              label="Phone Number *"
              type="tel"
              {...register('delivery.phone', { 
                required: 'Phone number is required',
                pattern: {
                  value: /^[\+]?[1-9][\d]{9,14}$/,
                  message: 'Please enter a valid phone number'
                }
              })}
              error={errors.delivery?.phone?.message}
              placeholder="+91 9876543210"
              autoComplete="tel"
            />
            {user?.phone && deliveryData.phone !== user.phone && (
              <button
                type="button"
                className="suggestion-btn"
                onClick={() => setValue('delivery.phone', user.phone as string)}
              >
                <PhoneIcon className="w-4 h-4" />
                Use account phone
              </button>
            )}
          </div>
        </div>

        {/* Save Address Option */}
        <div className="form-row">
          <label className="save-address-checkbox">
            <input
              type="checkbox"
              {...register('delivery.saveAddress')}
            />
            <span className="checkmark"></span>
            <span className="checkbox-text">
              💾 Save this address for future orders
              <small>We'll securely store this address for faster checkout next time</small>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
