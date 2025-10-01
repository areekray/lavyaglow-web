import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useLocationIQAutocomplete } from '@/hooks/useLocationIQAutocomplete';
import Input from '@/components/ui/Input';

interface AddressAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: {
    fullAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

export function AddressAutocomplete({
  label,
  value,
  onChange,
  onAddressSelect,
  error,
  placeholder = "Start typing your address...",
  required = false
}: AddressAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [addressSelected, setAddressSelected] = useState(false);
  
  const { 
    suggestions, 
    loading, 
    error: apiError,
    searchAddresses, 
    parseLocationIQAddress,
    clearSuggestions 
  } = useLocationIQAutocomplete();

  // Handle search with proper debouncing
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search if value is empty or too short
    if (!value || value.length < 3) {
      setShowSuggestions(false);
      setHasSearched(false);
      clearSuggestions();
      return;
    }

    // Debounced search
    searchTimeoutRef.current = setTimeout(async () => {
      setHasSearched(true);
      if (!addressSelected) {
        await searchAddresses(value);
      }
    }, 300);

    // Cleanup timeout on dependency change
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [value, searchAddresses, clearSuggestions]);

  // Show suggestions when we have results
  useEffect(() => {
    if (hasSearched && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [suggestions, hasSearched]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Reset search state when input changes
    if (newValue.length < 3) {
      setHasSearched(false);
      setShowSuggestions(false);
    }
  };

  const handleInputFocus = () => {
    // Show suggestions if we have them
    setAddressSelected(false);
    if (suggestions.length > 0 && hasSearched) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleSuggestionSelect = (place: any) => {
    setAddressSelected(true);
    const addressComponents = parseLocationIQAddress(place);
    onChange(addressComponents.fullAddress);
    onAddressSelect(addressComponents);
    setShowSuggestions(false);
    setHasSearched(false);
    
    // Clear suggestions to prevent re-showing
    clearSuggestions();
    
    // Blur input
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const getHintText = () => {
    if (!value || addressSelected) return "Type at least 3 characters for suggestions";
    if (value.length < 3) return "Keep typing...";
    if (loading) return "Searching...";
    if (apiError) return `⚠️ ${apiError}`;
    if (hasSearched && suggestions.length === 0) return "No addresses found. Try different keywords.";
    return null;
  };

  return (
    <div className="address-autocomplete">
      <div className="address-autocomplete__input-container">
        <Input
          ref={inputRef}
          label={label}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          error={error}
          required={required}
          autoComplete="address-line1"
        />
        
        <div className="address-autocomplete__icon">
          {loading ? (
            <div className="loading-spinner" />
          ) : (
            <MagnifyingGlassIcon className="w-5 h-5" />
          )}
        </div>
        
        {getHintText() && (
          <div className="address-autocomplete__hint">
            <span className={apiError ? "error-hint" : ""}>{getHintText()}</span>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="address-autocomplete__suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.place_id}-${index}`}
              className="suggestion-item"
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <div className="suggestion-icon">
                <MapPinIcon className="w-4 h-4" />
              </div>
              <div className="suggestion-content">
                <div className="suggestion-title">
                  {suggestion.display_place}
                </div>
                <div className="suggestion-address">
                  {suggestion.display_address}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
