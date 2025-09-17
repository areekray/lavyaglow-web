import type { CartItem } from '@/contexts/CartContext';
import type { Product } from '@/types';
import { productService } from '@/services/productService';

export interface StoredCartItem {
  id: string;
  productId: string;
  quantity: number;
  purchaseType: 'piece' | 'set';
  setId?: string;
  breakdown: any; // We'll validate this on load
  addedAt: string;
  lastValidated?: string;
}

export interface CartValidationResult {
  validItems: CartItem[];
  invalidItems: {
    item: StoredCartItem;
    reason: string;
  }[];
  updatedItems: {
    item: CartItem;
    changes: string[];
  }[];
}

class CartStorageService {
  private readonly STORAGE_PREFIX = 'lavyaglow-cart';
  private readonly VALIDATION_INTERVAL = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Generate storage key for user context
   */
  private getStorageKey(userId?: string): string {
    if (userId) {
      return `${this.STORAGE_PREFIX}:user:${userId}`;
    }
    return `${this.STORAGE_PREFIX}:guest`;
  }

  /**
   * Get all cart keys from localStorage
   */
  private getAllCartKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.STORAGE_PREFIX)) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Save cart items for specific user context
   */
  saveCart(items: CartItem[], userId?: string): void {
    const key = this.getStorageKey(userId);
    const storedItems: StoredCartItem[] = items.map(item => ({
      id: item.id,
      productId: item.product.id,
      quantity: item.quantity,
      purchaseType: item.purchaseType,
      setId: item.setId,
      breakdown: item.breakdown,
      addedAt: item.addedAt,
      lastValidated: new Date().toISOString()
    }));

    try {
      localStorage.setItem(key, JSON.stringify(storedItems));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
      // Handle storage quota exceeded
      this.clearOldestCarts();
      try {
        localStorage.setItem(key, JSON.stringify(storedItems));
      } catch (retryError) {
        console.error('Failed to save cart after cleanup:', retryError);
      }
    }
  }

  /**
   * Load raw cart items from storage (without validation)
   */
  loadRawCart(userId?: string): StoredCartItem[] {
    const key = this.getStorageKey(userId);
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      return [];
    }
  }

  /**
   * Load and validate cart items
   */
  async loadCart(userId?: string): Promise<CartValidationResult> {
    const storedItems = this.loadRawCart(userId);
    
    if (storedItems.length === 0) {
      return {
        validItems: [],
        invalidItems: [],
        updatedItems: []
      };
    }

    return this.validateCartItems(storedItems);
  }

  /**
   * Validate cart items against current product data
   */
  async validateCartItems(storedItems: StoredCartItem[]): Promise<CartValidationResult> {
    const validItems: CartItem[] = [];
    const invalidItems: { item: StoredCartItem; reason: string; }[] = [];
    const updatedItems: { item: CartItem; changes: string[]; }[] = [];

    for (const storedItem of storedItems) {
      try {
        // Skip validation if recently validated
        const lastValidated = storedItem.lastValidated ? new Date(storedItem.lastValidated) : null;
        const now = new Date();
        const shouldValidate = !lastValidated || 
          (now.getTime() - lastValidated.getTime()) > this.VALIDATION_INTERVAL;

        let product: Product;
        try {
          const productInfo = await productService.getProductById(storedItem.productId);
          if (!productInfo) {
            throw new Error("Product no loger available");
          }
          product = productInfo;
        } catch (error) {
          invalidItems.push({
            item: storedItem,
            reason: 'Product no longer available'
          });
          continue;
        }

        if (!shouldValidate) {
          // Use stored data without validation
          const cartItem: CartItem = {
            id: storedItem.id,
            product,
            quantity: storedItem.quantity,
            purchaseType: storedItem.purchaseType,
            setId: storedItem.setId,
            breakdown: storedItem.breakdown,
            addedAt: storedItem.addedAt
          };
          validItems.push(cartItem);
          continue;
        }

        // Validate product availability
        if (!product.in_stock) {
          invalidItems.push({
            item: storedItem,
            reason: 'Product is now out of stock'
          });
          continue;
        }

        // Validate stock quantity for non-bulk items
        if (!product.can_do_bulk && storedItem.quantity > product.stock_quantity) {
          if (product.stock_quantity === 0) {
            invalidItems.push({
              item: storedItem,
              reason: 'Product is now out of stock'
            });
            continue;
          }
          
          // Adjust quantity to available stock
          const changes = [`Quantity reduced from ${storedItem.quantity} to ${product.stock_quantity} due to limited stock`];
          
          const cartItem: CartItem = {
            id: storedItem.id,
            product,
            quantity: product.stock_quantity,
            purchaseType: storedItem.purchaseType,
            setId: storedItem.setId,
            breakdown: storedItem.breakdown, // Will be recalculated by context
            addedAt: storedItem.addedAt
          };
          
          updatedItems.push({ item: cartItem, changes });
          continue;
        }

        // Validate set availability if purchasing sets
        if (storedItem.purchaseType === 'set' && storedItem.setId) {
          const set = product.price_sets?.find(s => s.id === storedItem.setId);
          if (!set) {
            invalidItems.push({
              item: storedItem,
              reason: 'Selected set is no longer available'
            });
            continue;
          }
        }

        // Check for price changes
        const changes: string[] = [];
        const currentPrice = storedItem.purchaseType === 'set' && storedItem.setId
          ? product.price_sets?.find(s => s.id === storedItem.setId)?.discounted_price || 0
          : product.discounted_price;

        const storedPrice = storedItem.breakdown.totalPrice / storedItem.quantity;
        if (Math.abs(currentPrice - storedPrice) > 0.01) {
          changes.push(`Price updated from ₹${storedPrice.toFixed(2)} to ₹${currentPrice.toFixed(2)}`);
        }

        const cartItem: CartItem = {
          id: storedItem.id,
          product,
          quantity: storedItem.quantity,
          purchaseType: storedItem.purchaseType,
          setId: storedItem.setId,
          breakdown: storedItem.breakdown, // Will be recalculated by context
          addedAt: storedItem.addedAt
        };

        if (changes.length > 0) {
          updatedItems.push({ item: cartItem, changes });
        } else {
          validItems.push(cartItem);
        }

      } catch (error) {
        console.error('Error validating cart item:', error);
        invalidItems.push({
          item: storedItem,
          reason: 'Validation error occurred'
        });
      }
    }

    return { validItems, invalidItems, updatedItems };
  }

  /**
   * Merge guest cart into user cart when user logs in
   */
  async mergeGuestCartToUser(userId: string): Promise<CartValidationResult> {
    const guestItems = this.loadRawCart(); // Guest cart
    const userItems = this.loadRawCart(userId); // User cart

    if (guestItems.length === 0) {
      // No guest items to merge, just validate user cart
      return this.loadCart(userId);
    }

    // Combine items, giving priority to user cart for duplicates
    const combinedItems: StoredCartItem[] = [...userItems];
    
    for (const guestItem of guestItems) {
      const existingIndex = combinedItems.findIndex(
        item => 
          item.productId === guestItem.productId &&
          item.purchaseType === guestItem.purchaseType &&
          item.setId === guestItem.setId
      );

      if (existingIndex >= 0) {
        // Merge quantities for same items
        combinedItems[existingIndex].quantity += guestItem.quantity;
      } else {
        // Add new item from guest cart
        combinedItems.push({
          ...guestItem,
          id: `merged-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
      }
    }

    // Validate combined cart
    const validationResult = await this.validateCartItems(combinedItems);
    
    // Save merged cart to user context
    const allValidItems = [...validationResult.validItems, ...validationResult.updatedItems.map(u => u.item)];
    this.saveCart(allValidItems, userId);
    
    // Clear guest cart
    this.clearCart();

    return validationResult;
  }

  /**
   * Switch cart context (for login/logout)
   */
  async switchCartContext(fromUserId?: string, toUserId?: string): Promise<CartValidationResult> {
    if (fromUserId && toUserId) {
      // User switching (rare case)
      return this.loadCart(toUserId);
    }
    
    if (!fromUserId && toUserId) {
      // Guest -> User login
      return this.mergeGuestCartToUser(toUserId);
    }
    
    if (fromUserId && !toUserId) {
      // User -> Guest logout
      return this.loadCart(); // Load guest cart
    }
    
    // No change
    return this.loadCart(toUserId);
  }

  /**
   * Clear cart for specific user context
   */
  clearCart(userId?: string): void {
    const key = this.getStorageKey(userId);
    localStorage.removeItem(key);
  }

  /**
   * Clear oldest carts to free up storage space
   */
  private clearOldestCarts(): void {
    const allKeys = this.getAllCartKeys();
    const cartData = allKeys.map(key => {
      try {
        const data = localStorage.getItem(key);
        const items: StoredCartItem[] = data ? JSON.parse(data) : [];
        const oldestDate = items.reduce((oldest, item) => {
          const itemDate = new Date(item.addedAt);
          return itemDate < oldest ? itemDate : oldest;
        }, new Date());
        return { key, oldestDate };
      } catch {
        return { key, oldestDate: new Date(0) };
      }
    });

    // Sort by oldest date and remove oldest 2 carts
    cartData.sort((a, b) => a.oldestDate.getTime() - b.oldestDate.getTime());
    cartData.slice(0, 2).forEach(cart => {
      localStorage.removeItem(cart.key);
    });
  }

  /**
   * Get cart summary for all users (for debugging)
   */
  getAllCartSummaries(): Array<{
    key: string;
    userId: string | null;
    itemCount: number;
    lastActivity: string;
  }> {
    return this.getAllCartKeys().map(key => {
      const userId = key.includes(':user:') 
        ? key.split(':user:')[1] 
        : key.includes(':guest') 
          ? null 
          : 'unknown';
      
      try {
        const data = localStorage.getItem(key);
        const items: StoredCartItem[] = data ? JSON.parse(data) : [];
        const lastActivity = items.reduce((latest, item) => {
          const itemDate = new Date(item.addedAt);
          return itemDate > latest ? itemDate : latest;
        }, new Date(0));

        return {
          key,
          userId,
          itemCount: items.length,
          lastActivity: lastActivity.toISOString()
        };
      } catch {
        return {
          key,
          userId,
          itemCount: 0,
          lastActivity: new Date(0).toISOString()
        };
      }
    });
  }
}

export const cartStorage = new CartStorageService();
