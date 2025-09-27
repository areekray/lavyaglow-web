import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/features/ProductCard';
import { productService } from '@/services/productService';
import type { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { HeroCarousel } from '@/components/features/HeroCarousel';

export function Home() {
  const [curatedProducts, setCuratedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCuratedCollection();
  }, []);

  const loadCuratedCollection = async () => {
    try {
      const products = await productService.getHighlightedProducts();
      setCuratedProducts(products);
    } catch (error) {
      console.error('Failed to load curated collection:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <section className="hero-luxury">
        <HeroCarousel />
        
        <div className="hero-luxury__container">
          <div className="hero-luxury__content">
            <div className="hero-luxury__badge">
              <span>✨ Made in India • 100% Handmade • Made with Love</span>
            </div>
            
            <h1 className="hero-luxury__title">
              GIFTING REIMAGINED<br />
              <span className="title-accent">THE LAVYAGLOW WAY</span>
            </h1>
            
            <div className="hero-luxury__subtitle">
              Handcrafted Luxury Scented Candles for Timeless Gifting
            </div>
            
            <div className="hero-luxury__description">
              <p>
                Where tradition meets luxury. Each LavyaGlow candle is meticulously handcrafted with 
                100% soy wax, creating non-toxic, earth-friendly masterpieces that transform 
                moments into memories.
              </p>
            </div>

            <div className="hero-luxury__features">
              <div className="feature-pill">
                <span className="feature-icon">🌱</span>
                <span>100% Soy Wax</span>
              </div>
              <div className="feature-pill">
                <span className="feature-icon">🌿</span>
                <span>Non-toxic</span>
              </div>
              <div className="feature-pill">
                <span className="feature-icon">🌍</span>
                <span>Earth-friendly</span>
              </div>
            </div>
            
            <div className="hero-luxury__cta">
              <Link to="/products">
                <Button variant="luxury" size="lg" className="cta-primary">
                  <span>Discover Our Collection</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10H16M16 10L12 6M16 10L12 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </Link>
              
              <Link to="/about" className="cta-secondary">
                <span>Our Story</span>
              </Link>
            </div>
          </div>
        </div>

        {/* <div className="hero-luxury__scroll-indicator">
          <div className="scroll-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 13L12 18L17 13M7 6L12 11L17 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span>Scroll to explore</span>
        </div> */}
      </section>


      <section className="featured-luxury">
        <div className="featured-luxury__container">
          <div className="featured-luxury__header">
            <h2 className="featured-luxury__title">Our Curated Collection</h2>
            <div className="featured-luxury__subtitle">Premium Handcrafted Candles</div>
          </div>

          {loading ? (
            <div className="loading">
              <div className="loading__spinner"></div>
              <p>Curating our finest pieces...</p>
            </div>
          ) : (
            <div className="featured-luxury__grid">
              {curatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="featured-luxury__cta">
            <Link to="/products">
              <Button variant="luxury" size="lg">
                View All Creations
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="values-luxury">
        <div className="values-luxury__container">
          <div className="values-luxury__grid">
            <div className="values-luxury__item">
              <div className="values-luxury__icon">
                ✨
              </div>
              <h4>Premium Quality</h4>
              <p>Each candle is meticulously handcrafted using only the finest materials and premium fragrances.</p>
            </div>
            
            <div className="values-luxury__item">
              <div className="values-luxury__icon">
                🚚
              </div>
              <h4>Pan-India Delivery</h4>
              <p>Carefully packaged and delivered across India, dispatched within 3-4 days.</p>
            </div>
            
            <div className="values-luxury__item">
              <div className="values-luxury__icon">
                📦
              </div>
              <h4>Bulk Orders</h4>
              <p>Special pricing and bespoke packaging for events, hotels, and corporate clients.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
