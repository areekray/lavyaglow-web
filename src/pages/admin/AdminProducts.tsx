import React, { useState, useEffect } from 'react';
import type { Product } from '@/types';
import { productService } from '@/services/productService';
import { ProductForm } from './ProductForm';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      await productService.deleteProduct(product.id);
      toast.success(`Product "${product.name}" deleted successfully`);
      loadProducts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
      console.error('Error deleting product:', error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleFormSave = async (savedProduct: Product) => {
    setShowForm(false);
    setEditingProduct(null);
    loadProducts();
  };

  const getStockStatus = (product: Product) => {
    if (!product.in_stock) {
      return { text: 'Out of Stock', class: 'out-of-stock' };
    }
    
    if (product.can_do_bulk) {
      return { text: 'In Stock (Bulk Available)', class: 'bulk-available' };
    }
    
    return { text: `In Stock (${product.stock_quantity} units)`, class: 'in-stock' };
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const highlightedCount = products.filter(p => p.highlight_in_home).length;

  return (
    <div className="admin-products">
      {/* Header */}
      <div className="admin-products__header">
        <div className="admin-products__title-section">
          <h2 className="admin-products__title">Products Management</h2>
          <div className="admin-products__stats">
            <span className="admin-products__count">{products.length} total products</span>
            <span className="admin-products__highlight">
              {highlightedCount}/4 featured in Our Curated Collection
            </span>
          </div>
        </div>
        
        <div className="admin-products__actions">
          <div className="admin-products__search">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-products__search-input"
            />
          </div>
          <Button onClick={handleAddNew} variant="primary">
            + Add New Product
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="admin-products__loading">
          <div className="loading__spinner"></div>
          <p>Loading products...</p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && (
        <div className="admin-products__grid">
          {filteredProducts.length === 0 ? (
            <div className="admin-products__empty">
              <h3>No products found</h3>
              <p>
                {searchTerm 
                  ? `No products match "${searchTerm}"`
                  : 'Start by adding your first product'
                }
              </p>
              {!searchTerm && (
                <Button onClick={handleAddNew} variant="primary">
                  Add Your First Product
                </Button>
              )}
            </div>
          ) : (
            filteredProducts.map(product => {
              const stockStatus = getStockStatus(product);
              
              return (
                <div key={product.id} className="admin-product-card">
                  <div className="admin-product-card__image">
                    <img
                      src={product.images[0] || ''}
                      alt={product.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '';
                      }}
                    />
                    <div className="admin-product-card__badges">
                      <span className={`stock-badge stock-badge--${stockStatus.class}`}>
                        {stockStatus.text}
                      </span>
                      {product.highlight_in_home && (
                        <span className="highlight-badge">
                          ✨ Featured
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="admin-product-card__content">
                    <h3 className="admin-product-card__name">{product.name}</h3>
                    <p className="admin-product-card__category">{product.category}</p>
                    <p className="admin-product-card__description">
                      {product.description || 'No description available'}
                    </p>
                    
                    <div className="admin-product-card__details">
                      <div className="admin-product-card__price">₹{product.price}</div>
                      <div className="admin-product-card__bulk">
                        {product.can_do_bulk ? '📦 Bulk Available' : '📱 Unit Sales'}
                      </div>
                    </div>

                    {product.characteristics && Object.keys(product.characteristics).length > 0 && (
                      <div className="admin-product-card__characteristics">
                        {product.characteristics.scent && (
                          <span className="characteristic-tag">🌸 {product.characteristics.scent}</span>
                        )}
                        {product.characteristics.burn_time && (
                          <span className="characteristic-tag">⏰ {product.characteristics.burn_time}</span>
                        )}
                        {product.characteristics.weight && (
                          <span className="characteristic-tag">⚖️ {product.characteristics.weight}</span>
                        )}
                      </div>
                    )}

                    <div className="admin-product-card__actions">
                      <Button
                        onClick={() => handleEdit(product)}
                        variant="secondary"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="admin-product-card__delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}
    </div>
  );
}
