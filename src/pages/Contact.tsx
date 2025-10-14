import { useEffect } from "react";

export default function Contact() {
  useEffect(() => {
    document.title = 'LavyaGlow - Contact Us';
  }, []);

  return (
    <main className="contact-page">
      {/* Header */}
      <section className="contact-page__hero">
        <div className="contact-page__container">
          <header className="contact-page__header">
            <h1 className="contact-page__title">Contact LavyaGlow</h1>
            <p className="contact-page__subtitle">
              A small team in Bangalore, India — here 9 am to 9 pm (Sunday off). Reach out for orders, gifting ideas, or help with anything LavyaGlow.
            </p>
          </header>
        </div>
      </section>

      {/* Primary contact links */}
      <section className="contact-page__section">
        <div className="contact-page__container">
          <div className="contact-page__links">
            <a
              className="btn btn--luxury btn--lg"
              href="https://wa.me/+919036758208?text=Hi%20LavyaGlow%20Team%20(from%20App)"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img style={{marginRight: '0.5rem'}}
                src="https://fajpirmuqtbewsebwkhv.supabase.co/storage/v1/object/public/misc/WhatsApp.svg"
                alt="WhatsApp"
                className="contact-page__icon"
                loading="lazy"
              />
              WhatsApp
            </a>

            <a
              className="btn btn--luxury btn--lg"
              href="https://instagram.com/lavyaglow"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img style={{marginRight: '0.5rem'}}
                src="https://fajpirmuqtbewsebwkhv.supabase.co/storage/v1/object/public/misc/Instagram_logo.svg"
                alt="Instagram"
                className="contact-page__icon"
                loading="lazy"
              />
              Instagram
            </a>
          </div>
        </div>
      </section>

      {/* Info cards */}
      <section className="contact-page__section">
        <div className="contact-page__container contact-page__grid">
          <article className="contact-page__card">
            <h2 className="contact-page__h2">Where we are</h2>
            <p className="contact-page__p">
              Bangalore, India
            </p>
            <p className="contact-page__muted">
              A home‑grown candle studio — shipping across India.
            </p>
          </article>

          <article className="contact-page__card">
            <h2 className="contact-page__h2">Working hours</h2>
            <p className="contact-page__p">
              9:00 am – 9:00 pm
            </p>
            <p className="contact-page__muted">
              Sunday off
            </p>
          </article>

          <article className="contact-page__card">
            <h2 className="contact-page__h2">Email</h2>
            <a
              className="btn btn--luxury btn--lg"
              style={{marginTop: '1rem', textTransform: 'lowercase'}}
              href="mailto:lavgyaglowbysaheli@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              lavgyaglowbysaheli@gmail.com
            </a>
            <p className="contact-page__muted" 
              style={{marginTop: '1rem'}}>
              Replies during working hours.
            </p>
          </article>

          <article className="contact-page__card">
            <h2 className="contact-page__h2">Phone</h2>
            
            <a
              className="btn btn--luxury btn--lg"
              style={{marginTop: '1rem'}}
              href="https://wa.me/+919036758208?text=Hi%20LavyaGlow%20Team%20(from%20App)"
              target="_blank"
              rel="noopener noreferrer"
            >
              +91 9036758208
            </a>
            <p className="contact-page__muted" 
              style={{marginTop: '1rem'}}>
              WhatsApp calls only.
            </p>
          </article>
        </div>
      </section>

      {/* Help note */}
      <section className="contact-page__section contact-page__note-wrap">
        <div className="contact-page__container">
          <div className="contact-page__note">
            For custom gifting, bulk orders, or any order‑related help — send a WhatsApp message, and we’ll reply as soon as possible.
          </div>
        </div>
      </section>
    </main>
  );
}
