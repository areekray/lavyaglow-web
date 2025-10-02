import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationIQAutocomplete } from '@/hooks/useLocationIQAutocomplete';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
import Input from '@/components/ui/Input';
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

export function BillingAddress() {
  const { register, setValue, watch, formState: { errors }, trigger } = useFormContext<CheckoutFormData>();
  const { user } = useAuth();
  const { validatePinCode } = useLocationIQAutocomplete();
  
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);

  const billingData = watch('billing');
  const deliveryData = watch('delivery');

  // Load saved addresses for billing
  useEffect(() => {
    if (user && !billingData.sameAsDelivery) {
      loadSavedAddresses();
    }
  }, [user, billingData.sameAsDelivery]);

  const loadSavedAddresses = async () => {
    if (!user) return;

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
    }
  };

  // Copy delivery data when "same as delivery" is checked
  useEffect(() => {
    if (billingData.sameAsDelivery) {
      setValue('billing.fullName', deliveryData.fullName);
      setValue('billing.company', deliveryData.company);
      setValue('billing.address', deliveryData.address);
      setValue('billing.apartment', deliveryData.apartment);
      setValue('billing.city', deliveryData.city);
      setValue('billing.state', deliveryData.state);
      setValue('billing.zipCode', deliveryData.zipCode);
      setValue('billing.phone', deliveryData.phone);
      setValue('billing.country', deliveryData.country);
    } else {
      // Clear billing fields when unchecked
      setValue('billing.fullName', '');
      setValue('billing.company', '');
      setValue('billing.address', '');
      setValue('billing.apartment', '');
      setValue('billing.city', '');
      setValue('billing.state', '');
      setValue('billing.zipCode', '');
      setValue('billing.phone', '');
      setValue('billing.country', 'India');
    }
  }, [billingData.sameAsDelivery, deliveryData, setValue]);

  const handleUseSavedAddress = (address: SavedAddress) => {
    setValue('billing.fullName', address.full_name);
    setValue('billing.company', address.company || '');
    setValue('billing.address', address.address);
    setValue('billing.apartment', address.apartment || '');
    setValue('billing.city', address.city);
    setValue('billing.state', address.state);
    setValue('billing.zipCode', address.zip_code);
    setValue('billing.phone', address.phone);
    setValue('billing.country', address.country);
    
    setShowSavedAddresses(false);
    
    // Trigger validation
    setTimeout(() => {
      trigger(['billing.fullName', 'billing.address', 'billing.city', 'billing.state', 'billing.zipCode', 'billing.phone']);
    }, 100);
    
    toast.success('Billing address loaded! 💳');
  };

  const handleAddressSelect = (addressComponents: any) => {
    setValue('billing.address', addressComponents.fullAddress);
    setValue('billing.city', addressComponents.city);
    setValue('billing.state', addressComponents.state);
    setValue('billing.zipCode', addressComponents.zipCode);
    
    setTimeout(() => {
      trigger(['billing.address', 'billing.city', 'billing.state', 'billing.zipCode']);
    }, 100);
  };

  const handlePinCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pinCode = e.target.value;
    setValue('billing.zipCode', pinCode);

    if (pinCode.length === 6) {
      const validation = await validatePinCode(pinCode);
      
      if (validation.isValid) {
        if (validation.city && !billingData.city) {
          setValue('billing.city', validation.city);
        }
        if (validation.state && !billingData.state) {
          setValue('billing.state', validation.state);
        }
        toast.success('PIN code validated! 📍');
      } else {
        toast.error('Invalid PIN code. Please check and try again.');
      }
      
      trigger('billing.zipCode');
    }
  };

  return (
    <div className="billing-address">
      <div className="section-header">
        <h2>Billing Address</h2>
        {/* <p>Where should we send your invoice and receipt?</p> */}
      </div>

      {/* Same as Delivery Toggle */}
      <div className="billing-toggle">
        <label className="toggle-checkbox main-toggle">
          <input
            type="checkbox"
            {...register('billing.sameAsDelivery')}
          />
          <span className="checkmark large"></span>
          <span className="checkbox-text">
            <div>{billingData.sameAsDelivery ? 'Same as delivery address' : 'Enter different address for Billing'}</div>
            <small>If checked the same address will be used for billing and delivery</small>
          </span>
        </label>
      </div>

      {/* Billing Address Form - Only show if different from delivery */}
      {!billingData.sameAsDelivery && (
        <div className="billing-form">
          {/* Different Address Notice */}
          {/* <div className="different-address-notice">
            <div className="notice-icon">ℹ️</div>
            <div className="notice-text">
              <h4>Using a different billing address</h4>
              <p>Make sure this matches your payment method's registered address</p>
            </div>
          </div> */}

          {/* Saved Addresses for Billing */}
          {savedAddresses.length > 0 && (
            <div className="saved-addresses-section">
              <button
                type="button"
                className="saved-addresses-toggle"
                onClick={() => setShowSavedAddresses(!showSavedAddresses)}
              >
                📍 Choose from saved addresses ({savedAddresses.length})
              </button>

              {showSavedAddresses && (
                <div className="saved-addresses-list">
                  {savedAddresses.map((address) => (
                    <div
                      key={address.id}
                      className="saved-address-card"
                      onClick={() => handleUseSavedAddress(address)}
                    >
                      <div className="address-info">
                        <h4>{address.full_name}</h4>
                        <p>{address.address}</p>
                        <p>{address.city}, {address.state} {address.zip_code}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Billing Form Fields */}
          <div className="billing-form-fields">
            {/* Full Name */}
            <div className="form-row">
              <Input
                label="Full Name *"
                {...register('billing.fullName', { 
                  required: !billingData.sameAsDelivery ? 'Full name is required' : false 
                })}
                error={errors.billing?.fullName?.message}
              />
            </div>

            {/* Company */}
            <div className="form-row">
              <Input
                label="Company (Optional)"
                {...register('billing.company')}
                placeholder="Company or Organization name"
              />
            </div>

            {/* Country */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-group__label">Country *</label>
                <select 
                  {...register('billing.country')}
                  className="form-group__select country-select"
                  disabled
                >
                  <option value="India">🇮🇳 India</option>
                </select>
              </div>
            </div>

            {/* Address with Autocomplete */}
            <div className="form-row">
              <AddressAutocomplete
                label="Street Address *"
                value={billingData.address || ''}
                onChange={(value) => setValue('billing.address', value)}
                onAddressSelect={handleAddressSelect}
                error={errors.billing?.address?.message}
                placeholder="House number, building name, street name..."
                required={!billingData.sameAsDelivery}
              />
            </div>

            {/* Apartment */}
            <div className="form-row">
              <Input
                label="Apartment, House Number, Floor, etc. (Optional)"
                {...register('billing.apartment')}
                placeholder="Apt 4B, Floor 2, Near Metro Station..."
              />
            </div>

            {/* City, State, ZIP */}
            <div className="form-row form-row--three-col">
              <Input
                label="City *"
                {...register('billing.city', { 
                  required: !billingData.sameAsDelivery ? 'City is required' : false 
                })}
                error={errors.billing?.city?.message}
                placeholder="Mumbai"
              />
              <Input
                label="State *"
                {...register('billing.state', { 
                  required: !billingData.sameAsDelivery ? 'State is required' : false 
                })}
                error={errors.billing?.state?.message}
                placeholder="Maharashtra"
              />
              <Input
                label="PIN Code *"
                {...register('billing.zipCode', { 
                  required: !billingData.sameAsDelivery ? 'PIN code is required' : false,
                  pattern: {
                    value: /^[1-9][0-9]{5}$/,
                    message: 'Please enter a valid PIN code'
                  },
                  onChange: handlePinCodeChange
                })}
                error={errors.billing?.zipCode?.message}
                placeholder="400001"
                maxLength={6}
              />
            </div>

            {/* Phone */}
            <div className="form-row">
              <Input
                label="Phone Number *"
                type="tel"
                {...register('billing.phone', { 
                  required: !billingData.sameAsDelivery ? 'Phone number is required' : false,
                  pattern: {
                    value: /^[\+]?[1-9][\d]{9,14}$/,
                    message: 'Please enter a valid phone number'
                  }
                })}
                error={errors.billing?.phone?.message}
                placeholder="+91 9876543210"
              />
            </div>
          </div>
        </div>
      )}

      {/* Same Address Confirmation */}
      {/* {billingData.sameAsDelivery && (
        <div className="same-address-confirmation">
          <div className="confirmation-card">
            <div className="confirmation-icon">✅</div>
            <div className="confirmation-content">
              <h4>Billing address confirmed</h4>
              <p>Your invoice will be sent to the same address as delivery:</p>
              <div className="address-preview">
                <strong>{deliveryData.fullName}</strong>
                {deliveryData.company && <div>{deliveryData.company}</div>}
                <div>{deliveryData.address}</div>
                {deliveryData.apartment && <div>{deliveryData.apartment}</div>}
                <div>{deliveryData.city}, {deliveryData.state} {deliveryData.zipCode}</div>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
