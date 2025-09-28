import React, { createContext, useContext, useReducer, type ReactNode, useEffect, useCallback } from 'react';
import type { Product } from '@/types';
import { type PriceBreakdown, priceOptimizer } from '@/utils/priceOptimizer';
import { cartStorage, type CartValidationResult } from '@/services/cartStorage';
import toast from 'react-hot-toast';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  purchaseType: 'piece' | 'set';
  setId?: string;
  breakdown: PriceBreakdown;
  addedAt: string;
  selectedColor: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  totalSavings: number;
  totalOriginalPrice: number;
  isLoading: boolean;
  lastSyncTime: string | null;
  currentUserId?: string;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'id' | 'addedAt'> }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number, products: Product[] } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: { items: CartItem[]; userId?: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { userId?: string } }
  | { type: 'REFRESH_PRICING'; payload: { items: CartItem[] } };

const initialCartState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  totalSavings: 0,
  totalOriginalPrice: 0,
  isLoading: true,
  lastSyncTime: null,
  currentUserId: undefined,
};

function calculateCartTotals(items: CartItem[]) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.breakdown.totalPrice), 0);
  const totalSavings = items.reduce((sum, item) => sum + (item.breakdown.savings), 0);
  const totalOriginalPrice = items.reduce((sum, item) => sum + (item.breakdown.originalPrice), 0);
  
  return { totalItems, totalPrice, totalSavings, totalOriginalPrice };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItem: CartItem = {
        ...action.payload,
        id: `${action.payload.product.id}-${action.payload.purchaseType}-${action.payload.setId || 'piece'}-${Date.now()}`,
        addedAt: new Date().toISOString(),
      };

      const existingIndex = state.items.findIndex(
        item => 
          item.product.id === action.payload.product.id &&
          item.purchaseType === action.payload.purchaseType &&
          item.setId === action.payload.setId &&
          item.selectedColor === action.payload.selectedColor
      );

      let newItems: CartItem[];
      
      if (existingIndex >= 0) {
        newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + action.payload.quantity,
        };
      } else {
        newItems = [...state.items, newItem];
      }

      const totals = calculateCartTotals(newItems);

      return {
        ...state,
        items: newItems,
        ...totals,
        lastSyncTime: new Date().toISOString(),
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.id);
      const totals = calculateCartTotals(newItems);

      return {
        ...state,
        items: newItems,
        ...totals,
        lastSyncTime: new Date().toISOString(),
      };
    }

    case 'UPDATE_QUANTITY': {
      debugger;
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { id: action.payload.id } });
      }

      const cartItem = state.items.find((item) => item.id === action.payload.id );
      const product = action.payload.products?.find((data) => data.id === cartItem?.product?.id);
      let newBreakdown = null;
      if (product && cartItem?.purchaseType === 'piece') {
        newBreakdown = priceOptimizer.calculateOptimalPrice(action.payload.quantity, product.discounted_price, product.actual_price, product.price_sets || [])
      } else if (product && cartItem?.purchaseType === 'set') {
        const { setSize } = cartItem.breakdown.breakdown[0];
        const priceSet = product.price_sets?.find((set) => set.set_quantity === setSize);
        newBreakdown = priceOptimizer.optimizeSetPurchase(priceSet?.id || '', action.payload.quantity, product.discounted_price, product.actual_price, product.price_sets || [])
      }
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { 
            ...item, 
            quantity: action.payload.quantity,
            breakdown: newBreakdown ? newBreakdown : item.breakdown,
            product: product ? product: item.product
          }
          : item
      );



      const totals = calculateCartTotals(newItems);

      return {
        ...state,
        items: newItems,
        ...totals,
        lastSyncTime: new Date().toISOString(),
      };
    }

    case 'CLEAR_CART': {
      return {
        ...initialCartState,
        isLoading: false,
        currentUserId: state.currentUserId,
        lastSyncTime: new Date().toISOString(),
      };
    }

    case 'LOAD_CART': {
      const totals = calculateCartTotals(action.payload.items);
      return {
        ...state,
        items: action.payload.items,
        ...totals,
        currentUserId: action.payload.userId,
        isLoading: false,
        lastSyncTime: new Date().toISOString(),
      };
    }

    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload,
      };
    }

    case 'SET_USER': {
      return {
        ...state,
        currentUserId: action.payload.userId,
      };
    }

    case 'REFRESH_PRICING': {
      const totals = calculateCartTotals(action.payload.items);
      return {
        ...state,
        items: action.payload.items,
        ...totals,
        lastSyncTime: new Date().toISOString(),
      };
    }

    default:
      return state;
  }
}

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addToCart: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number, products: Product[]) => void;
  clearCart: () => void;
  getCartItem: (productId: string, purchaseType: 'piece' | 'set', setId?: string) => CartItem | undefined;
  setUser: (userId?: string) => Promise<void>;
  refreshPricing: () => Promise<void>;
  syncCart: () => Promise<void>;
} | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  // Load cart on mount
  useEffect(() => {
    loadInitialCart();
  }, []);

  // Save cart whenever it changes (with debouncing)
  useEffect(() => {
    if (!state.isLoading && state.lastSyncTime) {
      const timeoutId = setTimeout(() => {
        cartStorage.saveCart(state.items, state.currentUserId);
      }, 500); // Debounce saves

      return () => clearTimeout(timeoutId);
    }
  }, [state.items, state.lastSyncTime, state.currentUserId, state.isLoading]);

  const loadInitialCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load guest cart initially
      const validationResult = await cartStorage.loadCart();
      
      await handleCartValidation(validationResult);
      
      dispatch({ 
        type: 'LOAD_CART', 
        payload: { 
          items: [...validationResult.validItems, ...validationResult.updatedItems.map(u => u.item)]
        } 
      });
    } catch (error) {
      console.error('Failed to load initial cart:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleCartValidation = async (validationResult: CartValidationResult) => {
    // Recalculate pricing for all items
    const itemsWithUpdatedPricing = await Promise.all(
      [...validationResult.validItems, ...validationResult.updatedItems.map(u => u.item)]
        .map(async (item) => {
          try {
            const updatedBreakdown = item.purchaseType === 'set' && item.setId
              ? priceOptimizer.optimizeSetPurchase(
                  item.setId,
                  item.quantity,
                  item.product.discounted_price,
                  item.product.actual_price,
                  item.product.price_sets || []
                )
              : priceOptimizer.calculateOptimalPrice(
                  item.quantity * (item.breakdown.totalPieces / item.quantity), // Original piece count per quantity
                  item.product.discounted_price,
                  item.product.actual_price,
                  item.product.price_sets || []
                );

            return {
              ...item,
              breakdown: updatedBreakdown
            };
          } catch (error) {
            console.error('Error recalculating pricing for item:', item.id, error);
            return item;
          }
        })
    );

    // Show notifications for invalid items
    if (validationResult.invalidItems.length > 0) {
      toast.error(
        `${validationResult.invalidItems.length} item(s) were removed from your cart due to availability changes`,
        { duration: 4000 }
      );
    }

    return itemsWithUpdatedPricing;
  };

  const addToCart = useCallback((item: Omit<CartItem, 'id' | 'addedAt'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number, products: Product[]) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity, products } });
  }, []);

  const clearCart = useCallback(() => {
    cartStorage.clearCart(state.currentUserId);
    dispatch({ type: 'CLEAR_CART' });
  }, [state.currentUserId]);

  const getCartItem = useCallback((productId: string, purchaseType: 'piece' | 'set', setId?: string) => {
    return state.items.find(
      item => 
        item.product.id === productId &&
        item.purchaseType === purchaseType &&
        item.setId === setId
    );
  }, [state.items]);

  const setUser = useCallback(async (userId?: string) => {
    if (state.currentUserId === userId) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const validationResult = await cartStorage.switchCartContext(state.currentUserId, userId);
      const updatedItems = await handleCartValidation(validationResult);
      
      dispatch({ 
        type: 'LOAD_CART', 
        payload: { 
          items: updatedItems,
          userId 
        } 
      });

      // if (validationResult.validItems.length > 0 || validationResult.updatedItems.length > 0) {
      //   toast.success(
      //     userId ? 'Welcome back! Your cart has been restored.' : 'Switched to guest cart.',
      //     { duration: 3000 }
      //   );
      // }
    } catch (error) {
      console.error('Failed to switch user context:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      toast.error('Failed to load your cart. Please refresh the page.');
    }
  }, [state.currentUserId]);

  const refreshPricing = useCallback(async () => {
    if (state.items.length === 0) return;

    try {
      const validationResult = await cartStorage.validateCartItems(
        state.items.map(item => ({
          id: item.id,
          productId: item.product.id,
          quantity: item.quantity,
          purchaseType: item.purchaseType,
          setId: item.setId,
          breakdown: item.breakdown,
          addedAt: item.addedAt
        }))
      );

      const updatedItems = await handleCartValidation(validationResult);
      dispatch({ type: 'REFRESH_PRICING', payload: { items: updatedItems } });
    } catch (error) {
      console.error('Failed to refresh pricing:', error);
      toast.error('Failed to update cart prices');
    }
  }, [state.items]);

  const syncCart = useCallback(async () => {
    try {
      cartStorage.saveCart(state.items, state.currentUserId);
      toast.success('Cart synced successfully');
    } catch (error) {
      console.error('Failed to sync cart:', error);
      toast.error('Failed to sync cart');
    }
  }, [state.items, state.currentUserId]);

  return (
    <CartContext.Provider value={{ 
      state, 
      dispatch, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      getCartItem,
      setUser,
      refreshPricing,
      syncCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
