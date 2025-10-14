import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = 'LavyaGlow - Our Story';
  }, []);
  return (
    <main className="about-page">
      {/* Header */}
      <section className="about-page__hero">
        <div className="about-page__container">
          <header className="about-page__header">
            <h1 className="about-page__title">About LavyaGlow</h1>
            <p className="about-page__subtitle">
              You didn’t accidentally land here — you found the part of our site that explains why a little flame can hold so much meaning. LavyaGlow began as a whisper of an idea and grew into a small, joy‑filled business that ships beautiful moments across India from our home in Bangalore.
            </p>
          </header>
        </div>
      </section>

      {/* Story + Founder split */}
      <section className="about-page__section">
        <div className="about-page__container about-page__grid">
          <article className="about-page__col">
            <h2 className="about-page__h2">Our Story — small beginnings, steady light</h2>
            <p className="about-page__p">
              LavyaGlow was born from a simple love: for thoughtful gifting, for beautiful corners of the home, and for things that feel personal. What started as a few handmade candles given to friends and family quickly turned into something more when people began asking, “Can I buy one?” Those first smiles, messages and repeat orders were the spark that turned a passion project into a proper little business.
            </p>

            <h2 className="about-page__h2">Meet the Founder — Saheli Chatterjee Ray</h2>
            
            <figure className="about-page__figure">
              {/* Replace with your actual asset path or public storage URL */}
              <img
                className="about-page__img"
                src="https://fajpirmuqtbewsebwkhv.supabase.co/storage/v1/object/public/misc/Saheli.JPG"
                alt="Founder of LavyaGlow, Saheli Chatterjee Ray"
                loading="lazy"
              />
              <figcaption className="about-page__figcaption">
                Saheli Chatterjee Ray — Founder
              </figcaption>
            </figure>
            <p className="about-page__p">
              Saheli is the heart behind LavyaGlow. An MBA in Finance from Christ University, Bangalore, she brings care, precision and a quiet discipline to everything she does. But outside the spreadsheets and strategy, Saheli is an endlessly creative soul — she loves aesthetic décor, thoughtful gifting, and designing moments that feel warm and considered.
            </p>
            <p className="about-page__p">
              After marriage, with encouragement from her husband, she set out to turn a personal passion into something that others could experience. The result is a brand that’s equal parts design‑sense and emotion — a small business built on wholehearted effort and warm feedback from the people who matter most.
            </p>
          </article>

          <aside className="about-page__col">

            <div className="about-page__card">
              <h3 className="about-page__h3">What Makes Our Candles Different</h3>
              <p className="about-page__p">
                We do the work ourselves — LavyaGlow candles are made by us, not resold. Each piece is part of our voice: conceived, made, and finished with care. We believe that a candle should do more than perfume a room — it should lift a mood, mark an occasion, and feel like a tiny, luxurious ritual.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* Built by Us band */}
      <section className="about-page__band">
        <div className="about-page__container about-page__band-grid">
          <div className="about-page__band-left">
            <h2 className="about-page__h2">Built by Us — the app and the maker</h2>
            <p className="about-page__p">
              Just like our candles, this application is an in-house labor of love. The web app was created and is maintained by us — with led by my husband, <b>Areek Ray</b>. 
              You can learn more about him here:<br />
              <a className="btn btn--luxury btn--lg" style={{ marginTop: '1rem' }} href="https://linkedin.com/in/areekray" target="_blank" rel="noopener noreferrer">linkedin.com/in/areekray</a>
            </p>
          </div>
          <div className="about-page__band-right">
            <div className="about-page__note">
              From Bangalore to every corner of India, we send more than a product — we send a little pause, a thoughtful gift, a moment of calm. We make and ship with care, and we stand behind every order with gratitude and attention.
            </div>
          </div>
        </div>
      </section>

      {/* Social CTA */}
      <section className="about-page__cta">
        <div className="about-page__container about-page__cta-grid">
          <div className="about-page__cta-copy">
            <h3 className="about-page__h3">Get to Know Us</h3>
            <p className="about-page__p">
              Follow our day‑to‑day, behind‑the‑scenes, and little launches on Instagram: instagram.com/lavyaglow/
            </p>
          </div>
          <div className="about-page__cta-actions">
            <button className="btn btn--primary btn--lg" onClick={() => navigate('/products')}>Shop candles</button>
            <button className="btn btn--luxury btn--lg" onClick={() => navigate('/contact')}>Contact us</button>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="about-page__closing">
        <div className="about-page__container">
          <p className="about-page__closing-text">
            If you came here looking for more than a candle — for a reason to smile, to gift, or to slow down — we hope LavyaGlow gives you that. Thanks for stopping by our story. Light something small. Feel something big.
          </p>
        </div>
      </section>
    </main>
  );
}
