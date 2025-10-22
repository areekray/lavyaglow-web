import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '@/types';
import { supabase } from '@/services/supabase';
import { Button } from '../ui/Button';

export const ExploreProducts = () => {
  const [categories, setCategories] = useState<string[]>(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategoriesAndProducts();
  }, []);

  useEffect(() => {
    checkScrollPosition();
  }, [products, activeCategory]);

  const fetchCategoriesAndProducts = async () => {
    setLoading(true);
    
    // Fetch all products
    const { data: allProducts, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
      return;
    }

    // Extract unique categories
    const uniqueCategories = ['All', ...new Set(allProducts?.map((p: Product) => p.category).filter(Boolean))];
    setCategories(uniqueCategories as string[]);
    setProducts(allProducts || []);
    setLoading(false);
  };

  const checkScrollPosition = () => {
    const container = scrollRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = 400;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  return (
    <section className="explore-products" id="explore-products">
      <div className="container">
        {/* Header matching curated products style */}
        
          <div className="featured-luxury__header">
            <h2 className="featured-luxury__title">Our Products</h2>
            <div className="featured-luxury__subtitle">Delight someone special — or treat yourself to pure luxury.</div>
          </div>

        {/* Category Tabs */}
        <div className="explore-products__tabs">
          <div className="tabs-scroll">
            {categories.map((category) => (
              <button
                key={category}
                className={`tab-button ${activeCategory === category ? 'tab-button--active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards with Scroll Controls */}
        {loading ? (
          <div className="explore-products__loading">Loading products...</div>
        ) : (
          <div className="explore-products__carousel">
            {/* Left Arrow */}
            {canScrollLeft && (
              <button 
                className="scroll-arrow scroll-arrow--left"
                onClick={() => scroll('left')}
                aria-label="Scroll left"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}

            {/* Scrollable Container with Fade Gradients */}
            <div 
              ref={scrollRef}
              className={`explore-products__scroll ${canScrollLeft ? 'fade-left' : ''} ${canScrollRight ? 'fade-right' : ''}`}
              onScroll={checkScrollPosition}
            >
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="explore-card"
                  style={product.in_stock ? {} : { opacity: 0.5 }}
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="explore-card__image">
                    <img 
                      src={product.images?.[0] || '/placeholder.jpg'} 
                      alt={product.name}
                      loading="lazy"
                    />
                  </div>
                  <div className="explore-card__name">{product.name}</div>
                  <p className="explore-card__name">
                    <span className="product-info__price-actual">
                        ₹{product.actual_price.toFixed(0)}
                      </span>
                      <span className="product-info__price-discounted">
                        ₹{product.discounted_price.toFixed(0)}
                      </span>
                  </p>
                </div>
              ))}
              
            </div>
            {/* Right Arrow */}
            {canScrollRight && (
              <button 
                className="scroll-arrow scroll-arrow--right"
                onClick={() => scroll('right')}
                aria-label="Scroll right"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
      
        <small className="text-muted explore-products-shipping-cost">🚚 No additional shipping cost on any purchase</small>
          <div className="featured-luxury__cta">
            
            <Link to="/products">
              <Button variant="luxury" size="lg">
                View All Products
              </Button>
            </Link>
          </div>
    </section>
  );
};
