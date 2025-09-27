import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '@/types';
import { productService } from '@/services/productService';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { ImageWithPlaceholder } from '@/components/ui/ImageWithPlaceholder';

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, selectedCategory, searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products. Please try again later.');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.characteristics?.scent?.toLowerCase().includes(searchLower) ||
        product.characteristics?.colors?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredProducts(filtered);
  };

  const getStockStatus = (product: Product) => {
    if (!product.in_stock) {
      return {
        text: 'Out of Stock',
        className: 'stock-status--out-of-stock',
        available: false
      };
    }
    
    if (product.can_do_bulk) {
      return {
        text: 'Available for Bulk Orders',
        className: 'stock-status--bulk',
        available: true
      };
    }
    
    return {
      text: `${product.stock_quantity} units available`,
      className: 'stock-status--in-stock',
      available: true
    };
  };

  const getAvailableCategories = () => {
    return Array.from(new Set(products.map(product => product.category)))
      .filter(Boolean)
      .sort();
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const stockStatus = getStockStatus(product);
    const discountPercentage = productService.calculateDiscountPercentage(product.actual_price, product.discounted_price);

    return (
      <article
        className="product-card"
        onClick={() => navigate(`/products/${product.id}`)}
      >
        <div className="product-card__image-container">
          <ImageWithPlaceholder
            src={product.images[0] || "/default-candle.jpg"}
            alt={product.name}
            width="100%"
            placeholder="shimmer"
            priority={false}
            className="product-card__image"
            fallback="/default-candle-fallback.jpg"
          />

          {product.price_sets && product.price_sets.length > 0 && (
            <div className="product-card__featured-badge">
              ✨ Upto{" "}
              {(
                ((product.price_sets[product.price_sets.length - 1]
                  .actual_price -
                  product.price_sets[product.price_sets.length - 1]
                    .discounted_price) /
                  product.price_sets[product.price_sets.length - 1]
                    .actual_price) *
                100
              ).toFixed()}{" "}
              % off in sets
            </div>
          )}

          {!stockStatus.available && (
            <div
              className={`product-card__stock-badge ${stockStatus.className}`}
            >
              {"✗ Out of Stock"}
            </div>
          )}
        </div>

        <div className="product-card__content">
          <h3 className="product-card__title">{product.name}</h3>
          <p className="product-card__category">{product.category}</p>

          {/* Pricing Display */}
          <div className="product-card__pricing">
            {discountPercentage > 0 ? (
              <>
                <span className="product-card__price-actual">
                  ₹{product.actual_price?.toFixed(0)}
                </span>
                <span className="product-card__price-discounted">
                  ₹{product.discounted_price?.toFixed(0)}
                </span>
                <span className="product-card__discount-percentage">
                  ({discountPercentage}% off)
                </span>
              </>
            ) : (
              <span className="product-card__price-single">
                ₹{product.discounted_price?.toFixed(2)}
              </span>
            )}
          </div>

          {/* Set Pricing Preview */}
          {/* {product.price_sets && product.price_sets.length > 0 && stockStatus.available && (
            <div className="product-card__sets">
              <h4>Set Discounts Available:</h4>
              <div className="product-card__sets-list">
                {product.price_sets.slice(0, 2).map((priceSet) => {
                  const setDiscount = productService.calculateDiscountPercentage(priceSet.actual_price, priceSet.discounted_price);
                  return (
                    <div key={priceSet.id} className="product-card__set-item">
                      <span className="set-quantity">Set of {priceSet.set_quantity}:</span>
                      <div className="set-pricing">
                        <span className="set-price-actual">₹{priceSet.actual_price?.toFixed(2)}</span>
                        <span className="set-price-discounted">₹{priceSet.discounted_price?.toFixed(2)}</span>
                        {setDiscount > 0 && (
                          <span className="set-discount">({setDiscount}% off)</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {product.price_sets.length > 2 && (
                  <span className="product-card__more-sets">
                    +{product.price_sets.length - 2} more sets available
                  </span>
                )}
              </div>
            </div>
          )} */}

          {/* <div className={`product-card__stock ${stockStatus.className}`}>
            {stockStatus.text}
          </div> */}

          {/* Bulk Order Message */}
          {/* {product.can_do_bulk && stockStatus.available && (
            <div className="product-card__bulk-message">
              <h4>📦 Bulk Orders</h4>
              <p>For bulk orders, reach out via:</p>
              <div className="product-card__contact-options">
                <a href="https://wa.me/+919038644125" target="_blank" rel="noopener noreferrer" className="contact-link whatsapp">
                  📱 WhatsApp
                </a>
                <a href="https://instagram.com/lavyaglow" target="_blank" rel="noopener noreferrer" className="contact-link instagram">
                  📷 Instagram
                </a>
              </div>
            </div>
          )} */}

          {/* {product.description && (
            <p className="product-card__description">
              {product.description.length > 100 
                ? `${product.description.substring(0, 100)}...` 
                : product.description
              }
            </p>
          )} */}
          {/* {product.characteristics && Object.keys(product.characteristics).length > 0 && (*/}
          {/* <div className="product-card__characteristics"> 
              {product.characteristics?.colors && (
                <div className="product-card__colors">
                  <ColorChips colors={product.characteristics.colors} />
                </div>
              )}
            </div> */}
          {/* )} */}
          {/* {product.characteristics.scent && (
            <span className="characteristic-tag">🌸 {product.characteristics.scent}</span>
          )} */}

          {/* <div className="product-card__actions">
            <Button
              onClick={() => navigate(`/products/${product.id}`)}
              variant="primary"
              size="sm"
              fullWidth
            >
              View Details & Sets
            </Button>
            {stockStatus.available && !product.can_do_bulk && (
              <Button
                onClick={() => {
                  toast.success(`${product.name} added to cart!`);
                }}
                variant="secondary"
                size="sm"
                fullWidth
                style={{ marginTop: '0.5rem' }}
              >
                Add to Cart
              </Button>
            )}
          </div> */}
        </div>
      </article>
    );
  };

  return (
    <div className="products-page">
      <div className="container">
        <header className="products-page__header">
          <h1 className="products-page__title">Our Luxury Candle Collection</h1>
          <p className="products-page__subtitle">
            Handcrafted premium candles with special set discounts
          </p>
        </header>

        {/* Filters */}
        <div className="products-page__filters">
          <div className="filter-group">
            <label htmlFor="category-filter" className="filter-group__label">
              Category:
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-group__select"
            >
              <option value="">All Categories</option>
              {getAvailableCategories().map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="search-filter" className="filter-group__label">
              Search:
            </label>
            <input
              id="search-filter"
              type="text"
              placeholder="Search by name, category, or scent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-group__input"
            />
          </div>

          <div className="products-page__results-info">
            {!loading && (
              <span>
                {filteredProducts.length} of {products.length} products
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <section className="products-page__content">
          {loading ? (
            <div className="products-page__loading">
              <div className="loading__spinner"></div>
              <p>Loading our beautiful candles...</p>
            </div>
          ) : error ? (
            <div className="products-page__error">
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
              <Button onClick={loadProducts} variant="primary">
                Try Again
              </Button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="products-page__empty">
              <h3>No products found</h3>
              <p>
                {searchTerm || selectedCategory
                  ? "Try adjusting your filters to find what you're looking for."
                  : "We're currently updating our collection. Please check back soon!"
                }
              </p>
              {(searchTerm || selectedCategory) && (
                <div className="products-page__empty-actions">
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('');
                    }}
                    variant="secondary"
                  >
                    Clear Filters
                  </Button>
                  <Link to="/">
                    <Button variant="primary" size="lg">
                        Browse Home
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
