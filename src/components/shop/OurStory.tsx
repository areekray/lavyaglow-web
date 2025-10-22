import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

export const OurStory = () => {
  const navigate = useNavigate();

  return (
    <section className="our-story">
      <div className="container">
        <div className="featured-luxury__header">
            <h2 className="featured-luxury__title">Our Story</h2>
            <div className="featured-luxury__subtitle">Meet the heart behind every candle</div>
        </div>
        {/* <div className="our-story__header">
          <h2 className="our-story__title">Our Story</h2>
          <p className="our-story__subtitle">
            Meet the heart behind every candle
          </p>
        </div> */}

        <div className="our-story__content">
          {/* Founder Image */}
          <div className="our-story__image-wrapper">
            <img
              className="our-story__image"
              src="https://fajpirmuqtbewsebwkhv.supabase.co/storage/v1/object/public/misc/Saheli.JPG"
              alt="Saheli Chatterjee Ray - Founder of LavyaGlow"
              loading="lazy"
            />
            <div className="our-story__label">
              <span className="our-story__name">Saheli Chatterjee Ray</span>
              <span className="our-story__role">Founder</span>
            </div>
          </div>

          {/* Story Quote */}
          <div className="our-story__text">
            <div className="our-story__quote">
              <svg className="our-story__quote-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
              </svg>
              <blockquote className="our-story__message">
                LavyaGlow was born from a simple love: for thoughtful gifting, for beautiful corners of the home, and for things that feel personal. What started as a few handmade candles given to friends and family quickly turned into something more when people began asking, "Can I buy one?"
                <br /><br />
                We do the work ourselves — each candle is made by us, not resold. Every piece is part of our voice: conceived, crafted, and finished with care from our home in Bangalore.
              </blockquote>
            </div>

              <Button variant="luxury" size="lg"
               onClick={() => navigate('/about')}>
                Read Our Full Story
              </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
