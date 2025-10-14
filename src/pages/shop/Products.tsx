import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { productService } from '@/services/productService';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { CategoryChip } from '@/components/ui/CategoryChip';
import { CategoryFilterDrawer } from '@/components/ui/CategoryFilterDrawer';
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { ProductCard } from '@/components/ui/ProductCard';
import { useSEO } from '@/hooks/useSEO';

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);
  useSEO({
    title: 'Shop Handcrafted Candles Online - LavyaGlow',
    description: 'Browse our collection of premium handcrafted scented candles. 20+ unique fragrances, 100% soy wax, made in Bangalore. Free shipping available.',
    keywords: 'shop candles, buy candles online, scented candles collection, handmade candles',
    url: 'https://lavyaglow.com/products',
    canonical: 'https://lavyaglow.com/products'
  });
  useEffect(() => {
    loadProducts();
    document.title = 'All Products - LavyaGlow';
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

  const getAvailableCategories = () => {
    return Array.from(new Set(products.map(product => product.category)))
      .filter(Boolean)
      .sort();
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
        {!loading && <div className="products-page__filters">
          <div className="filter-group">
            <MagnifyingGlassIcon className="filter-group__icon w-5 h-5" />
            <input
              id="search-filter"
              type="text"
              placeholder="Search by name, category or characteristics."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-group__input"
            />
          </div>

          <div className="filter-group">
            <button
              className="filter-button"
              onClick={() => setIsFilterDrawerOpen(true)}
              aria-label="Open category filter"
            >
              <AdjustmentsHorizontalIcon className="filter-button__icon w-5 h-5" />
              {/* <span className="filter-button__text">
                {selectedCategory || 'All Categories'}
              </span>
              <ChevronDownIcon className="filter-button__arrow w-4 h-4" /> */}
            </button>
          </div>

          <div className="products-page__results-info">
            {!loading && (
              <span>
                {filteredProducts.length} of {products.length} products
              </span>
            )}
          </div>
        </div>}
        
        {selectedCategory && (
          <div className="products-page__active-filters">
            <CategoryChip
              category={selectedCategory}
              onRemove={() => setSelectedCategory('')}
            />
          </div>
        )}

        {/* Content */}
        <section className="products-page__content">
          {loading ? (
            <div className="products-page__loading">
              <div className="loading__spinner"></div>
              <p style={{textAlign: 'center'}}>Loading our beautiful candles...</p>
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
        <CategoryFilterDrawer
          categories={getAvailableCategories()}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
        />
      </div>
    </div>
  );
}
