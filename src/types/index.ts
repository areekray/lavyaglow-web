export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  isAdmin: boolean;
  isStaff: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  actual_price: number;
  discounted_price: number;
  price: number; // Keep for backward compatibility, maps to discounted_price
  category: string;
  stock_quantity: number;
  in_stock: boolean;
  can_do_bulk: boolean;
  images: string[];
  characteristics: {
    scent?: string;
    burn_time?: string;
    colors: string;
    dimensions?: string;
  };
  instagram_media_id?: string;
  created_at: string;
  updated_at: string;
  highlight_in_home: boolean;
  price_sets?: ProductPriceSet[];
}

export interface ProductPriceSet {
  id: string;
  product_id: string;
  set_quantity: number;
  actual_price: number;
  discounted_price: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  actual_price: number;
  discounted_price: number;
  stock_quantity: number;
  in_stock: boolean;
  can_do_bulk: boolean;
  scent: string;
  burn_time: string;
  colors: string;
  dimensions: string;
  instagram_media_id: string;
  highlight_in_home: boolean;
  price_sets: ProductPriceSet[];
}


export interface PriceSetFormData {
  set_quantity: number;
  actual_price: number;
  discounted_price: number;
}


export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: Address;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  tracking_number?: string;
  courier_partner?: string;
  tracking_url?: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Address {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<{
      data: any;
      error: null;
  } | {
      data: null;
      error: any;
  }>;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isStaff: boolean;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

// types/index.ts - Add these fields to your existing Order interface

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: Address;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // ADD THESE NEW FIELDS FOR ADMIN (to match database schema):
  user_email?: string;
  user_phone?: string;
  delivery_name?: string;
  delivery_address?: string; 
  delivery_city?: string;
  delivery_state?: string;
  delivery_phone?: string;
  subtotal?: number;
  total_savings?: number;
  shipping_cost?: number;
  special_request?: string;
  gift_message?: string;
  order_status?: string; // alias for status
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  confirmed_at?: string;
  paid_at?: string;
}

// ADD this new interface for database order items
export interface DatabaseOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  product_image_url?: string;
  purchase_type: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  savings: number;
  selected_color?: string;
  selected_scent?: string;
  set_size?: number;
}
