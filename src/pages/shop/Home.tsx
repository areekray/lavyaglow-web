import { useEffect, useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { ExploreProducts } from "@/components/shop/ExploreProducts";
import { OurStory } from "@/components/shop/OurStory";
import { CategoryHeroCarousel } from "@/components/features/CategoryHeroCarousel";
import { supabase } from "@/services/supabase";
import type { CategorySlide, Product } from "@/types";
import { generateCategoryDescription } from "@/services/groqAI";

export function Home() {
  // const [curatedProducts, setCuratedProducts] = useState<Product[]>([]);
  // const [loading, setLoading] = useState(true);

  const [categoryBasedProducts, setCategoryBasedProducts] = useState<CategorySlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title =
      "LavyaGlow - Premium Handcrafted Scented Candles | Pan India Delivery";
    // loadCuratedCollection();
    fetchCategorySlides();
  }, []);

  const fetchCategorySlides = async () => {
      setLoading(true);
  
      const { data: allProducts, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_deleted', false)
        .eq('in_stock', true)
        .order('created_at', { ascending: false });
  
      if (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
        return;
      }
  
      // Group by category and create slides
      const grouped = (allProducts || []).reduce((acc, product) => {
        const category = product.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(product);
        return acc;
      }, {} as Record<string, Product[]>);
  
      const categorySlides: CategorySlide[] = Object.entries(grouped).map(
        ([category, products]) => {
          const typedProducts = products as Product[];
          return {
            category,
            products: typedProducts.slice(0, 6), // Max 6 products per slide for overlay
            productCount: typedProducts.length,
            description: `Explore our handcrafted ${category.toLowerCase()} collection — ${typedProducts.length > 1 ? `${typedProducts.length} unique designs` : 'a unique design'} crafted with care and intention`
          };
        }
      )?.sort((a, b) => b.productCount - a.productCount) || [];
  
      setCategoryBasedProducts(
        categorySlides
      );
  
      updateAllDescriptions(categorySlides)
      setLoading(false);
    };
  
    const updateAllDescriptions = async (categorySlides?: CategorySlide[]) => {
      if (!categorySlides) return;
  
      const updatedSlides = await Promise.all(
        categorySlides.map((slide) => generateCategoryDescription(
          slide.category,
          slide.productCount
        ).then(description => {
          slide.description = description;
          return slide;
        }))
      );
  
      setCategoryBasedProducts(updatedSlides);
    };

  useSEO({
    title: "LavyaGlow - Premium Handcrafted Scented Candles | Buy Online",
    description:
      "Shop premium handcrafted scented candles in India. 100% soy wax, 20+ fragrances. Made in Bangalore. Free shipping on orders above ₹999. Order now!",
    keywords:
      "buy candles online, scented candles India, handcrafted candles Bangalore, soy wax candles",
    url: "https://lavyaglow.com/",
    canonical: "https://lavyaglow.com/",
  });

  // const loadCuratedCollection = async () => {
  //   try {
  //     const products = await productService.getHighlightedProducts();
  //     setCuratedProducts(products);
  //   } catch (error) {
  //     console.error("Failed to load curated collection:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <main className="home">
      {/* <section className="hero-luxury"> */}
      <CategoryHeroCarousel slides={categoryBasedProducts} loading={loading} />
      {categoryBasedProducts?.map((categoryBasedProduct, index) => (
        <ExploreProducts 
          key={categoryBasedProduct.category} 
          categoryBasedProduct={categoryBasedProduct}
          nextCategory={categoryBasedProducts[index + 1]?.category || ''} />
      ))}
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
              <p className="featured-luxury__subtitle">Curating our finest pieces...</p>
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
              <div className="values-luxury__icon" style={{
                backgroundImage: 'url(https://fajpirmuqtbewsebwkhv.supabase.co/storage/v1/object/public/carousel-images/soywax.PNG)',
              }}></div>
              <h4 className="featured-luxury__title">Premium Quality</h4>
              <p className="featured-luxury__subtitle">
                Each candle is meticulously handcrafted using 100% soy wax, non-toxic colors and premium fragrances.
              </p>
            </div>

            <div className="values-luxury__item">
              <div className="values-luxury__icon" style={{
                backgroundImage: 'url(https://fajpirmuqtbewsebwkhv.supabase.co/storage/v1/object/public/carousel-images/panindia.PNG)',
              }}></div>
              <h4 className="featured-luxury__title">Pan-India Delivery</h4>
              <p className="featured-luxury__subtitle">
                Carefully packaged and delivered across India, dispatched within
                1-2 days with trusted and reliable courier partners.
              </p>
            </div>

            <div className="values-luxury__item">
              <div className="values-luxury__icon" style={{
                backgroundImage: 'url(https://fajpirmuqtbewsebwkhv.supabase.co/storage/v1/object/public/carousel-images/bulkorder.PNG)',
              }}></div>
              <h4 className="featured-luxury__title">Bulk Orders</h4>
              <p className="featured-luxury__subtitle">
                Special pricing and bespoke packaging for events, hotels, and
                corporate clients. Contact via WhatsApp or Instagram.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
