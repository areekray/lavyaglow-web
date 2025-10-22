import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "@/components/features/ProductCard";
import { productService } from "@/services/productService";
import type { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { HeroCarousel } from "@/components/features/HeroCarousel";
import { useSEO } from "@/hooks/useSEO";
import { ExploreProducts } from "@/components/shop/ExploreProducts";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { OurStory } from "@/components/shop/OurStory";

export function Home() {
  const [curatedProducts, setCuratedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title =
      "LavyaGlow - Premium Handcrafted Scented Candles | Pan India Delivery";
    loadCuratedCollection();
  }, []);

  useSEO({
    title: "LavyaGlow - Premium Handcrafted Scented Candles | Buy Online",
    description:
      "Shop premium handcrafted scented candles in India. 100% soy wax, 20+ fragrances. Made in Bangalore. Free shipping on orders above ₹999. Order now!",
    keywords:
      "buy candles online, scented candles India, handcrafted candles Bangalore, soy wax candles",
    url: "https://lavyaglow.com/",
    canonical: "https://lavyaglow.com/",
  });

  const loadCuratedCollection = async () => {
    try {
      const products = await productService.getHighlightedProducts();
      setCuratedProducts(products);
    } catch (error) {
      console.error("Failed to load curated collection:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="home">
      <section className="hero-luxury">
        <HeroCarousel />

        <div className="hero-luxury__container">
          <div className="hero-luxury__content">
            <div className="hero-luxury__badge">
              <span>✨ Made in India • 100% Handmade • Made with Love</span>
            </div>

            <h1 className="hero-luxury__title">
              GIFTING REIMAGINED
              <br />
              <span className="title-accent">THE LAVYAGLOW WAY</span>
            </h1>

            <div className="hero-luxury__subtitle">
              Handcrafted Luxury Scented Candles for Timeless Gifting
            </div>

            <div className="hero-luxury__description">
              <p>
                Where tradition meets luxury. Each LavyaGlow candle is
                meticulously handcrafted with 100% soy wax, creating non-toxic,
                earth-friendly masterpieces that transform moments into
                memories.
              </p>
            </div>

            <div className="hero-luxury__cta">
              <Button
                variant="luxury"
                size="lg"
                className="cta-primary"
                onClick={() => {
                  const exploreSection =
                    document.getElementById("explore-products");
                  if (exploreSection) {
                    exploreSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                <span>Discover Our Products</span>
                <ArrowDownIcon style={{ width: "20px", height: "20px" }} />
              </Button>
            </div>
            <div className="hero-luxury__features">
              <div className="features-marquee">
                <div className="features-track">
                  {/* Set 1 */}
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
                  <div className="feature-pill">
                    <span className="feature-icon">✨</span>
                    <span>Premium Scented</span>
                  </div>

                  {/* Set 2 (duplicate) */}
                  <div className="feature-pill" aria-hidden="true">
                    <span className="feature-icon">🌱</span>
                    <span>100% Soy Wax</span>
                  </div>
                  <div className="feature-pill" aria-hidden="true">
                    <span className="feature-icon">🌿</span>
                    <span>Non-toxic</span>
                  </div>
                  <div className="feature-pill" aria-hidden="true">
                    <span className="feature-icon">🌍</span>
                    <span>Earth-friendly</span>
                  </div>
                  <div className="feature-pill" aria-hidden="true">
                    <span className="feature-icon">✨</span>
                    <span>Premium Scented</span>
                  </div>

                  {/* Set 3 (duplicate) */}
                  <div className="feature-pill" aria-hidden="true">
                    <span className="feature-icon">🌱</span>
                    <span>100% Soy Wax</span>
                  </div>
                  <div className="feature-pill" aria-hidden="true">
                    <span className="feature-icon">🌿</span>
                    <span>Non-toxic</span>
                  </div>
                  <div className="feature-pill" aria-hidden="true">
                    <span className="feature-icon">🌍</span>
                    <span>Earth-friendly</span>
                  </div>
                  <div className="feature-pill" aria-hidden="true">
                    <span className="feature-icon">✨</span>
                    <span>Premium Scented</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="hero-luxury__scroll-indicator">
          <div className="scroll-to-explore-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 13L12 18L17 13M7 6L12 11L17 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span>Scroll to explore</span>
        </div> */}
      </section>

      <ExploreProducts />
      <OurStory />
      {/* <section className="featured-luxury">
        <div className="featured-luxury__container">
          <div className="featured-luxury__header">
            <h2 className="featured-luxury__title">Our Curated Collection</h2>
            <div className="featured-luxury__subtitle">
              Premium Handcrafted Candles
            </div>
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
      </section> */}
      <section className="partners-luxury" aria-label="Our trusted partners">
        <div className="partners-luxury__container">
          <div className="featured-luxury__header">
            <h3 className="featured-luxury__title">Our trusted partners</h3>
            <p className="featured-luxury__subtitle">
              Shipping and payments you can rely on
            </p>
          </div>

          {/* Marquee viewport */}
          <div className="partners-luxury__marquee">
            {/* Track repeated twice for seamless loop */}
            <div className="partners-luxury__track">
              {/* Row 1 */}
              <div className="partners-luxury__item" title="DTDC"></div>
              <div
                className="partners-luxury__item partners--bluedart"
                title="Blue Dart"
              ></div>
              <div
                className="partners-luxury__item partners--porter"
                title="Porter"
              ></div>
              <div
                className="partners-luxury__item partners--delhivery"
                title="Delhivery"
              ></div>
              <div
                className="partners-luxury__item partners--razorpay"
                title="Razorpay"
              ></div>

              {/* Repeat for infinite scroll */}
              <div className="partners-luxury__item" title="DTDC"></div>
              <div
                className="partners-luxury__item partners--bluedart"
                title="Blue Dart"
              ></div>
              <div
                className="partners-luxury__item partners--porter"
                title="Porter"
              ></div>
              <div
                className="partners-luxury__item partners--delhivery"
                title="Delhivery"
              ></div>
              <div
                className="partners-luxury__item partners--razorpay"
                title="Razorpay"
              ></div>
            </div>
          </div>
        </div>
      </section>
      <section className="values-luxury">
        <div className="values-luxury__container">
          <div className="values-luxury__grid">
            <div className="values-luxury__item">
              <div className="values-luxury__icon">✨</div>
              <h4>Premium Quality</h4>
              <p>
                Each candle is meticulously handcrafted using 100% soy wax, non-toxic colors and premium fragrances.
              </p>
            </div>

            <div className="values-luxury__item">
              <div className="values-luxury__icon">🚚</div>
              <h4>Pan-India Delivery</h4>
              <p>
                Carefully packaged and delivered across India, dispatched within
                1-2 days.
              </p>
            </div>

            <div className="values-luxury__item">
              <div className="values-luxury__icon">📦</div>
              <h4>Bulk Orders</h4>
              <p>
                Special pricing and bespoke packaging for events, hotels, and
                corporate clients.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
