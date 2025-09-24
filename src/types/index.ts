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
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
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
