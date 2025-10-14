import type { CartItem } from "@/contexts/CartContext";
import type { Product } from "@/types";

// Google Analytics 4 Helper Functions
export const analytics = {
  // Track page views (automatic with GA4)
  
  // Track product views
  viewProduct: (product: Product) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'view_item', {
        currency: 'INR',
        value: product.discounted_price || product.actual_price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.discounted_price || product.actual_price,
          item_category: product.category || product.name
        }]
      });
    }
  },
  
  // Track add to cart
  addToCart: (cartItem: CartItem) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'add_to_cart', {
        currency: 'INR',
        value: cartItem.product.discounted_price * cartItem.quantity,
        items: [{
          item_id: cartItem.product.id,
          item_name: cartItem.product.name,
          price: cartItem.product.discounted_price || cartItem.product.actual_price,
          quantity: cartItem.quantity,
          purchaseType: cartItem.purchaseType || 'piece',
          selectedColor: cartItem.selectedColor || 'default',
        }]
      });
    }
  },
  
  // Track checkout start
  beginCheckout: (cartTotal: number, items: CartItem[]) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'begin_checkout', {
        currency: 'INR',
        value: cartTotal,
        items: items.map(item => ({
          item_id: item.product.id,
          item_name: item.product.name,
          price: item.product.discounted_price || item.product.actual_price,
          quantity: item.quantity,
          selectedColor: item.selectedColor || 'default',
          purchaseType: item.purchaseType || 'piece',
        }))
      });
    }
  },
  
  // Track purchase
  trackPurchase: (order: {
    orderId: string;
    totalAmount: number;
    items: any[];
  }) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'purchase', {
        transaction_id: order.orderId,
        currency: 'INR',
        value: order.totalAmount,
        items: order.items.map(item => ({
          item_id: item.product_sku,
          item_name: item.product_name,
          price: item.unit_price,
          quantity: item.quantity
        }))
      });
    }
  },
  
  // Track search
  search: (searchTerm: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'search', {
        search_term: searchTerm
      });
    }
  }
};
