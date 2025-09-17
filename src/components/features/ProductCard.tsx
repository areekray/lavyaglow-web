import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product as any);
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`}>
        <div className="product-card__image">
          <img
            src={product.images[0] || ''}
            alt={product.name}
            loading="lazy"
          />
        </div>
      </Link>
      <div className="product-card__content">
        <Link to={`/products/${product.id}`}>
          <h3 className="product-card__title">{product.name}</h3>
          <div className="product-card__category">{product.category}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="product-card__price">₹{product.price}</div>
            <span className={`product-card__stock ${
              product.stock_quantity > 0 
                ? 'product-card__stock--in-stock' 
                : 'product-card__stock--out-of-stock'
            }`}>
              {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </Link>
        <button
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0}
          className="btn-cart"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
