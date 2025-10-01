import { useState, useCallback, useRef, useEffect } from 'react';

const LOCATIONIQ_API_KEY = 'pk.e1455c910f5bfa49d2868056d986d430';
const LOCATIONIQ_BASE_URL = 'https://api.locationiq.com/v1';

interface LocationIQPlace {
  place_id: string;
  osm_id: string;
  osm_type: string;
  lat: string;
  lon: string;
  display_name: string;
  display_place: string;
  display_address: string;
    address: {
    // Common fields
    name?: string;
    house_number?: string;
    house_name?: string;
    road?: string;
    street?: string;
    neighbourhood?: string;
    suburb?: string;
    village?: string;
    town?: string;
    city?: string;
    municipality?: string;
    county?: string;
    district?: string;
    state_district?: string;
    state?: string;
    region?: string;
    postcode?: string;
    country?: string;
    country_code?: string;

    // Additional OSM-specific fields
    hamlet?: string;
    locality?: string;
    borough?: string;
    city_district?: string;
    province?: string;
    island?: string;
    archipelago?: string;
    continent?: string;

    // Landmarks / POIs
    building?: string;
    amenity?: string;
    shop?: string;
    office?: string;
    leisure?: string;
    tourism?: string;

    // Extras sometimes seen
    postcode_ext?: string;
    ISO3166_2_lvl4?: string;
    ISO3166_2_lvl6?: string;
  };
}

interface AddressComponents {
  fullAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export function useLocationIQAutocomplete() {
  const [suggestions, setSuggestions] = useState<LocationIQPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store refs for cleanup
  const currentRequestRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastQueryRef = useRef<string>('');

  // Cleanup function
  const cleanup = useCallback(() => {
    // Cancel current request
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
      currentRequestRef.current = null;
    }

    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setLoading(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const searchAddresses = useCallback((query: string): Promise<LocationIQPlace[]> => {
    return new Promise((resolve) => {
      // Clear previous timer and request
      cleanup();
      
      // Reset error
      setError(null);

      // Don't search if query is too short or same as last query
      if (!query || query.length < 3) {
        setSuggestions([]);
        resolve([]);
        return;
      }

      // Don't search if it's the same query
      if (query === lastQueryRef.current) {
        resolve(suggestions);
        return;
      }

      // Set loading state
      setLoading(true);

      // Debounced search
      debounceTimerRef.current = setTimeout(async () => {
        try {
          // Create new abort controller
          const abortController = new AbortController();
          currentRequestRef.current = abortController;
          
          // Store current query
          lastQueryRef.current = query;

          const response = await fetch(
            `${LOCATIONIQ_BASE_URL}/autocomplete?` +
            new URLSearchParams({
              key: LOCATIONIQ_API_KEY,
              q: query,
              limit: '5',
              countrycodes: 'in',
              format: 'json',
              addressdetails: '1',
              normalizecity: '1',
              accept_language: 'en'
            }),
            { 
              signal: abortController.signal,
              headers: {
                'Accept': 'application/json',
              }
            }
          );

          if (!response.ok) {
            throw new Error(`LocationIQ API error: ${response.status}`);
          }

          const data: LocationIQPlace[] = await response.json();
          
          // Only update if request wasn't aborted
          if (!abortController.signal.aborted) {
            setSuggestions(data);
            setLoading(false);
            resolve(data);
          }
          
        } catch (err: any) {
          if (!currentRequestRef.current?.signal.aborted) {
            const errorMessage = err.name === 'AbortError' ? 'Request cancelled' : err.message;
            console.error('LocationIQ search error:', errorMessage);
            setError('Search failed. Please try again.');
            setLoading(false);
            setSuggestions([]);
            resolve([]);
          }
        } finally {
          currentRequestRef.current = null;
        }
      }, 500); // Increased debounce delay
    });
  }, [cleanup, suggestions]);

  const parseLocationIQAddress = useCallback((place: LocationIQPlace): AddressComponents => {
    const { address } = place;
    const {
    name,
    house_number,
    road,
    street,
    neighbourhood,
    suburb,
    hamlet,
    village,
    town,
    borough,
    locality,
    building,
    amenity,
    shop,
    office,
    leisure,
    tourism,
    // excluded: city, county, state, country, postcode
  } = address;

  // Collect non-empty fields
  const parts = [
    house_number,
    building,
    name,
    road || street,
    neighbourhood,
    suburb,
    hamlet,
    locality,
    borough,
    village,
    town,
    amenity,
    shop,
    office,
    leisure,
    tourism,
  ].filter(Boolean);

    return {
      fullAddress: parts.length > 0 ? parts.join(", ") : place.display_place,
      city: address.county || address.city || "",
      state: address.state || "",
      zipCode: address.postcode || "",
      country: address.country || "India",
    };
  }, []);

  const validatePinCode = useCallback(async (pinCode: string): Promise<{
    isValid: boolean;
    city?: string;
    state?: string;
  }> => {
    if (!pinCode || !/^[1-9][0-9]{5}$/.test(pinCode)) {
      return { isValid: false };
    }

    try {
      const response = await fetch(
        `${LOCATIONIQ_BASE_URL}/search?` +
        new URLSearchParams({
          key: LOCATIONIQ_API_KEY,
          q: pinCode,
          format: 'json',
          addressdetails: '1',
          limit: '1',
          countrycodes: 'in'
        })
      );

      if (!response.ok) {
        return { isValid: false };
      }

      const data: LocationIQPlace[] = await response.json();
      
      if (data.length > 0) {
        const place = data[0];
        return {
          isValid: true,
          city: place.address.city || place.address.suburb || '',
          state: place.address.state || ''
        };
      }

      return { isValid: false };
    } catch (error) {
      console.error('PIN code validation error:', error);
      return { isValid: false };
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    cleanup();
    setSuggestions([]);
    setError(null);
    lastQueryRef.current = '';
  }, [cleanup]);

  return {
    suggestions,
    loading,
    error,
    searchAddresses,
    parseLocationIQAddress,
    validatePinCode,
    clearSuggestions
  };
}
