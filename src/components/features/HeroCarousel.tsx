import { useState, useEffect, useCallback } from 'react';

const HERO_IMAGES = [
  {
    url: "https://lh3.googleusercontent.com/rd-d/ALs6j_HTaAccOwSE-zAmPGCVbSKsh8qiReHGkiunNKT2A9ZL4AN015mf5Z6zFX0PSgelFW_oFbj1np8rMp7qGJvZoqLqR7Pl83YgY7n46slzBsvWDB3N3wuU9jmyLWIAQwfPU6POSUH7jsDPAb1dfGWqog_ZjXwNpVIrX5J7nffwnICxv-pt18eWGHRqyItnOOCih5C3xy881Dfda8zJsv-H_wEW6RE2CM6lQzSIVALx3nroANqJOeAnTJxLbuydgGUXKDYhQar-WhAVm7-DDg8ZJKZfxHKfq3DBV9y7ITWxSeTRAuFaI1I-vWen0T38oQ4mYGZPhf8UqcefDpflDUMsHDoFVe7y2WuqwzC4BaG0VZKJll33a2fYF8HcnvQWCRbEYdqzjLPLcV_fWSJ23y-aYuwTPFHQVDUUX-ZK4Nmenb6mIdwxr3VzPbQejr6U4cthev24n_Vh_drQj6u4qhtn1BsACkjWiJvu9X8P87rVTdRmtB7748EQCjBwevFdwm6ffQf2Wf0vbYZYUK9tntS4qkZ8jbOv4Hn-wwoT2HxcwWAC8MDzBK4PmfAeLAoi2eEFlHIPCG0GwYfPIbJ75tg1vRYXmC7RtEi265QyAfPsWvmTqo1KWzB1duT8GFL3JCWoVlZGapkBKtDG78U9-msXlUmIa5pKz6r-p_0ZoQfDhhpB-xft0QRV2NgG-f8YaKFnq4JxJFmJhF6UoPDZvWhInY5-QYNTSUdearxelN76Sy4qy9ge2DPXkJwYmhQJ7-IVZk1qERiLjJJoaAPwR-eWVA67qODVInz57HpfBBvKSG0D4zoG1n3gTk6vw_tEZQUiE6bwzW5iSr_gTXqzwZY_z7dL9TA6J79t_k9Jd4AGyh28jxK3cXMT95okKDeaR-iRm4gaoZ0kFgD-dVAsbgXhlpnBc5eEGDNUEgdIj10vm-cGG2zN_7pWBOLZVD4LONhVcWIk59musamtX1x4jdantZNSR6FGxRkoWUs220KyXdhaIKeP_54aq-79XobHwCDL2Tq4oJrV6AAWf73tTCrqcrQM2KD9wnO7qiDI-3t4z5F22goJBXGQlVUWmtxqufbTEeWNkyIu5dI40aP3AniSlism=w1196-h959?auditContext=prefetch",
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
