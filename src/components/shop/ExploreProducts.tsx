import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { CategorySlide } from '@/types';
import { Button } from '../ui/Button';
import { ArrowDownIcon } from '@heroicons/react/24/outline';

export const ExploreProducts = ({ categoryBasedProduct, nextCategory }: { categoryBasedProduct: CategorySlide, nextCategory: string }) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const products = categoryBasedProduct.products;

  useEffect(() => {
    checkScrollPosition();
  }, [products]);

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

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  return (
    <section className={`explore-products${!nextCategory ? ' last-section' : ''}`} id={`${categoryBasedProduct.category.toLowerCase()}-explore-products`}>
      <div className="container">
        {/* Header matching curated products style */}
        
          <div className="featured-luxury__header">
            <h2 className="featured-luxury__title">{categoryBasedProduct.category} Candles</h2>
            <div className="featured-luxury__subtitle">{categoryBasedProduct.description}</div>
          </div>

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
              {products.map((product) => (
                <div
                  key={product.id}
                  className="explore-card"
                  style={product.in_stock ? {} : { }}
                  onClick={() => handleProductClick(product.id)}
                >
                  {product.in_stock ? null : (
                    <div className={`product-card__stock-badge stock-status--out-of-stock`}>
                      {"⚠️ Sold Out"}
                    </div>
                  )}
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
      </div>
      
        <small className="text-muted explore-products-shipping-cost">🚚 No additional shipping cost on any purchase</small>
          <div className="featured-luxury__cta">
            {nextCategory ? (
              <Button variant="luxury" size="lg" onClick={() => {
                const element = document.getElementById(`${nextCategory.toLowerCase()}-explore-products`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}>
                {`Explore ${nextCategory} Candles`}
                <ArrowDownIcon style={{ width: '20px', height: '20px', marginLeft: '0.5rem' }} />
              </Button>
            ): (
              <Link to="/products">
                <Button variant="luxury" size="lg">
                  View All Products
                </Button>
              </Link>
            )}
          </div>
    </section>
  );
};
