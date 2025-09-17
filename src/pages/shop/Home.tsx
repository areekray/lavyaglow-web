import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/features/ProductCard';
import { productService } from '@/services/productService';
import type { Product } from '@/types';
import { Button } from '@/components/ui/Button';

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
        <div className="hero-luxury__background">
          <img 
            src="https://cdn.grateful.org/uploads/2023/09/22140603/LIGHT-A-CANDLE-cover.png" 
            alt="Luxury candles background"
            className="hero-luxury__bg-image"
          />
        </div>
        
        <div className="hero-luxury__container">
          <div className="hero-luxury__content">
            <h1 className="hero-luxury__title">
              WE INVITE YOU<br />
              TO SHARE OUR<br />
              LOVE FOR
            </h1>
            <div className="hero-luxury__subtitle">
              Handcrafted Excellence
            </div>
            
            <div className="hero-luxury__description">
              <p>
                LavyaGlow started as an inspiration to create premium handcrafted candles
                that transform spaces with sophisticated scents and sculptural beauty.
              </p>
            </div>
            
            <div style={{ marginTop: '3rem' }}>
              <Link to="/products">
                <Button variant="luxury" size="lg">
                  Explore Collection
                </Button>
              </Link>
            </div>
          </div>
        </div>
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
              <p>Carefully packaged and delivered across India, bringing luxury to your doorstep.</p>
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
