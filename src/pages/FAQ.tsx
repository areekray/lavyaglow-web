export default function FAQ() {

  return (
    <main className="faq-page">
      {/* Header */}
      <section className="faq-page__hero">
        <div className="faq-page__container">
          <header className="faq-page__header">
            <h1 className="faq-page__title">Frequently Asked Questions</h1>
            <p className="faq-page__subtitle">
              Everything important about how we make, pack, and ship LavyaGlow candles.
            </p>
          </header>
        </div>
      </section>

      {/* FAQ grid */}
      <section className="faq-page__section">
        <div className="faq-page__container faq-page__grid">
          <article className="faq-page__card">
            <h2 className="faq-page__q">Are you resellers?</h2>
            <p className="faq-page__a">
              No — we are not resellers. We make our candles ourselves, end to end, in our studio. Each piece is conceived, poured, finished, and packed by us with care.
            </p>
          </article>

          <article className="faq-page__card">
            <h2 className="faq-page__q">How long before my order is dispatched?</h2>
            <p className="faq-page__a">
              Orders typically take 3-4 days to dispatch. Each candle is checked and packed securely to arrive safely and beautifully.
            </p>
          </article>

          <article className="faq-page__card">
            <h2 className="faq-page__q">How do I pay? Is it secure?</h2>
            <p className="faq-page__a">
              Payments are processed securely by Razorpay. Major UPI, cards, and net banking options are supported — your transaction is encrypted and safe.
            </p>
          </article>

          <article className="faq-page__card">
            <h2 className="faq-page__q">Do you take bulk or custom orders?</h2>
            <p className="faq-page__a">
              Yes — for bulk, corporate, or custom gifting, please reach us on WhatsApp or Instagram. We'll help with options, timelines, and packaging.
            </p>
            <div className="faq-page__actions">
              <a
                className="btn btn--luxury btn--lg"
                href="https://wa.me/+919036758208?text=Hi%20LavyaGlow%20Team%20(from%20App)"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
              <a
                className="btn btn--luxury btn--lg"
                href="https://instagram.com/lavyaglow"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </div>
          </article>

          <article className="faq-page__card">
            <h2 className="faq-page__q">Which delivery partners do you use?</h2>
            <p className="faq-page__a">
              We ship primarily with DTDC, and also use Blue Dart, Porter, and Delhivery based on destination and speed. We do not use cheaper, less reliable partners.
            </p>
          </article>

          <article className="faq-page__card">
            <h2 className="faq-page__q">Where are you based?</h2>
            <p className="faq-page__a">
              Bangalore, India. We ship across India with careful packaging for a safe, gift‑ready unboxing.
            </p>
          </article>
        </div>
      </section>

      {/* Help note */}
      <section className="faq-page__section faq-page__note-wrap">
        <div className="faq-page__container">
          <div className="faq-page__note">
            Still have a question? Message us on WhatsApp or Instagram — we're available 9 am to 9 pm (Sunday off).
          </div>
        </div>
      </section>
    </main>
  );
}
