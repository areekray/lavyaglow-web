import { useEffect } from "react";

export default function Privacy() {
  useEffect(() => {
    document.title = 'LavyaGlow - Privacy Policy';
  }, []);

  return (
    <main className="policy-page">
      <section className="policy-page__hero">
        <div className="policy-page__container">
          <h1 className="policy-page__title">Privacy Policy</h1>
          <p className="policy-page__subtitle">
            This Policy explains what data we collect, why we collect it, and how we protect it when you use LavyaGlow.
          </p>
        </div>
      </section>

      <section className="policy-page__section">
        <div className="policy-page__container policy-page__content">

          <h2>Information We Collect</h2>
          <p>
            We collect information you provide (name, email, phone, billing/shipping address) when you place an order or contact us.
          </p>

          <h2>Payments via Razorpay</h2>
          <p>
            Payments are processed by Razorpay. We do not store your full card or UPI credentials on our servers. Transaction‑related data needed for order confirmation and support may be retained in accordance with tax and accounting laws.
          </p>

          <h2>How We Use Your Information</h2>
          <ul className="policy-page__list">
            <li>To process and fulfill orders, including dispatch and delivery updates.</li>
            <li>To provide customer support and respond to queries.</li>
            <li>To improve our products, website performance, and user experience.</li>
            <li>To comply with legal, regulatory, and tax obligations.</li>
          </ul>

          <h2>Sharing Your Information</h2>
          <p>
            We share only necessary details with delivery partners (e.g., recipient name, address, phone) to deliver your order. We may share data to comply with law or protect our rights. We do not sell your personal data.
          </p>

          <h2>Delivery Partners</h2>
          <p>
            For reliable service, we primarily use DTDC and may also use Blue Dart, Porter, and Delhivery depending on destination and timelines.
          </p>

          <h2>Data Security</h2>
          <p>
            We use reasonable technical and organizational measures to protect your information. However, no method of transmission or storage is 100% secure; we cannot guarantee absolute security.
          </p>

          <h2>Data Retention</h2>
          <p>
            We retain order and payment records for as long as necessary to provide service and meet legal/tax requirements. Contact us if you would like to review or update your information.
          </p>

          <h2>Your Choices</h2>
          <ul className="policy-page__list">
            <li>You may request access, correction, or deletion of certain personal data subject to legal limits.</li>
            <li>You may opt out of non‑essential communications; order and service messages will still be sent.</li>
          </ul>

          <h2>Cookies and Analytics</h2>
          <p>
            Our site may use cookies or similar technologies to enable core functionality (e.g., sessions) and to understand usage patterns. You can control cookies in your browser settings; disabling some cookies may affect site functionality.
          </p>

          <h2>Children’s Privacy</h2>
          <p>
            Our site is intended for general audiences. We do not knowingly collect personal information from children without appropriate consent as required by law.
          </p>

          <h2>International Transfers</h2>
          <p>
            Our services are intended for India. If data is processed or stored outside India by our service providers, we take reasonable steps to ensure appropriate protections are in place.
          </p>

          <h2>Updates to this Policy</h2>
          <p>
            We may update this Policy periodically. Changes are effective when posted on this page. Your continued use after changes indicates acceptance of the updated Policy.
          </p>

          <h2>Contact</h2>
          <p>
            For privacy queries or requests, contact us via WhatsApp/Instagram or email: lavyaglow.gmail.com. Working hours: 9 am–9 pm, Sunday off.
          </p>

        </div>
      </section>
    </main>
  );
}
