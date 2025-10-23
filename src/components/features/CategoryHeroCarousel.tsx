import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CategorySlide } from '@/types';
import { Button } from '../ui/Button';
import { ArrowDownIcon } from '@heroicons/react/24/outline';

export const CategoryHeroCarousel = ({ slides, loading } : { slides: CategorySlide[], loading: boolean }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const navigate = useNavigate();

  // Auto-rotation (8 seconds per slide)
  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false); // Pause on manual interaction
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const handleExploreCategory = (category: string) => {
    const element = document.getElementById(`${category.toLowerCase()}-explore-products`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
    }
    // navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  if (loading) {
    return (
      <div className="category-hero-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="category-hero">
      {/* Static Brand Header */}
      <div className="category-hero__header">
        <h1 className="hero-luxury__title">
              GIFTING REIMAGINED
              <br />
              <span className="title-accent">THE LAVYAGLOW WAY</span>
        </h1>
        <div className="hero-luxury__subtitle">
          Handcrafted Luxury Scented Candles with 100% soy wax and non-toxic colors
        </div>
      </div>

      {/* Dynamic Category Carousel */}
      <div 
        className="category-hero__carousel"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.category}
            className={`carousel-slide ${
              index === currentSlide ? 'carousel-slide--active' : ''
            } ${index < currentSlide ? 'carousel-slide--prev' : ''} ${
              index > currentSlide ? 'carousel-slide--next' : ''
            }`}
          >
            {/* Background gradient based on category */}
            <div className="carousel-slide__background" />

            {/* Category Content */}
            <div className="carousel-slide__content">
              <div className="container">
                <div className="carousel-slide__grid">
                  {/* Left: Text Content */}
                  <div className="carousel-slide__text">
                    <h3 className="carousel-slide__category-label">
                      Our Collection of
                    </h3>
                    <h2 className="carousel-slide__category-name">
                      {slide.category} Candles
                    </h2>
                    <p className="carousel-slide__description">
                      {slide.description}
                    </p>

                    <Button
                      variant="luxury"
                      size='lg'
                      className="cta-primary carousel-slide__cta"
                      onClick={() => handleExploreCategory(slide.category)}
                    >
                      <span>Explore {slide.category} Candles</span>
                      <ArrowDownIcon style={{ width: '20px', height: '20px' }} />
                    </Button>
                  </div>

                  {/* Right: Product Image Overlay */}
                  <div className="carousel-slide__images">
                    <div className={`image-collage${slide.products.length < 3 ? ' image-collage--two' : slide.products.length === 3 ? ' image-collage--three' : ''}`}>
                      {slide.products.slice(0, 6).map((product, idx) => (
                        <div
                          key={product.id}
                          className={`image-collage__item image-collage__item--${idx + 1}`}
                          onClick={() => navigate(`/products/${product.id}`)}
                        >
                          <img
                            src={product.images?.[0] || '/placeholder.jpg'}
                            alt={product.name}
                            loading="lazy"
                          />
                          <div className="image-collage__overlay">
                            <span>{product.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                

        {/* Navigation Controls */}
        <button
          className="carousel-nav carousel-nav--prev"
          onClick={goToPrev}
          aria-label="Previous category"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          className="carousel-nav carousel-nav--next"
          onClick={goToNext}
          aria-label="Next category"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
              </div>
            </div>
          </div>
        ))}

        {/* Pagination Dots */}
        <div className="carousel-pagination">
          {slides.map((slide, index) => (
            <button
              key={slide.category}
              className={`pagination-dot ${
                index === currentSlide ? 'pagination-dot--active' : ''
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to ${slide.category}`}
            >
              <span className="pagination-dot__tooltip">{slide.category}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
