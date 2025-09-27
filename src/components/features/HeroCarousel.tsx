import { useState, useEffect, useCallback } from 'react';

const HERO_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1602874801006-38c18640ad5d?q=80&w=2070",
    alt: "Luxury handcrafted candles collection",
    focus: "center center"
  },
  {
    url: "https://images.unsplash.com/photo-1551988818-9a89d26e8c39?q=80&w=2070", 
    alt: "Artisanal soy wax candles",
    focus: "center bottom"
  },
  {
    url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=2070",
    alt: "Elegant candle gifting collection",
    focus: "center top"
  },
  {
    url: "https://images.unsplash.com/photo-1511405946928-c9dd369a1c4b?q=80&w=2070",
    alt: "Premium scented candles for home decor",
    focus: "center center"
  },
  {
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070",
    alt: "LavyaGlow candle ambiance",
    focus: "center bottom"
  }
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState<boolean[]>(new Array(HERO_IMAGES.length).fill(false));

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000); // Change slide every 6 seconds
    return () => clearInterval(interval);
  }, [nextSlide]);

  // Preload images
  useEffect(() => {
    HERO_IMAGES.forEach((image, index) => {
      const img = new Image();
      img.onload = () => {
        setIsLoaded(prev => {
          const newLoaded = [...prev];
          newLoaded[index] = true;
          return newLoaded;
        });
      };
      img.src = image.url;
    });
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="hero-carousel">
      <div className="hero-carousel__background">
        {HERO_IMAGES.map((image, index) => (
          <div
            key={index}
            className={`hero-carousel__slide ${
              index === currentIndex ? 'active' : ''
            } ${isLoaded[index] ? 'loaded' : ''}`}
            style={{
              backgroundImage: `url(${image.url})`,
              backgroundPosition: image.focus
            }}
          >
            <div className="hero-carousel__overlay" />
          </div>
        ))}
      </div>

      {/* Carousel Indicators */}
      <div className="hero-carousel__indicators">
        {HERO_IMAGES.map((_, index) => (
          <button
            key={index}
            className={`hero-carousel__indicator ${
              index === currentIndex ? 'active' : ''
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          >
            <div className="indicator-progress" />
          </button>
        ))}
      </div>

      {/* Navigation Arrows */}
      {/* <button 
        className="hero-carousel__arrow hero-carousel__arrow--prev"
        onClick={() => setCurrentIndex((currentIndex - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)}
        aria-label="Previous slide"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <button 
        className="hero-carousel__arrow hero-carousel__arrow--next"
        onClick={() => setCurrentIndex((currentIndex + 1) % HERO_IMAGES.length)}
        aria-label="Next slide"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button> */}
    </div>
  );
}
