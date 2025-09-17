import { supabase } from './supabase';
import type { Product, ProductPriceSet } from '@/types';

export const productService = {
  // Helper function to calculate discount percentage
  calculateDiscountPercentage(actualPrice: number, discountedPrice: number): number {
    if (actualPrice <= 0) return 0;
    return Math.round(((actualPrice - discountedPrice) / actualPrice) * 100);
  },

  // Transform database product to app format
  transformProduct(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      description: dbProduct.description || '',
      actual_price: parseFloat(dbProduct.actual_price || 0),
      discounted_price: parseFloat(dbProduct.discounted_price || 0),
      price: parseFloat(dbProduct.discounted_price || dbProduct.price || 0), // Backward compatibility
      category: dbProduct.category,
      stock_quantity: dbProduct.stock_quantity,
      in_stock: dbProduct.in_stock,
      can_do_bulk: dbProduct.can_do_bulk,
      images: dbProduct.images || [],
      characteristics: dbProduct.characteristics || {},
      instagram_media_id: dbProduct.instagram_media_id || '',
      created_at: dbProduct.created_at,
      updated_at: dbProduct.updated_at,
      highlight_in_home: dbProduct.highlight_in_home,
      price_sets: dbProduct.price_sets || []
    };
  },

  // Get all products with price sets
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          price_sets:product_price_sets(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(this.transformProduct);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get highlighted products for home page
  async getHighlightedProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          price_sets:product_price_sets(*)
        `)
        .eq('highlight_in_home', true)
        .eq('in_stock', true)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      
      return data.map(this.transformProduct);
    } catch (error) {
      console.error('Error fetching highlighted products:', error);
      throw error;
    }
  },

  // Get product by ID with price sets
  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          price_sets:product_price_sets(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Product not found
        }
        throw error;
      }
      
      return this.transformProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  // Get products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          price_sets:product_price_sets(*)
        `)
        .eq('category', category)
        .eq('in_stock', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(this.transformProduct);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  // Create new product
  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'price_sets'>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          description: productData.description,
          actual_price: productData.actual_price,
          discounted_price: productData.discounted_price,
          category: productData.category,
          stock_quantity: productData.stock_quantity,
          in_stock: productData.in_stock,
          can_do_bulk: productData.can_do_bulk,
          images: productData.images,
          characteristics: productData.characteristics || {},
          instagram_media_id: productData.instagram_media_id,
          highlight_in_home: productData.highlight_in_home
        }])
        .select()
        .single();

      if (error) throw error;
      
      return this.transformProduct(data);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.actual_price !== undefined) updateData.actual_price = updates.actual_price;
      if (updates.discounted_price !== undefined) updateData.discounted_price = updates.discounted_price;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.stock_quantity !== undefined) updateData.stock_quantity = updates.stock_quantity;
      if (updates.in_stock !== undefined) updateData.in_stock = updates.in_stock;
      if (updates.can_do_bulk !== undefined) updateData.can_do_bulk = updates.can_do_bulk;
      if (updates.images !== undefined) updateData.images = updates.images;
      if (updates.characteristics !== undefined) updateData.characteristics = updates.characteristics;
      if (updates.instagram_media_id !== undefined) updateData.instagram_media_id = updates.instagram_media_id;
      if (updates.highlight_in_home !== undefined) updateData.highlight_in_home = updates.highlight_in_home;

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return this.transformProduct(data);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Get highlight count
  async getHighlightCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('highlight_in_home', true);

      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error('Error getting highlight count:', error);
      return 0;
    }
  },

  // === PRICE SETS MANAGEMENT ===

  // Get price sets for a product
  async getPriceSets(productId: string): Promise<ProductPriceSet[]> {
    try {
      const { data, error } = await supabase
        .from('product_price_sets')
        .select('*')
        .eq('product_id', productId)
        .order('set_quantity');

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching price sets:', error);
      return [];
    }
  },

  // Create price set
  async createPriceSet(productId: string, priceSetData: Omit<ProductPriceSet, 'id' | 'product_id' | 'created_at' | 'updated_at'>): Promise<ProductPriceSet> {
    try {
      const { data, error } = await supabase
        .from('product_price_sets')
        .insert([{
          product_id: productId,
          set_quantity: priceSetData.set_quantity,
          actual_price: priceSetData.actual_price,
          discounted_price: priceSetData.discounted_price
        }])
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating price set:', error);
      throw error;
    }
  },

  // Update price set
  async updatePriceSet(id: string, updates: Partial<ProductPriceSet>): Promise<ProductPriceSet> {
    try {
      const updateData: any = {};
      
      if (updates.set_quantity !== undefined) updateData.set_quantity = updates.set_quantity;
      if (updates.actual_price !== undefined) updateData.actual_price = updates.actual_price;
      if (updates.discounted_price !== undefined) updateData.discounted_price = updates.discounted_price;

      const { data, error } = await supabase
        .from('product_price_sets')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating price set:', error);
      throw error;
    }
  },

  // Delete price set
  async deletePriceSet(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('product_price_sets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting price set:', error);
      throw error;
    }
  }
};
